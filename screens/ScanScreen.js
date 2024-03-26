import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { db, auth } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [customerNameStatus, setCustomerNameStatus] = useState(false);
  const [phoneNumberStatus, setPhoneNumberStatus] = useState(false);
  const [customerAddressStatus, setCustomerAddressStatus] = useState(false);
  const [productNameStatus, setProductNameStatus] = useState(false);
  const [quantityStatus, setQuantityStatus] = useState(false);
  const [priceStatus, setPriceStatus] = useState(false);
  const [totalStatus, setTotalStatus] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState('');
  const [date, setDate] = useState(new Date());
  const [productList, setProductList] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      const apiKey = 'AIzaSyCWeOzm7cbHRlxg8lf09CBtAH-nbcu4e-4';
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
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);
      const detectedText = apiResponse.data.responses[0].fullTextAnnotation.text;

      setRecognizedText(detectedText);
      console.log("Response = "+detectedText)

      const nameIndex = detectedText.toLowerCase().indexOf('name -');
      if (nameIndex !== -1) {
        const startName = nameIndex + 'name -'.length;
        const nameValue = detectedText.substring(startName).split('\n')[0].trim();
        setCustomerName(nameValue);
        setCustomerNameStatus(!!nameValue);
      }
      const addressIndex = detectedText.toLowerCase().indexOf('address -');
      if (addressIndex !== -1) {
        const startAddress = addressIndex + 'address -'.length;
        const addressValue = detectedText.substring(startAddress).split('\n')[0].trim();
        setCustomerAddress(addressValue);
        setCustomerAddressStatus(!!addressValue);
      }

      const phoneIndex = detectedText.toLowerCase().indexOf('phone -');
      if (phoneIndex !== -1) {
        const startPhone = phoneIndex + 'phone -'.length;
        const phoneValue = detectedText.substring(startPhone).split('\n')[0].trim();
        setPhoneNumber(phoneValue);
        setPhoneNumberStatus(!!phoneValue);
      }

const parseList = (productValue) => {
  console.log("Parsing product list...");
  const parsedItems = [];
 //parsedItems.push("Products , ")
  console.log(parsedItems)
  //const regex = /(?:\d+\.\s*)?(.*?),\s*(\d+),\s*(€\d+)/g; 
  const regex = /(\w+\s*)(,?\s*)([€$£]?\d+(,\d+)*)\s*(\d+)/g;
 // const regex = /(\w+\s*)(,\s*)([€$£]?\d+(,\d+)*)\s*(\d+)/g;
 // const regex = /(\s*[a-zA-Z]+\s*)(,*)([€$£]*\d+)(,*)\s*(\d+)/g;
  //const regex = /\b[1-5]\. (.+)/g;
  ///(\s*[a-zA-Z]+\s*)(,*)([€$£]*[1-5]\.)(,*)\s*(\d+)/g;
//.replace("€", " ").replace("£","")
  let match;
  while ((match = regex.exec(productValue)) !== null) { 
    const name = match[1];
    console.log("match 1 " ,match[1])
    console.log("match 2 " , match[1],match[3],match[5])
    const price = parseInt(match[3].replace(/[€$£]/g, '')) // Removing currency symbols
    const quantity = parseInt(match[5]);
    parsedItems.push([name, price,quantity]);
    console.log("Processed product:", name, price, quantity);
  }
  console.log("Product:", parsedItems);
  setProductList(parsedItems);
  console.log("Product list parsed successfully:", parsedItems);
};

// const productIndex = detectedText.toLowerCase().indexOf('products');
// console.log("in text.", productIndex );
// if (productIndex !== -1) {
//   console.log("Products detected in text.");
//   const startProduct = productIndex + 'products'.length;
//   console.log("hellooo" , startProduct)
//   const productValue = detectedText.substring(startProduct)
//    .split(/\d+\.\s*/) // 1. 
//     //.split(/\n/)
//    .map(item => item.trim())
//    .filter(Boolean)
//     .join(' ');
//   console.log("Extracted product value from text:", productValue);
//   setProductList([productValue]);
//   console.log("Product list set:", productValue);
//   parseList(productValue);
// }

