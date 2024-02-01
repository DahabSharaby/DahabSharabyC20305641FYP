import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { db, auth } from '../firebase';

export default function CustomerScreen() {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(''); 
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const unsubscribe = db.collection('customers').onSnapshot((snapshot) => {
      const customersData = [];
      snapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersData);
    });

    return () => unsubscribe();
  }, []);

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

  const addCustomer = async () => {
    try {
      const companyID = await getCurrentUserCompanyID();
      await db.collection('customers').add({
        companyID,
        customerName,
        customerAddress,
        phoneNumber,
        email, 
      });

      setCustomerName('');
      setCustomerAddress('');
      setPhoneNumber('');
      setEmail(''); 
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const editCustomer = async () => {
    try {
      if (!selectedCustomer) {
        Alert.alert('Select a customer to edit');
        return;
      }

      const companyID = await getCurrentUserCompanyID();
      await db.collection('customers').doc(selectedCustomer.id).update({
        companyID,
        customerName: customerName || selectedCustomer.customerName,
        customerAddress: customerAddress || selectedCustomer.customerAddress,
        phoneNumber: phoneNumber || selectedCustomer.phoneNumber,
        email: email || selectedCustomer.email, 
      });

      setCustomerName('');
      setCustomerAddress('');
      setPhoneNumber('');
      setEmail('');
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error editing customer:', error);
    }
  };

  // const removeCustomer = async () => {
  //   try {
  //     if (!selectedCustomer) {
  //       Alert.alert('Select a customer to delete');
  //       return;
  //     }

  //     await db.collection('customers').doc(selectedCustomer.id).delete();
  //     setSelectedCustomer(null);
  //   } catch (error) {
  //     console.error('Error deleting customer:', error);
  //   }
  // };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Add Customer:</Text>
      <TextInput
        placeholder="Customer Name"
        value={customerName}
        onChangeText={(text) => setCustomerName(text)}
      />
      <TextInput
        placeholder="Customer Address"
        value={customerAddress}
        onChangeText={(text) => setCustomerAddress(text)}
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <Button title="Add Customer" onPress={addCustomer} />

      <Text style={{ marginTop: 20 }}>Customer List:</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 17 }}>
            <Text>{`${item.customerName}  - ${item.email}`}</Text>
            <Button title="Edit" onPress={() => setSelectedCustomer(item)} />
          </View>
        )}
      />
{/* - ${item.customerAddress} - ${item.phoneNumber} */}
      {selectedCustomer && (
        <>
          <Text style={{ marginTop: 20 }}>Edit Customer:</Text>
          <TextInput
            placeholder="Customer Name"
            value={customerName || selectedCustomer.customerName}
            onChangeText={(text) => setCustomerName(text)}
          />
          <TextInput
            placeholder="Customer Address"
            value={customerAddress || selectedCustomer.customerAddress}
            onChangeText={(text) => setCustomerAddress(text)}
          />
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber || selectedCustomer.phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
          />
          <TextInput
            placeholder="Email"
            value={email || selectedCustomer.email}
            onChangeText={(text) => setEmail(text)}
          />
          <Button title="Save Changes" onPress={editCustomer} />
        </>
      )}

      {/* <Button
        title="Delete Customer"
        onPress={removeCustomer}
        disabled={!selectedCustomer}
        style={{ marginTop: 20 }}
      /> */}
    </View>
  );
}
