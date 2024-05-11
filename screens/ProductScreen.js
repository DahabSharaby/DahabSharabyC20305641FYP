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

const ProductScreen = () => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const companyID = await getCurrentUserCompanyID();
        if (companyID) {
          const unsubscribe = db
            .collection("products")
            .where("companyID", "==", companyID)
            .onSnapshot((snapshot) => {
              const productDatas = [];
              snapshot.forEach((doc) => {
                productDatas.push({ id: doc.id, ...doc.data() });
              });
              setProducts(productDatas);
            });
          return () => unsubscribe();
        } else {
          console.error("Company ID not found for the current user.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductPress = (item) => {
    setSelectedProduct(item);
    setProductName(item.productName);
    setProductPrice(item.productPrice);
    setIsEditModalVisible(true);
  };

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

  const addProduct = async () => {
    try {
      if (!productName || !productPrice) {
        Alert.alert("Missing Fields", "Please fill in all fields.");
        return;
      }

      const companyID = await getCurrentUserCompanyID();
      let productId;

      do {
        productId = Math.floor(10000 + Math.random() * 90000);
      } while (products.some((product) => product.productId === productId));

      await db
        .collection("products")
        .doc(productId.toString())
        .set({
          productName: productName,
          productPrice: parseFloat(productPrice),
          productId: productId,
          companyID: companyID,
        });

      Alert.alert("Product Added", "Product has been added successfully.");

      setProductName("");
      setProductPrice("");
      setIsAddModalVisible(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const editProductPrice = async () => {
    try {
      if (!selectedProduct) {
        Alert.alert("Select a product to edit");
        return;
      }

      if (!productPrice || productPrice.toString().trim() === "") {
        Alert.alert("Empty Price", "Please enter a valid product price.");
        return;
      }

      await db
        .collection("products")
        .doc(selectedProduct.id)
        .update({
          productPrice: parseFloat(productPrice),
        });

      Alert.alert(
        "Product Price Edited",
        "Product price has been edited successfully."
      );

      setProductName("");
      setProductPrice("");
      setIsEditModalVisible(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error editing product price:", error);
    }
  };

  const handleEditCancel = () => {
    setProductName("");
    setProductPrice("");
    setIsEditModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <View style={{ flex: 1, padding: 20, top: 30 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <TextInput
          style={{
            flex: 1,
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginRight: 10,
            paddingHorizontal: 10,
          }}
          placeholder="Search by product name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "black",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={{ color: "white", fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <View
              style={{
                backgroundColor: "black",
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "white" }}>
                Product Name: {item.productName}
              </Text>
              <Text style={{ color: "white" }}>Price: {item.productPrice}</Text>
              <Text style={{ color: "white" }}>ID: {item.productId}</Text>
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
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              Add New Product
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              placeholder="Product Name"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              placeholder="Price"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
            />
            <Button title="Add Product" onPress={addProduct} />
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
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
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
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 5,
                right: 5,
              }}
              onPress={handleEditCancel}
            ></TouchableOpacity>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              Edit Product Price
            </Text>
            <Text style={{ marginBottom: 10 }}>
              Product: {selectedProduct?.productName}
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              placeholder="Price"
              value={productPrice}
              onChangeText={(text) => {
                const filteredText = text
                  .replace(/[^\d.]/g, "")
                  .replace(/^(\d*\.\d*)\./g, "$1");
                setProductPrice(filteredText);
              }}
              keyboardType="numeric"
            />
            <Button title="Save Price" onPress={editProductPrice} />
            <Button
              title="Cancel"
              onPress={() => setIsEditModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductScreen;