const productIndex = detectedText.toLowerCase().indexOf('products');
console.log("in text.", productIndex );
if (productIndex !== -1) {
  console.log("Products detected in text.");
  const productValue = detectedText.split(/\n/).slice(1).join(' ');
  console.log("Extracted product value from text:", productValue);
  setProductList([productValue]);
  console.log("Product list set:", productValue);
  parseList(productValue);
}

      const productNameIndex = detectedText.toLowerCase().indexOf('product name');
      if (productNameIndex !== -1) {
        const startProductName = productNameIndex + 'product name'.length;
        const productNameValue = detectedText.substring(startProductName).split('\n')[0].trim();
        setProductName(productNameValue);
        setProductNameStatus(!!productNameValue);
      }

      const quantityIndex = detectedText.toLowerCase().indexOf('quantity');
      if (quantityIndex !== -1) {
        const startQuantity = quantityIndex + 'quantity'.length;
        const quantityValue = detectedText.substring(startQuantity).split('\n')[0].trim();
        setQuantity(quantityValue);
        setQuantityStatus(!!quantityValue);
      }

      const priceIndex = detectedText.toLowerCase().indexOf('price');
      if (priceIndex !== -1) {
        const startPrice = priceIndex + 'price'.length;
        const priceValue = detectedText.substring(startPrice).split('\n')[0].trim();
        setPrice(priceValue);
        setPriceStatus(!!priceValue);
      }

      const totalIndex = detectedText.toLowerCase().indexOf('total');
      if (totalIndex !== -1) {
        const startTotal = totalIndex + 'total'.length;
        const totalValue = detectedText.substring(startTotal).split('\n')[0].trim();
        setTotal(totalValue);
        setTotalStatus(!!totalValue);
      }

      let invoiceNumberValue = '';
      const invoiceNumberIndex = detectedText.toLowerCase().indexOf('invoice number');
      if (invoiceNumberIndex !== -1) {
        const startInvoiceNumber = invoiceNumberIndex + 'invoice number'.length;
        invoiceNumberValue = detectedText.substring(startInvoiceNumber).split('\n')[0].trim();
      }

      setInvoiceNumber(invoiceNumberValue || generateInvoiceNumber());
      setExtractionMessage('Text extracted successfully!');

    } catch (error) {
      console.error('Error analyzing image:', error.response ? error.response.data : error.message);
      setExtractionMessage('Text extraction failed. Please try again.');
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

      const numericQuantity = parseFloat(quantity);
      const numericPrice = parseFloat(price);
      const numericTotal = parseFloat(total);
      const numericPhoneNumber = parseFloat(phoneNumber);

      if (isNaN(numericQuantity) || isNaN(numericPrice) || isNaN(numericTotal) || isNaN(numericPhoneNumber)) {
        alert('Invalid value for quantity, price, total, or phone numbermake sure it just the number.');
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
        quantity: numericQuantity,
        price: numericPrice,
        phoneNumber: numericPhoneNumber,
        total: numericTotal,
        invoiceNumber,
        recognizedText,
        date,
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

        <View style={styles.fieldContainer}>
          <Text style={{ color: customerNameStatus ? 'green' : 'red' }} onPress={() => setExtractionMessage('Text extracted successfully!')}>
            {customerNameStatus ? '✓' : '✗'}
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
          <Text style={{ color: phoneNumberStatus ? 'green' : 'red' }} onPress={() => setExtractionMessage('Text extracted successfully!')}>
            {phoneNumberStatus ? '✓' : '✗'}
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
        
  <Text> {productList} </Text>
        
        <View style={styles.fieldContainer}>
          <Text style={{ color: customerAddressStatus ? 'green' : 'red' }} onPress={() => setExtractionMessage('Text extracted successfully!')}>
            {customerAddressStatus ? '✓' : '✗'}
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
          <Text style={{ color: productNameStatus ? 'green' : 'red' }} onPress={() => setExtractionMessage('Text extracted successfully!')}>
            {productNameStatus ? '✓' : '✗'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={productName}
            onChangeText={(text) => {
              setProductName(text);
              setProductNameStatus(!!text);
            }}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={{ color: quantityStatus ? 'green' : 'red' }} onPress={() => setExtractionMessage('Text extracted successfully!')}>
            {quantityStatus ? '✓' : '✗'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text);
              setQuantityStatus(!!text);
            }}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={{ color: priceStatus ? 'green' : 'red' }} onPress={() => setExtractionMessage('Text extracted successfully!')}>
            {priceStatus ? '✓' : '✗'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              setPriceStatus(!!text);
            }}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={{ color: totalStatus ? 'green' : 'red' }} onPress={() => setExtractionMessage('Text extracted successfully!')}>
            {totalStatus ? '✓' : '✗'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Total"
            value={total}
            onChangeText={(text) => {
              setTotal(text);
              setTotalStatus(!!text);
            }}
          />
        </View>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.fieldContainer}>
          <Text>Date: {date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              setDate(selectedDate || date);
            }}
          />
        )}

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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    flex: 1,
    padding: 10,
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
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default ScanScreen;
