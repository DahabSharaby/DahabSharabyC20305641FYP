// //AIzaSyCWeOzm7cbHRlxg8lf09CBtAH-nbcu4e-4
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import firebase from "firebase/compat";
import { db, auth } from "../firebase";
import "firebase/compat/storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import DeleteProductButton from "../components/DeleteProductButton";
import { useNavigation } from "@react-navigation/native";

const ScanScreen = ({ route }) => {
  const [imageUri, setImageUri] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState(new Date());
  const [productList, setProductList] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customerNameStatus, setCustomerNameStatus] = useState(false);
  const [customerAddressStatus, setCustomerAddressStatus] = useState(false);
  const [phoneNumberStatus, setPhoneNumberStatus] = useState(false);
  const [customerExists, setCustomerExists] = useState(true);
  const [productExists, setProductExists] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const generateNumber = async () => {
      const generatedNumber = await generateInvoiceNumber();
      setInvoiceNumber(generatedNumber);
    };

    generateNumber();

    if (route.params.source === "camera") {
      takePicture();
    } else if (route.params.source === "gallery") {
      pickImage();
    }
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri) => {
    try {
      const apiKey = "AIzaSyCWeOzm7cbHRlxg8lf09CBtAH-nbcu4e-4";
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const base64ImageData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);
      const detectedText =
        apiResponse.data.responses[0].fullTextAnnotation.text;

      const nameIndex = detectedText.toLowerCase().indexOf("name -");
      if (nameIndex !== -1) {
        const startName = nameIndex + "name -".length;
        const nameValue = detectedText
          .substring(startName)
          .split("\n")[0]
          .trim();
        setCustomerName(nameValue);
        setCustomerNameStatus(!!nameValue);
      }

      const addressIndex = detectedText.toLowerCase().indexOf("address -");
      if (addressIndex !== -1) {
        const startAddress = addressIndex + "address -".length;
        const addressValue = detectedText
          .substring(startAddress)
          .split("\n")[0]
          .trim();
        setCustomerAddress(addressValue);
        setCustomerAddressStatus(!!addressValue);
      }

      const phoneIndex = detectedText.toLowerCase().indexOf("phone -");
      if (phoneIndex !== -1) {
        const startPhone = phoneIndex + "phone -".length;
        const phoneValue = detectedText
          .substring(startPhone)
          .split("\n")[0]
          .trim();
        setPhoneNumber(phoneValue);
        setPhoneNumberStatus(!!phoneValue);
      }

      const items = parseHandwrittenList(detectedText);
      setProductList(items);
      items.forEach(async (item) => {
        const productDoc = await db
          .collection("products")
          .doc(item.name.toLowerCase())
          .get();
        if (productDoc.exists) {
          console.log("product check", productDoc.exists);
        }
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert("Text extraction failed. Please try again.");
    }
  };

  const parseHandwrittenList = (text) => {
    const items = [];
    const lines = text.split("\n");
    for (const line of lines) {
      const parts = line.split(",");
      if (parts.length === 3) {
        const name = parts[0].replace(/^\d+\.\s*/, "").trim();
        const price = parseFloat(parts[1].replace("€", ""));
        const quantity = parseFloat(parts[2].trim());
        items.push({ name, price, quantity });
      }
    }
    return items;
  };

  const handleSaveInvoice = async () => {
    try {
      if (
        customerName.trim() === "" ||
        customerAddress.trim() === "" ||
        phoneNumber.trim() === "" ||
        productList.length === 0 ||
        !imageUri
      ) {
        Alert.alert(
          "Please fill in all customer details, add at least one product, and capture/select an image"
        );
        return;
      }

      // Upload the image to Firebase Storage
      const imageFileName = `invoice_${Date.now()}.jpg`;
      const storageRef = firebase.storage().ref(`invoices/${imageFileName}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await storageRef.put(blob);

      const downloadURL = await storageRef.getDownloadURL();

      // Check if the customer exists
      const trimmedCustomerName = customerName.trim();
      const customerSnapshot = await db
        .collection("customers")
        .where("customerName", "==", trimmedCustomerName)
        .get();
      const customerExists = !customerSnapshot.empty;

      if (!customerExists) {
        Alert.alert(
          "Customer does not exist",
          "Do you want to add a new customer or edit the name?",
          [
            {
              text: "Add Customer",
              onPress: () => navigation.navigate("Customer"),
            },
            {
              text: "Edit Name",
              onPress: () => setCustomerName(""),
            },
          ]
        );
        return;
      }

      // Check if all products exist
      const productExistencePromises = productList.map(async (product) => {
        const productSnapshot = await db
          .collection("products")
          .where("productName", "==", product.name)
          .get();
        const productExists = !productSnapshot.empty;
        return productExists;
      });

      const productsExist = await Promise.all(productExistencePromises);

      if (productsExist.includes(false)) {
        Alert.alert("One or more products do not exist");
        return;
      }

      const total = calculateTotal();
      const currentUser = auth.currentUser;
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
        date,
        productList,
        total,
        imageURL: downloadURL,
      };

      await db.collection("invoices").doc(invoiceNumber).set(invoiceData);
      Alert.alert("Invoice details saved successfully!", "", [
        {
          text: "OK",
          onPress: () => {
            setCustomerName("");
            setCustomerAddress("");
            setPhoneNumber("");
            setDate(new Date());
            setProductList([]);
            setInvoiceNumber("");
            setImageUri(null);

            navigation.navigate("Main");
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving invoice details:", error);
      Alert.alert("Failed to save invoice details.");
    }
  };

  const generateInvoiceNumber = async () => {
    while (true) {
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      const generatedInvoiceNumber = `INV${randomNumber}`;
      const invoiceSnapshot = await db
        .collection("invoices")
        .doc(generatedInvoiceNumber)
        .get();
      if (!invoiceSnapshot.exists) {
        setInvoiceNumber(generatedInvoiceNumber);
        return generatedInvoiceNumber;
      }
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const addProduct = () => {
    const newProduct = { name: "", price: "", quantity: "" };
    setProductList([...productList, newProduct]);
  };

  const updateProduct = (index, field, value) => {
    const updatedProductList = [...productList];
    updatedProductList[index][field] = value;
    setProductList(updatedProductList);
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

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <Text style={styles.label}>Invoice Number: {invoiceNumber}</Text>

        <TouchableOpacity onPress={handleDatePress}>
          <Text style={styles.label}>Date: {date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.fieldContainer}>
          <Text style={{ color: customerNameStatus ? "green" : "red" }}>
            {customerNameStatus ? "✓" : "✗"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            value={customerName}
            onChangeText={(text) => {
              setCustomerName(text);
              setCustomerNameStatus(!!text);
            }}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={{ color: customerAddressStatus ? "green" : "red" }}>
            {customerAddressStatus ? "✓" : "✗"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Customer Address"
            value={customerAddress}
            onChangeText={(text) => {
              setCustomerAddress(text);
              setCustomerAddressStatus(!!text);
            }}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={{ color: phoneNumberStatus ? "green" : "red" }}>
            {phoneNumberStatus ? "✓" : "✗"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setPhoneNumberStatus(!!text);
            }}
          />
        </View>

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
                onChangeText={(text) => updateProduct(index, "name", text)}
              />
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

        <TouchableOpacity style={styles.button} onPress={handleSaveInvoice}>
          <Text style={styles.text}>Save Invoice</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Total: {calculateTotal()}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Customer")}
        >
          <Text style={styles.text}>Add Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Product")}
        >
          <Text style={styles.text}>Add Product</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: "100%",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 10,
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
    textAlign: "center",
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

export default ScanScreen;
