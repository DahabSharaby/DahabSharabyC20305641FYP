// import React, { useState, useEffect } from 'react';
// import { Text, StyleSheet, View, Image, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
// import axios from 'axios';
// import { db , auth} from '../firebase';

// const ScannerScreen = () => {
//   const [imageUri, setImageUri] = useState(null);
//   const [recognizedText, setRecognizedText] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [companyAddress, setCompanyAddress] = useState('');
//   const [productName, setProductName] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [price, setPrice] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [total, setTotal] = useState(''); 
//   const [invoiceNumber, setInvoiceNumber] = useState('');

//   useEffect(() => {
//     (async () => {
//       if (Platform.OS !== 'web') {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== 'granted') {
//           alert('Sorry, we need camera roll permissions to make this work!');
//         }
//       }
//     })();
//   }, []);

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.cancelled) {
//       setImageUri(result.uri);
//       analyzeImage(result.uri);
//     }
//   };

//   const takePicture = async () => {
//     let result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.cancelled) {
//       setImageUri(result.uri);
//       analyzeImage(result.uri);
//     }
//   };

//   const analyzeImage = async (uri) => {
//     try {
//       const apiKey = 'AIzaSyBJ3FyjJzcNMApNqb7itGQBGP4wE6BO5bI';
//       const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

//       const base64ImageData = await FileSystem.readAsStringAsync(uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       const requestData = {
//         requests: [
//           {
//             image: {
//               content: base64ImageData,
//             },
//             features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
//           },
//         ],
//       };

//       const apiResponse = await axios.post(apiURL, requestData);
//       const detectedText = apiResponse.data.responses[0].fullTextAnnotation.text;

//       setRecognizedText(detectedText);

//       const nameIndex = detectedText.toLowerCase().indexOf('name');
//       if (nameIndex !== -1) {
//         const startName = nameIndex + 'name'.length;
//         const nameValue = detectedText.substring(startName).split('\n')[0].trim();
//         setCompanyName(nameValue);
//       }
//       const addressIndex = detectedText.toLowerCase().indexOf('address');
//       if (addressIndex !== -1) {
//         const startAddress = addressIndex + 'address'.length;
//         const addressValue = detectedText.substring(startAddress).split('\n')[0].trim();
//         setCompanyAddress(addressValue);
//       }

//       const phoneIndex = detectedText.toLowerCase().indexOf('phone');
//       if (phoneIndex !== -1) {
//         const startPhone = phoneIndex + 'phone'.length;
//         const phoneValue = detectedText.substring(startPhone).split('\n')[0].trim();
//         setPhoneNumber(phoneValue);
//       }

//       const productNameIndex = detectedText.toLowerCase().indexOf('product name');
//       if (productNameIndex !== -1) {
//         const startProductName = productNameIndex + 'product name'.length;
//         const productNameValue = detectedText.substring(startProductName).split('\n')[0].trim();
//         setProductName(productNameValue);
//       }

//       const quantityIndex = detectedText.toLowerCase().indexOf('quantity');
//       if (quantityIndex !== -1) {
//         const startQuantity = quantityIndex + 'quantity'.length;
//         const quantityValue = detectedText.substring(startQuantity).split('\n')[0].trim();
//         setQuantity(quantityValue);
//       }

//       const priceIndex = detectedText.toLowerCase().indexOf('price');
//       if (priceIndex !== -1) {
//         const startPrice = priceIndex + 'price'.length;
//         const priceValue = detectedText.substring(startPrice).split('\n')[0].trim();
//         setPrice(priceValue);
//       }

//       const totalIndex = detectedText.toLowerCase().indexOf('total');
//       if (totalIndex !== -1) {
//         const startTotal = totalIndex + 'total'.length;
//         const totalValue = detectedText.substring(startTotal).split('\n')[0].trim();
//         setTotal(totalValue);
//       }

//       let invoiceNumberValue = '';
//       const invoiceNumberIndex = detectedText.toLowerCase().indexOf('invoice number');
//       if (invoiceNumberIndex !== -1) {
//         const startInvoiceNumber = invoiceNumberIndex + 'invoice number'.length;
//         invoiceNumberValue = detectedText.substring(startInvoiceNumber).split('\n')[0].trim();
//       } else {
//         invoiceNumberValue = generateInvoiceNumber();
//       }
//       setInvoiceNumber(invoiceNumberValue);

//     } catch (error) {
//       console.error('Error analyzing image:', error.response ? error.response.data : error.message);
//       alert('Error analyzing image. Please try again.');
//     }
//   };

//   const generateInvoiceNumber = () => {
//     const randomNumber = Math.floor(1000 + Math.random() * 9000);
//     return `INV${randomNumber}`;
//   };

//   const saveInvoiceToFirestore = async () => {
//     try {
//       const currentUser = auth.currentUser;
//       const userId = currentUser ? currentUser.uid : null;

//       if (userId) {
//         const invoiceData = {
//           userId,
//           companyName,
//           companyAddress,
//           productName,
//           quantity,
//           price,
//           phoneNumber,
//           total,
//           invoiceNumber,
//           recognizedText,
//         };

//         await db.collection('invoices').add(invoiceData);
//         alert('Invoice data saved to Firestore!');
//       } else {
//         alert('User not authenticated. Please login.');
//       }
//     } catch (error) {
//       console.error('Error saving invoice to Firestore:', error);
//       alert('Error saving invoice data. Please try again.');
//     }
//   };

// return (
//   <ScrollView contentContainerStyle={styles.scrollViewContainer}>
//     <View style={styles.container}>
//       <Text>Detect Handwritten Text</Text>

//       {imageUri && <Image source={{ uri: imageUri }} style={{ width: 300, height: 300 }} />}

//       <TouchableOpacity style={styles.button} onPress={pickImage}>
//         <Text style={styles.text}>Choose an image...</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={takePicture}>
//         <Text style={styles.text}>Open Camera</Text>
//       </TouchableOpacity>

//       <TextInput
//         style={styles.input}
//         multiline={true}
//         placeholder="Recognized Text"
//         value={recognizedText}
//         onChangeText={(text) => setRecognizedText(text)}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Company Name"
//         value={companyName}
//         onChangeText={(text) => setCompanyName(text)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Company Address"
//         value={companyAddress}
//         onChangeText={(text) => setCompanyAddress(text)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Product Name"
//         value={productName}
//         onChangeText={(text) => setProductName(text)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Quantity"
//         value={quantity}
//         onChangeText={(text) => setQuantity(text)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Price"
//         value={price}
//         onChangeText={(text) => setPrice(text)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number"
//         value={phoneNumber}
//         onChangeText={(text) => setPhoneNumber(text)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Total"
//         value={total}
//         onChangeText={(text) => setTotal(text)}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Invoice Number"
//         value={invoiceNumber}
//         onChangeText={(text) => setInvoiceNumber(text)}
//       />
//      <TouchableOpacity style={styles.button} onPress={saveInvoiceToFirestore}>
//         <Text style={styles.text}>Save Invoice </Text>
//       </TouchableOpacity>
    
      
//     </View>
//   </ScrollView>
// )}

// const styles = StyleSheet.create({
//   scrollViewContainer: {
//     flexGrow: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingBottom: 20, 
//   },
//   button: {
//     backgroundColor: 'lightblue',
//     padding: 10,
//     margin: 5,
//     borderRadius: 5,
//   },
//   text: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   input: {
//     width: '80%',
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     marginTop: 10,
//     padding: 10,
//   },
// });

// export default ScannerScreen;

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ScannerScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ScanScreen', { source: 'camera' })}
      >
        <Text style={styles.text}>Open Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ScanScreen', { source: 'gallery' })}
      >
        <Text style={styles.text}>Open Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'lightblue',
    padding: 15, 
    margin: 10, 
    borderRadius: 5,
    width: '80%', 
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ScannerScreen;
