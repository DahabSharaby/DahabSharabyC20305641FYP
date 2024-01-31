import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, auth } from '../firebase';

export function InputScreen({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [productName, setProductName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [total, setTotal] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [suggestedCustomer, setSuggestedCustomer] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const collectionRef = db.collection('products');
        const querySnapshot = await collectionRef.get();

        const data = [];
        querySnapshot.forEach((doc) => {
          const productDetails = {
            id: doc.id,
            name: doc.data().productName,
          };
          data.push(productDetails);
        });

        setProductData(data);
      } catch (error) {
        console.error('Firestore Error:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (productName.trim() !== '') {
      const filteredProducts = productData.filter(
        (product) => product.name.toLowerCase().includes(productName.toLowerCase())
      );
      setSuggestedProducts(filteredProducts);
    } else {
      setSuggestedProducts([]);
    }
  }, [productName, productData]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      console.log('Current User:', user);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const collectionRef = db.collection('customers');
        const querySnapshot = await collectionRef.get();

        const data = [];
        querySnapshot.forEach((doc) => {
          const customerDetails = {
            id: doc.id,
            name: doc.data().customerName,
          };
          data.push(customerDetails);
        });

        setCustomerData(data);
      } catch (error) {
        console.error('Firestore Error:', error);
      }
    };

    fetchCustomer();
  }, []);

  useEffect(() => {
    if (customerName.trim() !== '') {
      const filteredCustomer = customerData.filter((customer) => {
        return (
          customer &&
          customer.name &&
          customer.name.toLowerCase().includes(customerName.toLowerCase())
        );
      });
      setSuggestedCustomer(filteredCustomer);
    } else {
      setSuggestedCustomer([]);
    }
  }, [customerName, customerData]);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductSelection(item.name)}>
      <Text style={styles.suggestedProductItem}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleProductSelection = (selectedProduct) => {
    setProductName(selectedProduct);
    setSuggestedProducts([]);
  };

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCustomerSelection(item.name)}>
      <Text style={styles.suggestedCustomersItem}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleCustomerSelection = (selectedCustomer) => {
    setCustomerName(selectedCustomer);
    setSuggestedCustomer([]);
  };

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
      console.log('Current User:', currentUser);

      if (
        customerName.trim() === '' ||
        customerAddress.trim() === '' ||
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

      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const companyId = userDoc.exists ? userDoc.data()?.companyID : null;

    if (!companyId) {
      alert('Company ID not found for the current user');
      return;
    }
      const generatedInvoiceNumber = generateInvoiceNumber();
      setInvoiceNumber(generatedInvoiceNumber);

      if (!productData || productData.length === 0) {
        alert('Product data not available');
        return;
      }

      const selectedCustomer = customerData.find((customer) =>
        customer &&
        customer.name &&
        customer.name.toLowerCase() === customerName.toLowerCase()
      );

      if (!selectedCustomer) {
        alert('Selected customer not found');
        return;
      }

      const customerId = selectedCustomer.id;

      const selectedProduct = productData.find((product) =>
        product &&
        product.name &&
        product.name.toLowerCase() === productName.toLowerCase()
      );

      if (!selectedProduct) {
        alert('Selected product not found');
        return;
      }

      const productDetails = {
        invoiceNumber: generatedInvoiceNumber,
        companyId, 
        customerId,
        customerName,
        customerAddress,
        productName,
        productId: selectedProduct.id,
        phoneNumber: parseFloat(phoneNumber),
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        date,
        total: parseFloat(total) || 0,
        userId: currentUser.uid,
      };

      await db.collection('invoices').add(productDetails);
      alert('Invoice details saved successfully!');

      setCustomerName('');
      setCustomerAddress('');
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
        placeholder="Customer Name"
        value={customerName}
        onChangeText={(text) => setCustomerName(text)}
        style={styles.input}
      />
      <FlatList
        data={suggestedCustomer}
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
      <TextInput
        placeholder="Product Name"
        value={productName}
        onChangeText={(text) => setProductName(text)}
        style={styles.input}
      />
      <FlatList
        data={suggestedProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        style={styles.suggestedProductList}
      />
      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={(text) => {
          setQuantity(text);
          calculateTotal();
        }}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={(text) => {
          setPrice(text);
          calculateTotal();
        }}
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
}

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
  suggestedProductList: {
    width: '80%',
    marginTop: 5,
    maxHeight: 100,
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
  },
  suggestedProductItem: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },

  suggestedCustomerList: {
    width: '80%',
    marginTop: 5,
    maxHeight: 100,
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
  },
  suggestedCustomersItem: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
});

export default InputScreen;
