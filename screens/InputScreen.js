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
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from "../firebase";

export function InputScreen({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [suggestedCustomers, setSuggestedCustomers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
        console.log("Fetched customers:", data);
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
        const collectionRef = db.collection("products");
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
        console.log("Fetched products:", data);
      } catch (error) {
        console.error("Firestore Error:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleAddProduct = () => {
    setModalVisible(true);
  };

  const handleProductSelection = (product) => {
    const newProduct = { ...product, quantity: "1" };
    setProducts([...products, newProduct]);
    setModalVisible(false);
  };

  const generateInvoiceNumber = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `INV${randomNumber}`;
  };

  const handleSaveInvoice = async () => {
    try {
      // Check if customer details are filled
      if (
        customerName.trim() === "" ||
        customerAddress.trim() === "" ||
        phoneNumber.trim() === ""
      ) {
        Alert.alert("Please fill in all customer details");
        return;
      }

      // Check if products are added
      if (products.length === 0) {
        Alert.alert("Please add products to the invoice");
        return;
      }

      const totalAmount = products.reduce(
        (total, product) =>
          total + parseFloat(product.price) * parseFloat(product.quantity),
        0
      );

      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

      if (!companyID) {
        Alert.alert("Company ID not found for the current user");
        return;
      }

      const generatedInvoiceNumber = generateInvoiceNumber();

      const invoiceData = {
        invoiceNumber: generatedInvoiceNumber,
        companyID,
        customerName,
        customerAddress,
        phoneNumber: parseFloat(phoneNumber),
        date: selectedDate,
        totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure total amount is rounded to 2 decimal places
      };

      await db
        .collection("invoices")
        .doc(generatedInvoiceNumber)
        .set(invoiceData);

      products.forEach(async (product) => {
        await db
          .collection("invoices")
          .doc(generatedInvoiceNumber)
          .collection("products")
          .add({
            productName: product.name,
            productPrice: parseFloat(product.price),
            quantity: parseFloat(product.quantity),
          });
      });

      setCustomerName("");
      setCustomerAddress("");
      setPhoneNumber("");
      setDate(new Date());
      setProducts([]);

      Alert.alert("Invoice details saved successfully!");
      console.log("Invoice details saved:", invoiceData);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      Alert.alert("Failed to save invoice details.");
    }
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductSelection(item)}>
      <View style={styles.productContainer}>
        <Text>{item.name}</Text>
        <Text>{item.price}</Text>
        <TextInput
          placeholder="Quantity"
          onChangeText={(text) => {
            const newProducts = products.map((p) =>
              p.id === item.id ? { ...p, quantity: text } : p
            );
            setProducts(newProducts);
          }}
          keyboardType="numeric"
          style={styles.quantityInput}
        />
        <Button title="Add" onPress={() => handleProductSelection(item)} />
      </View>
    </TouchableOpacity>
  );

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

    // Prevent selecting future dates
    if (currentDate > new Date()) {
      Alert.alert("Please select a date in the past.");
      setSelectedDate(new Date());
    } else {
      setSelectedDate(currentDate);
    }
  };

  const getTotalAmount = () => {
    return products
      .reduce(
        (total, product) =>
          total + parseFloat(product.price) * parseFloat(product.quantity),
        0
      )
      .toFixed(2); // Round to 2 decimal places
  };

  return (
    <View style={styles.container}>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={suggestedProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              style={styles.suggestedProductList}
            />
            <Button title="Close" onPress={handleCloseModal} />
          </View>
        </View>
      </Modal>
      <TextInput
        placeholder="Customer Name"
        value={customerName}
        onChangeText={handleCustomerNameChange}
        style={styles.input}
      />
      <FlatList
        data={suggestedCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        style={styles.suggestedCustomerList}
      />
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
      {/* FlatList to display selected products with name, price, and quantity */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
            <Text>{item.quantity}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Text>Total Amount: ${getTotalAmount()}</Text>

      {/* Display total amount */}
      <Button title="Add Product" onPress={handleAddProduct} />
      <Button title="Save Invoice" onPress={handleSaveInvoice} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    borderWidth: 1,
    width: "80%",
    marginVertical: 8,
    padding: 10,
  },
  quantityInput: {
    borderWidth: 1,
    width: "20%",
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
  productContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  suggestedCustomersItem: {
    padding: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
});

export default InputScreen;
