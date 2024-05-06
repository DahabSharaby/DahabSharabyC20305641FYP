import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { db, auth } from "../firebase";

const InvoiceScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const currentUser = auth.currentUser;
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

        if (!companyID) {
          console.error("Company ID not found for the current user.");
          return;
        }

        const invoiceSnapshot = await db
          .collection("invoices")
          .where("companyID", "==", companyID)
          .orderBy("date", "desc")
          .get();

        const invoiceData = invoiceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvoices(invoiceData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search query
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
            onPress={() =>
              navigation.navigate("InvoiceDetail", { invoice: item })
            }
          >
            <Text>Invoice Number: {item.invoiceNumber}</Text>
            <Text>Customer Name: {item.customerName}</Text>
            <Text>Total: €{item.total}</Text>
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

export default InvoiceScreen;
