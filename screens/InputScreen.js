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
  Switch,
  Platform,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DeleteProductButton from "../components/DeleteProductButton";
import { db, auth } from "../firebase";

export function InputScreen({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [productList, setProductList] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);

  useEffect(() => {
    const generatedInvoiceNumber = generateInvoiceNumber();
    setInvoiceNumber(generatedInvoiceNumber);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (companyID) {
          const collectionRef = db
            .collection("customers")
            .where("companyID", "==", companyID);
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
        }
      } catch (error) {
        console.error("Firestore Error:", error);
      }
    };

    if (currentUser) {
      fetchCustomers();
    }
  }, [currentUser]);

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

          setProductData(data);
        }
      } catch (error) {
        console.error("Firestore Error:", error);
      }
    };

    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser, customerName]);

  const generateInvoiceNumber = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `INV${randomNumber}`;
  };

  const addProduct = () => {
    const newProduct = { name: "", price: "", quantity: "" };
    setProductList([...productList, newProduct]);
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

  const validateProductNames = async () => {
    try {
      for (const product of productList) {
        const productDoc = await db
          .collection("products")
          .where("productName", "==", product.name)
          .get();
        if (productDoc.empty) {
          return { valid: false, name: product.name };
        }
      }
      return { valid: true };
    } catch (error) {
      console.error("Error validating product names:", error);
      return { valid: false };
    }
  };

  const validateProductPrices = async () => {
    try {
      for (const product of productList) {
        const productDoc = await db
          .collection("products")
          .where("productName", "==", product.name)
          .get();
        if (!productDoc.empty) {
          const productData = productDoc.docs[0].data();
          if (
            parseFloat(productData.productPrice) !== parseFloat(product.price)
          ) {
            return { valid: false, name: product.name };
          }
        }
      }
      return { valid: true };
    } catch (error) {
      console.error("Error validating product prices:", error);
      return { valid: false };
    }
  };

  const handleSaveInvoice = async () => {
    try {
      if (customerName.trim() === "" || productList.length === 0) {
        Alert.alert(
          "Please fill in all customer details and add at least one product"
        );
        return;
      }

      const matchedCustomer = customerData.find(
        (customer) =>
          customer.name.toLowerCase() === customerName.toLowerCase()
      );
      if (!matchedCustomer) {
        Alert.alert("Customer not found. Please add the customer first.");
        return;
      }

      const nameValidation = await validateProductNames();
      if (!nameValidation.valid) {
        Alert.alert(
          `Invalid product name "${nameValidation.name}". Please enter the correct product name.`
        );
        return;
      }

      const priceValidation = await validateProductPrices();
      if (!priceValidation.valid) {
        Alert.alert(
          `Invalid price for product "${priceValidation.name}". Please enter the correct price.`
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
        customerAddress: matchedCustomer.address,
        phoneNumber: matchedCustomer.phoneNumber,
        date: selectedDate,
        productList,
        total: calculateTotal(),
        status: isPaid ? "paid" : "unpaid",
      };

      await db.collection("invoices").doc(invoiceNumber).set(invoiceData);

      Alert.alert("Invoice details saved successfully!", "", [
        {
          text: "OK",
          onPress: () => {
            setCustomerName("");
            setSelectedDate(new Date());
            setProductList([]);
            setInvoiceNumber("");
            setIsPaid(false);
            navigation.navigate("Main");
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving invoice details:", error);
      Alert.alert("Failed to save invoice details.");
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

  const updateProduct = (index, field, value) => {
    const updatedProductList = [...productList];
    updatedProductList[index][field] = value;
    setProductList(updatedProductList);
  };

  const handleCustomerChange = (text) => {
    setCustomerName(text);
    const selectedCustomer = customerData.find(
      (customer) => customer.name.toLowerCase() === text.toLowerCase()
    );
    if (selectedCustomer) {
      setSelectedCustomerDetails(selectedCustomer);
    } else {
      setSelectedCustomerDetails(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Create New Invoice</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice Number:</Text>
              <Text style={styles.text}>{invoiceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Select Date:</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            <View style={styles.paymentStatusContainer}>
              <Text style={styles.paymentStatusText}>Paid:</Text>
              <Switch
                value={isPaid}
                onValueChange={(value) => setIsPaid(value)}
                style={styles.switch}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Customer Name"
                value={customerName}
                onChangeText={handleCustomerChange}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("Customer")}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productListContainer}>
              <FlatList
                data={productList}
                renderItem={({ item, index }) => (
                  <View style={styles.productBox} key={index}>
                    <Text>Product {index + 1}:</Text>
                    <DeleteProductButton
                      index={index}
                      onDelete={handleDeleteProduct}
                    />
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Product Name"
                        value={item.name}
                        onChangeText={(text) => {
                          const updatedProductList = [...productList];
                          updatedProductList[index].name = text;
                          setProductList(updatedProductList);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate("Product")}
                      >
                        <Text style={styles.addButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
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
                        updateProduct(
                          index,
                          "quantity",
                          text.replace(/[^0-9.]/g, "")
                        )
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={addProduct}>
              <Text style={styles.buttonText}>Add Product</Text>
            </TouchableOpacity>
            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountText}>
                Total Amount: € {calculateTotal()}
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSaveInvoice}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    width: "100%",
    top : 30,
  },
  content: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    width: "30%",
  },
  text: {
    fontSize: 16,
    width: "30%",
    borderWidth: 1,
    padding: 10,
  },
  dateText: {
    fontSize: 16,
    borderWidth: 1,
    padding: 10,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    width: "100%",
    marginVertical: 8,
    padding: 10,
  },
  addButton: {
    position: "absolute",
    right: 10,
    top: 12,
    backgroundColor: "lightblue",
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "lightblue",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
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
  productListContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  productBox: {
    borderWidth: 2,
    padding: 15,
    marginBottom: 10,
  },
  paymentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  paymentStatusText: {
    fontSize: 16,
    marginRight: 10,
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
  },
});

export default InputScreen;
