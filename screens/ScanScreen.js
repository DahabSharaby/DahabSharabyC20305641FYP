import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { db, auth } from '../firebase';

const ScanScreen = ({ route, navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [total, setTotal] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    if (route.params.source === 'camera') {
      takePicture();
    } else if (route.params.source === 'gallery') {
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

    if (!result.cancelled) {
      setImageUri(result.uri);
      analyzeImage(result.uri);
    }
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      analyzeImage(result.uri);
    }
  };

  const analyzeImage = async (uri) => {
    try {
      const apiKey = 'AIzaSyBJ3FyjJzcNMApNqb7itGQBGP4wE6BO5bI';
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
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);
      const detectedText = apiResponse.data.responses[0].fullTextAnnotation.text;

      setRecognizedText(detectedText);

      const nameIndex = detectedText.toLowerCase().indexOf('Customer Name');
      if (nameIndex !== -1) {
        const startName = nameIndex + 'Customer Name'.length;
        const nameValue = detectedText.substring(startName).split('\n')[0].trim();
        setCustomerName(nameValue);
      }
      const addressIndex = detectedText.toLowerCase().indexOf('Customer address');
      if (addressIndex !== -1) {
        const startAddress = addressIndex + 'Customer address'.length;
        const addressValue = detectedText.substring(startAddress).split('\n')[0].trim();
        setCustomerAddress(addressValue);
      }

      const phoneIndex = detectedText.toLowerCase().indexOf('Phone Number');
      if (phoneIndex !== -1) {
        const startPhone = phoneIndex + 'Phone Number'.length;
        const phoneValue = detectedText.substring(startPhone).split('\n')[0].trim();
        setPhoneNumber(phoneValue);
      }

      const productNameIndex = detectedText.toLowerCase().indexOf('Product name');
      if (productNameIndex !== -1) {
        const startProductName = productNameIndex + 'Product name'.length;
        const productNameValue = detectedText.substring(startProductName).split('\n')[0].trim();
        setProductName(productNameValue);
      }

      const quantityIndex = detectedText.toLowerCase().indexOf('Quantity');
      if (quantityIndex !== -1) {
        const startQuantity = quantityIndex + 'Quantity'.length;
        const quantityValue = detectedText.substring(startQuantity).split('\n')[0].trim();
        setQuantity(quantityValue);
      }

      const priceIndex = detectedText.toLowerCase().indexOf('price');
      if (priceIndex !== -1) {
        const startPrice = priceIndex + 'price'.length;
        const priceValue = detectedText.substring(startPrice).split('\n')[0].trim();
        setPrice(priceValue);
      }

      const totalIndex = detectedText.toLowerCase().indexOf('total');
      if (totalIndex !== -1) {
        const startTotal = totalIndex + 'total'.length;
        const totalValue = detectedText.substring(startTotal).split('\n')[0].trim();
        setTotal(totalValue);
      }

      let invoiceNumberValue = '';
      const invoiceNumberIndex = detectedText.toLowerCase().indexOf('invoice number');
      if (invoiceNumberIndex !== -1) {
        const startInvoiceNumber = invoiceNumberIndex + 'invoice number'.length;
        invoiceNumberValue = detectedText.substring(startInvoiceNumber).split('\n')[0].trim();
      } else {
        invoiceNumberValue = generateInvoiceNumber();
      }
      setInvoiceNumber(invoiceNumberValue);

    } catch (error) {
      console.error('Error analyzing image:', error.response ? error.response.data : error.message);
      alert('Error analyzing image. Please try again.');
    }
  };

  const generateInvoiceNumber = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `INV${randomNumber}`;
  };

  const getCurrentUserCompanyID = async () => {
    try {
      const currentUser = auth.currentUser;
  
      if (currentUser) {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          return userData.companyID; 
        } else {
          console.error('User document not found.');
          return null;
        }
      } else {
        console.error('User not authenticated.');
        return null;
      }
    } catch (error) {
      console.error('Error getting user company ID:', error);
      return null;
    }
  };
  
  const saveInvoiceToFirestore = async () => {
    try {
      const currentUser = auth.currentUser;
      const userId = currentUser ? currentUser.uid : null;
  
      if (!userId) {
        alert('User not authenticated. Please login.');
        return;
      }
  
      if (!customerName || !customerAddress || !productName || !quantity || !price || !phoneNumber || !total || !invoiceNumber) {
        alert('Please fill in all the required fields.');
        return;
      }
  
      const companyID = await getCurrentUserCompanyID();
      if (!companyID) {
        alert('Error getting user company ID. Please try again.');
        return;
      }
  
      const invoiceData = {
        userId,
        companyID,
        customerName,
        customerAddress,
        productName,
        quantity,
        price,
        phoneNumber,
        total,
        invoiceNumber,
        recognizedText,
      };
  
      await db.collection('invoices').add(invoiceData);
      alert('Invoice data saved to Firestore!');
      navigation.goBack(); 
    } catch (error) {
      console.error('Error saving invoice to Firestore:', error);
      alert('Error saving invoice data. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <TextInput
          style={styles.input}
          placeholder="Customer Name"
          value={customerName}
          onChangeText={(text) => setCustomerName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Customer Address"
          value={customerAddress}
          onChangeText={(text) => setCustomerAddress(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={productName}
          onChangeText={(text) => setProductName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={quantity}
          onChangeText={(text) => setQuantity(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={price}
          onChangeText={(text) => setPrice(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Total"
          value={total}
          onChangeText={(text) => setTotal(text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Invoice Number"
          value={invoiceNumber}
          onChangeText={(text) => setInvoiceNumber(text)}
        />

        <TouchableOpacity style={styles.button} onPress={saveInvoiceToFirestore}>
          <Text style={styles.text}>Save Invoice</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'lightblue',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    padding: 10,
  },
});

export default ScanScreen;
