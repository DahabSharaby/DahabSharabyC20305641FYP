import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { db, auth } from "../firebase";
import messaging from "@react-native-firebase/messaging";

const Payments = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("User not authenticated.");
          return;
        }

        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          console.error("Company ID not found for the current user.");
          return;
        }

        const invoiceSnapshot = await db
          .collection("invoices")
          .where("companyID", "==", companyID)
          .where("status", "!=", "paid")
          .orderBy("date", "desc")
          .get();

        const invoiceData = invoiceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvoices(invoiceData);

        if (invoiceData.length > 0) {
          Alert.alert(
            "Unpaid Invoices",
            `You have ${invoiceData.length} unpaid invoices.`
          );
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        Alert.alert("Failed to fetch invoices. Please try again later.");
      }
    };

    fetchInvoices();
  }, []);

  const updateInvoiceStatus = async (id, newStatus) => {
    try {
      await db.collection("invoices").doc(id).update({
        status: newStatus,
      });
      const updatedInvoiceData = invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status: newStatus } : invoice
      );
      setInvoices(updatedInvoiceData);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      Alert.alert("Failed to update invoice status. Please try again later.");
    }
  };

  const handleInvoicePress = (id, currentStatus) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    updateInvoiceStatus(id, newStatus);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by customer name or invoice number"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.invoiceItem}
            onPress={() => handleInvoicePress(item.id, item.status)}
          >
            <Text>Invoice Number: {item.invoiceNumber}</Text>
            <Text>Customer Name: {item.customerName}</Text>
            <Text>Total: €{item.total}</Text>
            <Text>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    top: 40,
  },
  searchBar: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  invoiceItem: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default Payments;
