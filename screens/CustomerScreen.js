import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { db, auth } from "../firebase";

export default function CustomerScreen() {
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = db.collection("customers").onSnapshot((snapshot) => {
      const customersData = [];
      snapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    });

    return () => unsubscribe();
  }, []);

  const getCurrentUserCompanyID = async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          return userData.companyID ? parseInt(userData.companyID) : null;
        } else {
          console.error("User document not found.");
          return null;
        }
      } else {
        console.error("User not authenticated.");
        return null;
      }
    } catch (error) {
      console.error("Error getting user company ID:", error);
      return null;
    }
  };

  const generateUniqueCustomerID = () => {
    let uniqueID;
    do {
      uniqueID = Math.floor(10000 + Math.random() * 90000);
    } while (customers.some((customer) => customer.customerID === uniqueID));
    return uniqueID;
  };

  const addCustomer = async () => {
    try {
      if (!customerName || !customerAddress || !phoneNumber || !email) {
        Alert.alert("All fields are required");
        return;
      }

      const companyID = await getCurrentUserCompanyID();
      const customerID = generateUniqueCustomerID();

      await db.collection("customers").add({
        companyID,
        customerID,
        customerName,
        customerAddress,
        phoneNumber: parseInt(phoneNumber),
        email,
      });

      setCustomerName("");
      setCustomerAddress("");
      setPhoneNumber("");
      setEmail("");
      setIsAddModalVisible(false);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const editCustomer = async () => {
    try {
      if (!selectedCustomer) {
        Alert.alert("Select a customer to edit");
        return;
      }

      const companyID = await getCurrentUserCompanyID();
      await db
        .collection("customers")
        .doc(selectedCustomer.id)
        .update({
          companyID,
          customerAddress: customerAddress || selectedCustomer.customerAddress,
          phoneNumber: phoneNumber || selectedCustomer.phoneNumber,
          email: email || selectedCustomer.email,
        });

      setCustomerAddress("");
      setPhoneNumber("");
      setEmail("");
      setSelectedCustomer(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error editing customer:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = customers.filter((customer) =>
      customer.customerName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleCustomerPress = (item) => {
    setSelectedCustomer(item);
    setCustomerName(item.customerName);
    setCustomerAddress(item.customerAddress);
    setPhoneNumber(item.phoneNumber.toString());
    setEmail(item.email);
    setIsModalVisible(true);
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) {
      Alert.alert("Select a customer to edit");
      return;
    }
    setIsModalVisible(true);
  };

  const handleAddCustomer = () => {
    setCustomerName("");
    setCustomerAddress("");
    setPhoneNumber("");
    setEmail("");
    setIsAddModalVisible(true);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={{
            flex: 1,
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 10,
            marginRight: 10,
          }}
          placeholder="Search by customer name"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "black",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={handleAddCustomer}
        >
          <Text style={{ color: "white", fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCustomerPress(item)}>
            <View
              style={{
                backgroundColor: "black",
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "white" }}>
                Customer Name: {item.customerName}
              </Text>
              <Text style={{ color: "white" }}>
                Address: {item.customerAddress}
              </Text>
              <Text style={{ color: "white" }}>
                Phone Number: {item.phoneNumber}
              </Text>
              <Text style={{ color: "white" }}>Email: {item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Add Customer</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
              }}
              placeholder="Customer Name"
              value={customerName}
              onChangeText={setCustomerName}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
              }}
              placeholder="Address"
              value={customerAddress}
              onChangeText={setCustomerAddress}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
              }}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
              }}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <Button title="Add Customer" onPress={addCustomer} />
            <Button
              title="Cancel"
              onPress={() => setIsAddModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              Editing Customer: {selectedCustomer?.customerName}
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
              }}
              placeholder="Address"
              value={customerAddress}
              onChangeText={setCustomerAddress}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
              }}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
              }}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <Button title="Save Changes" onPress={editCustomer} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
