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
          .where("status", "==", "unpaid")
          .orderBy("date", "desc")
          .get();

        const invoiceData = invoiceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvoices(invoiceData);

        // Check if an invoice is 2 weeks old and show alert
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const oldInvoices = invoiceData.filter(
          (invoice) => invoice.date.toDate() <= twoWeeksAgo
        );
        if (oldInvoices.length > 0) {
          Alert.alert(
            "Over due Invoice(s)",
            `You have ${oldInvoices.length} invoice(s) 2 weeks old or older.`
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

  const handleCheckboxPress = async (id, currentStatus) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    await updateInvoiceStatus(id, newStatus);
  };

  const getStatusColor = (status, date) => {
    const invoiceDate = date.toDate();
    const today = new Date();
    const dateDiff = Math.ceil((today - invoiceDate) / (1000 * 60 * 60 * 24));
    if (dateDiff >= 14) {
      return "red"; // Older than 2 weeks
    } else if (dateDiff >= 7) {
      // return "yellow"; // 1 week or more
    } else {
      // return "green"; // Less than a week
    }
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
            style={[
              styles.invoiceItem,
              { borderColor: getStatusColor(item.status, item.date) },
            ]}
            onPress={() => handleCheckboxPress(item.id, item.status)}
          >
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  item.status === "paid" && styles.checked,
                ]}
                onPress={() => handleCheckboxPress(item.id, item.status)}
              />
            </View>
            <View style={styles.invoiceDetails}>
              <Text>Invoice Number: {item.invoiceNumber}</Text>
              <Text>Customer Name: {item.customerName}</Text>
              <Text>Total: €{item.total}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Date: {item.date.toDate().toLocaleDateString()}</Text>
            </View>
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
    backgroundColor: "#FFFFFF",
    marginTop: 40,
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
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 3,
  },
  checked: {
    backgroundColor: "blue",
  },
  invoiceDetails: {
    flex: 1,
  },
});

export default Payments;
