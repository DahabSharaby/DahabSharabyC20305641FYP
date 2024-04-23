import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DeleteProductButton from "../components/DeleteProductButton";
import { db, auth } from "../firebase";

export function InputScreen({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [productList, setProductList] = useState([]);
  const [suggestedCustomers, setSuggestedCustomers] = useState([]);
  const [temporaryQuantities, setTemporaryQuantities] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const collectionRef = db.collection("customers");
        const querySnapshot = await collectionRef.get();

        const data = [];
        querySnapshot.forEach((doc) => {
          const customerDetails = {
            id: doc.id,
            name: doc.data().customerName,
            address: doc.data().customerAddress,
            phoneNumber: doc.data().phoneNumber,
          };
          data.push(customerDetails);
        });

        setCustomerData(data);
      } catch (error) {
        console.error("Firestore Error:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerNameChange = (text) => {
    setCustomerName(text);

    if (text.length > 0) {
      const filteredCustomers = customerData.filter((customer) =>
        customer.name.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestedCustomers(filteredCustomers);
    } else {
      setSuggestedCustomers([]);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (companyID && customerName.length > 0) {
          const collectionRef = db
            .collection("products")
            .where("companyID", "==", companyID);
          const querySnapshot = await collectionRef.get();

          const data = [];
          querySnapshot.forEach((doc) => {
            const productDetails = {
              id: doc.id,
              name: doc.data().productName,
              price: doc.data().productPrice,
            };
            data.push(productDetails);
          });

          setSuggestedProducts(data);
        }
      } catch (error) {
        console.error("Firestore Error:", error);
      }
    };

    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser, customerName]);

  useEffect(() => {
    const generatedInvoiceNumber = generateInvoiceNumber();
    setInvoiceNumber(generatedInvoiceNumber);
    console.log("inv num", invoiceNumber);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const generateInvoiceNumber = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `INV${randomNumber}`;
  };

  const addProduct = () => {
    const newProduct = { name: "", price: "", quantity: "" };
    setProductList([...productList, newProduct]);
  };

  const updateProduct = (index, field, value) => {
    const updatedProductList = [...productList];
    updatedProductList[index][field] = value;
    setProductList(updatedProductList);

    if (field === "name") {
      setSuggestedProducts([]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    productList.forEach((product) => {
      total += product.price * product.quantity;
    });
    return total.toFixed(2);
  };

  const handleDeleteProduct = (index) => {
    const updatedProductList = [...productList];
    updatedProductList.splice(index, 1);
    setProductList(updatedProductList);
  };

  const handleSaveInvoice = async () => {
    try {
      if (
        customerName.trim() === "" ||
        customerAddress.trim() === "" ||
        phoneNumber.trim() === "" ||
        productList.length === 0
      ) {
        Alert.alert(
          "Please fill in all customer details and add at least one product"
        );
        return;
      }

      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

      if (!companyID) {
        Alert.alert("Company ID not found for the current user.");
        return;
      }

      const invoiceData = {
        invoiceNumber: invoiceNumber,
        companyID: companyID,
        customerName,
        customerAddress,
        phoneNumber,
        date: selectedDate,
        productList,
        total: calculateTotal(),
      };

      await db.collection("invoices").doc(invoiceNumber).set(invoiceData);

      Alert.alert("Invoice details saved successfully!", "", [
        {
          text: "OK",
          onPress: () => {
            setCustomerName("");
            setCustomerAddress("");
            setPhoneNumber("");
            setSelectedDate(new Date());
            setProductList([]);
            setInvoiceNumber("");

            navigation.navigate("Main");
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving invoice details:", error);
      Alert.alert("Failed to save invoice details.");
    }
  };

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCustomerSelection(item)}>
      <Text style={styles.suggestedCustomersItem}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleCustomerSelection = async (selectedCustomer) => {
    try {
      setCustomerName(selectedCustomer.name);
      setCustomerAddress(selectedCustomer.address);
      setPhoneNumber(selectedCustomer.phoneNumber);
      setSuggestedCustomers([]);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);

    if (currentDate > new Date()) {
      Alert.alert("Please select a date in the past.");
      setSelectedDate(new Date());
    } else {
      setSelectedDate(currentDate);
    }
  };

  const getTotalAmount = () => {
    return (
      <View style={styles.totalAmountContainer}>
        <Text style={styles.totalAmountText}>
          Total Amount: €
          {productList
            .reduce(
              (total, product) =>
                total +
                parseFloat(product.price) *
                  parseFloat(
                    product.quantity || temporaryQuantities[product.name] || 0
                  ),
              0
            )
            .toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Text style={styles.text}>{invoiceNumber}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text>{selectedDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}
        <TextInput
          placeholder="Customer Name"
          value={customerName}
          onChangeText={handleCustomerNameChange}
          style={styles.input}
        />
        {suggestedCustomers.length > 0 && renderCustomerItem && (
          <FlatList
            data={suggestedCustomers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id}
            style={styles.suggestedCustomerList}
          />
        )}
        <TextInput
          placeholder="Customer Address"
          value={customerAddress}
          onChangeText={(text) => setCustomerAddress(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <ScrollView style={styles.productListContainer}>
          <Text style={styles.text}>Products list :</Text>
          {productList.map((item, index) => (
            <View style={styles.productBox} key={index}>
              <Text>Product {index + 1}:</Text>
              <DeleteProductButton
                index={index}
                onDelete={handleDeleteProduct}
              />

              <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={item.name}
                onChangeText={(text) => {
                  updateProduct(index, "name", text);
                  const filteredProducts = suggestedProducts.filter((product) =>
                    product.name.toLowerCase().includes(text.toLowerCase())
                  );
                  setSuggestedProducts(filteredProducts);
                }}
              />
              {item.name.length > 0 && (
                <FlatList
                  data={suggestedProducts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item: product }) => (
                    <TouchableOpacity
                      onPress={() => {
                        updateProduct(index, "name", product.name);
                        updateProduct(index, "price", product.price.toString());
                      }}
                    >
                      <Text>{product.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={item.price.toString()}
                onChangeText={(text) =>
                  updateProduct(index, "price", text.replace(/[^0-9.]/g, ""))
                }
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Quantity"
                value={item.quantity.toString()}
                onChangeText={(text) =>
                  updateProduct(index, "quantity", text.replace(/[^0-9.]/g, ""))
                }
                keyboardType="decimal-pad"
              />
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={addProduct}>
          <Text style={styles.text}>Add Product</Text>
        </TouchableOpacity>
        <Text>{getTotalAmount()}</Text>
        <Button title="Save Invoice" onPress={handleSaveInvoice} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  input: {
    borderWidth: 1,
    width: "80%",
    marginVertical: 8,
    padding: 10,
  },

  suggestedProductList: {
    width: "100%",
    marginTop: 5,
    borderColor: "gray",
    borderWidth: 1,
  },
  suggestedCustomerList: {
    width: "80%",
    marginTop: 5,
    maxHeight: 100,
    borderColor: "gray",
    borderWidth: 1,
  },

  suggestedCustomersItem: {
    padding: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },

  totalAmountContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "lightblue",
    padding: 15,
    margin: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    //textAlign: "center",
    width: "100%",
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  productListContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    width: "100%",
  },
  productBox: {
    borderWidth: 2,
    padding: 15,
  },
});

export default InputScreen;
