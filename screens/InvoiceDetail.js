import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const InvoiceDetail = ({ route }) => {
  const { invoice } = route.params;
  console.log("Invoice:", invoice);

  const formatDate = (dateObj) => {
    if (dateObj && dateObj.seconds) {
      const date = new Date(dateObj.seconds * 1000);
      return date.toDateString();
    }
    return "";
  };

  const sharePDF = async () => {
    const htmlContent = `
      <html>
        <body>
          <h1>Invoice Details</h1>
          <p>Invoice Number: ${invoice.invoiceNumber}</p>
          <p>Customer Name: ${invoice.customerName}</p>
          <p>Total: €${invoice.total}</p>
          <p>Date: ${formatDate(invoice.date)}</p>
          ${
            invoice.imageURL
              ? `<img src="${invoice.imageURL}" style="width: 200px; height: 200px;"/>`
              : ""
          }
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
      <Text>Invoice Number: {invoice.invoiceNumber}</Text>
      <Text>Customer Name: {invoice.customerName}</Text>
      <Text>Total: €{invoice.total}</Text>
      <Text>Date: {formatDate(invoice.date)}</Text>
      {invoice.imageURL && (
        <Image source={{ uri: invoice.imageURL }} style={styles.image} />
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
    padding: 20,
    top: 40,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    resizeMode: "cover",
  },
  shareButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
});

export default InvoiceDetail;
