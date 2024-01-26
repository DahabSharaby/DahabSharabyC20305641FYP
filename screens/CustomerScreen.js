import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { db } from '../firebase';

export default function CustomerScreen() {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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

  const addCustomer = () => {
    db.collection('customers').add({
      customerName,
      customerAddress,
      phoneNumber,
    });

    setCustomerName('');
    setCustomerAddress('');
    setPhoneNumber('');
  };

  const editCustomer = () => {
    if (!selectedCustomer) {
      Alert.alert('Select a customer to edit');
      return;
    }

    db.collection('customers').doc(selectedCustomer.id).update({
      customerName,
      customerAddress,
      phoneNumber,
    });

    setCustomerName('');
    setCustomerAddress('');
    setPhoneNumber('');
    setSelectedCustomer(null);
  };

  const removeCustomer = () => {
    if (!selectedCustomer) {
      Alert.alert('Select a customer to delete');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${selectedCustomer.customerName}?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            db.collection('customers').doc(selectedCustomer.id).delete();
            setSelectedCustomer(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Add Customer:</Text>
      <TextInput
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
      />
      <TextInput
        placeholder="Customer Address"
        value={customerAddress}
        onChangeText={setCustomerAddress}
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <Button title="Add Customer" onPress={addCustomer} />

      <Text style={{ marginTop: 20 }}>Customer List:</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text>{`${item.customerName} - ${item.customerAddress} - ${item.phoneNumber}`}</Text>
            <Button title="Edit" onPress={() => setSelectedCustomer(item)} />
          </View>
        )}
      />

      {selectedCustomer && (
        <>
          <Text style={{ marginTop: 20 }}>Edit Customer:</Text>
          <TextInput
            placeholder="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            placeholder="Customer Address"
            value={customerAddress}
            onChangeText={setCustomerAddress}
          />
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Button title="Save Changes" onPress={editCustomer} />
        </>
      )}

      <Button
        title="Delete Customer"
        onPress={removeCustomer}
        disabled={!selectedCustomer}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}
