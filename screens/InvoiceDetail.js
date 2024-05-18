import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { db } from "../firebase";

const InvoiceDetail = ({ route }) => {
  const { invoice } = route.params;
  const [companyData, setCompanyData] = useState(null);
  const DigitalBlitzLogo = require("../image1/DigitalBlitz.png");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        if (invoice.companyID) {
          const companyID = invoice.companyID.toString();
          const companyRef = db.collection("companies").doc(companyID);
          const companyDoc = await companyRef.get();
          if (companyDoc.exists) {
            setCompanyData(companyDoc.data());
          } else {
            console.log("Company document does not exist!");
          }
        } else {
          console.log("Invoice does not contain a company ID!");
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, [invoice.companyID]);

  const formatDate = (dateObj) => {
    if (dateObj && dateObj.seconds) {
      const date = new Date(dateObj.seconds * 1000);
      return date.toDateString();
    }
    return "";
  };

  const sharePDF = async () => {
    if (!companyData) return;
  
    const { companyEmail, companyName, companyNumber, companyRegNumber, address } = companyData;
  
    const titleStyle = "color: blue; font-size: 36px; font-weight: bold; text-align: center; margin-bottom: 20px;";
    const sectionTitleStyle = "font-size: 20px; font-weight: bold; margin-top: 20px;";
    const companyInfoContainerStyle = "display: flex; justify-content: flex-end; margin-top: -20px; padding-top: 20px;";
    const companyInfoStyle = "text-align: right;";
    const thankYouStyle = "font-size: 24px; font-weight: bold; text-align: center; margin-top: 40px; position: absolute; bottom: 40px; width: 100%;";
  
    const htmlContent = `
      <html>
        <body>
          <div style="${titleStyle}">DigitalBlitz Invoicing</div>
          <div style="${companyInfoContainerStyle}">
            <div style="${companyInfoStyle}">
              <p><strong>Company Name:</strong> ${companyName}</p>
              <p><strong>Company Email:</strong> ${companyEmail}</p>
              <p><strong>Company Number:</strong> ${companyNumber}</p>
              <p><strong>Reg Number:</strong> ${companyRegNumber}</p>
              <p><strong>Address:</strong> ${address}</p>
            </div>
          </div>
          <div style="padding-left: 20px; padding-top: 40px;">
            <div style="${sectionTitleStyle}">Invoice Information</div>
            <p>Invoice Number: ${invoice.invoiceNumber}</p>
            <p>Date: ${formatDate(invoice.date)}</p>
            <p>Total: €${invoice.total}</p>
            <div style="${sectionTitleStyle}">Customer Information</div>
            <p>Customer Name: ${invoice.customerName}</p>
            <p>Customer Address: ${invoice.customerAddress}</p>
            <p>Customer Phone: ${invoice.phoneNumber}</p>
            <div style="${sectionTitleStyle}">Product Information</div>
            <ul>
              ${invoice.productList
                .map(
                  (item) => `
                <li>
                  <p>Product: ${item.name}</p>
                  <p>Price: €${item.price}</p>
                  <p>Quantity: ${item.quantity}</p>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
          <div style="${thankYouStyle}">Thank you for your purchase!</div>
        </body>
      </html>
    `;
  
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing PDF:", error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DigitalBlitz Invoicing<Image source={DigitalBlitzLogo} style={styles.logo} />
</Text>
      <Text>Invoice Number: {invoice.invoiceNumber}</Text>
      <Text>Date: {formatDate(invoice.date)}</Text>
      <Text>Total: €{invoice.total}</Text>
      <Text>Customer Name: {invoice.customerName}</Text>
      <Text>Customer Address: {invoice.customerAddress}</Text>
      <Text>Customer Phone: {invoice.phoneNumber}</Text>
      {invoice.imageURL && (
        <Image source={{ uri: invoice.imageURL }} style={styles.invoiceImage} />
      )}
      <FlatList
        data={invoice.productList}
        renderItem={({ item }) => (
          <View>
            <Text>Product: {item.name}</Text>
            <Text>Price: €{item.price}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity onPress={sharePDF} style={styles.shareButton}>
        <Ionicons name="share" size={40} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    top: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "blue",
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
  },
  shareButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  thankYou: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
  },
  
  invoiceImage: {
    width: "100%",
    height: 200,
    marginTop: 20,
    resizeMode: "cover",
  },
});

export default InvoiceDetail;
