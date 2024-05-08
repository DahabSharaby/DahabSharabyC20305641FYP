import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db, auth } from "../firebase";

const Expenses = () => {
  const [expenseType, setExpenseType] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [expenseCost, setExpenseCost] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

      if (!companyID) {
        throw new Error("Company ID not found for the current user.");
      }

      const customersSnapshot = await db
        .collection("customers")
        .where("companyID", "==", companyID)
        .get();

      const fetchedCustomers = customersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCustomers(fetchedCustomers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleExpenseSubmit = async () => {
    try {
      if (!expenseType || !selectedCustomer || !expenseCost) {
        throw new Error(
          "Please select an expense type, customer, and input a cost."
        );
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Current user not found.");
      }

      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const companyID = userDoc.exists ? userDoc.data()?.companyID : null;

      if (!companyID) {
        throw new Error("Company ID not found for the current user.");
      }

      const selectedCustomerDoc = await db
        .collection("customers")
        .where("customerName", "==", selectedCustomer)
        .limit(1)
        .get();

      let customerID = null;
      selectedCustomerDoc.forEach((doc) => {
        customerID = doc.data().customerID;
      });

      const expenseData = {
        type: expenseType,
        cost: parseFloat(expenseCost),
        date: new Date(),
        customerName: selectedCustomer,
        companyID: companyID,
        customerID: customerID,
      };

      await db.collection("expenses").add(expenseData);

      setExpenseType("");
      setSelectedCustomer("");
      setExpenseCost("");
      setSubmissionMessage("Expense saved successfully!");
    } catch (error) {
      console.error("Error saving expense:", error);
      setSubmissionMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Expense Type:</Text>
      <Picker
        style={styles.picker}
        selectedValue={expenseType}
        onValueChange={setExpenseType}
      >
        <Picker.Item label="Select Expense Type" />
        <Picker.Item label="Postage" value="Postage" />
        <Picker.Item label="Phone Expense" value="Phone Expense" />
        <Picker.Item label="Purchase Discounts" value="Purchase Discounts" />
        <Picker.Item label="Consultant Expense" value="Consultant Expense" />
        <Picker.Item
          label="Advertising & Marketing"
          value="Advertising & Marketing"
        />
        <Picker.Item
          label="Repairs & Maintenance"
          value="Repairs & Maintenance"
        />
        <Picker.Item label="Travel" value="Travel" />
        <Picker.Item label="Packaging" value="Packaging" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      {!loading && (
        <>
          <Text style={styles.label}>Customer:</Text>
          <Picker
            style={styles.picker}
            selectedValue={selectedCustomer}
            onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
          >
            <Picker.Item label="Select Customer" value="" />
            {customers.map((customer) => (
              <Picker.Item
                key={customer.id}
                label={customer.customerName}
                value={customer.customerName}
              />
            ))}
          </Picker>
        </>
      )}

      <Text style={styles.label}>Expense Cost:</Text>
      <TextInput
        style={styles.input}
        value={expenseCost}
        onChangeText={setExpenseCost}
        keyboardType="numeric"
        placeholder="Enter Expense Cost"
      />

      <Button
        style={styles.button}
        title="Submit Expense"
        onPress={handleExpenseSubmit}
      />

      {submissionMessage !== "" && (
        <Text style={styles.message}>{submissionMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 55,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  button: {
    borderRadius: 5,
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 10,
    color: "green",
    textAlign: "center",
  },
});

export default Expenses;
