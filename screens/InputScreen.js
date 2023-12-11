import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, auth } from '../firebase';

const InputScreen = ({ navigation }) => {
  
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [productName, setProductName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [total, setTotal] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [currentUser, setCurrentUser] = useState(null); 
  
  useEffect(() => {
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

  const calculateTotal = () => {
    if (quantity && price) {
      const calculatedTotal = (parseFloat(quantity) * parseFloat(price)).toFixed(2);
      setTotal(calculatedTotal);
    } else {
      setTotal('');
    }
  };

  const handleCalculatePress = () => {
    calculateTotal();
  };

  const handleSaveInvoice = async () => {
    try {
      if (
        companyName.trim() === '' ||
        companyAddress.trim() === '' ||
        productName.trim() === '' ||
        quantity.trim() === '' ||
        price.trim() === '' ||
        phoneNumber.trim() === ''
      ) {
        alert('Please fill in all fields');
        return;
      }

      if (new Date(date) > new Date()) {
        alert('Date cannot be in the future');
        return;
      }

      if (!currentUser) {
        alert('User not logged in');
        return;
      }

      const generatedInvoiceNumber = generateInvoiceNumber(); 
      setInvoiceNumber(generatedInvoiceNumber);

      const productData = {
        invoiceNumber: generatedInvoiceNumber,
        companyName,
        companyAddress,
        productName,
        phoneNumber: parseFloat(phoneNumber),
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        date,
        total: parseFloat(total) || 0,
        userId: currentUser.uid, 
      };

      await db.collection('invoices').add(productData);
      alert('Invoice details saved successfully!');
      
      setCompanyName('');
      setCompanyAddress('');
      setProductName('');
      setPhoneNumber('');
      setQuantity('');
      setPrice('');
      setDate(new Date());
      setTotal('');
      setInvoiceNumber('');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      alert('Failed to save invoice details.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Company Name"
        value={companyName}
        onChangeText={(text) => setCompanyName(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Company Address"
        value={companyAddress}
        onChangeText={(text) => setCompanyAddress(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Product Name"
        value={productName}
        onChangeText={(text) => setProductName(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={(text) => { setQuantity(text); calculateTotal(); }} 
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={(text) => { setPrice(text); calculateTotal(); }} 
        keyboardType="numeric"
        style={styles.input}
      />
      
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <View style={styles.input}>
          <Text>Date: {date.toLocaleDateString()}</Text>
        </View>
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
      <Button title="Calculate Total" onPress={handleCalculatePress} />
      {total !== '' ? <Text>Total: €{parseFloat(total).toFixed(2)}</Text> : null}
      <Button title="Save Invoice" onPress={handleSaveInvoice} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    width: '80%',
    marginVertical: 8,
    padding: 10,
  },
});

export default InputScreen;

