import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { db, auth } from '../firebase';

const ProductScreen = () => {
  const [action, setAction] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const unsubscribe = db.collection('products').onSnapshot((snapshot) => {
      const productDatas = [];
      snapshot.forEach((doc) => {
        productDatas.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productDatas);
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

  const addProduct = async () => {
    try {
      const companyID = await getCurrentUserCompanyID();
      await db.collection('products').add({
        companyID,
        productName,
        productPrice,
        productId,
      });

      Alert.alert('Product Added', 'Product has been added successfully.');
      setAction('');
      setProductName('');
      setProductPrice('');
      setProductId('');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const editProduct = async () => {
    try {
      if (!selectedProduct) {
        Alert.alert('Select a product to edit');
        return;
      }

      const companyID = await getCurrentUserCompanyID();
      await db.collection('products').doc(selectedProduct.id).update({
        companyID,
        productName: productName || selectedProduct.productName,
        productPrice: productPrice || selectedProduct.productPrice,
        productId: productId || selectedProduct.productId,
      });

      Alert.alert('Product Edited', 'Product has been edited successfully.');
      setAction('');
      setProductName('');
      setProductPrice('');
      setProductId('');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error editing product:', error);
    }
  };

  const deleteProduct = async () => {
    try {
      if (!selectedProduct) {
        Alert.alert('Select a product to delete');
        return;
      }

      await db.collection('products').doc(selectedProduct.id).delete();
      Alert.alert('Product Deleted', 'Product has been deleted successfully.');

      setProducts(prevProducts => prevProducts.filter(product => product.id !== selectedProduct.id));

      setAction('');
      setProductName('');
      setProductPrice('');
      setProductId('');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Add Product:</Text>
      <TextInput
        placeholder="Product Name"
        value={productName}
        onChangeText={(text) => setProductName(text)}
      />
      <TextInput
        placeholder="Product Price"
        value={productPrice}
        onChangeText={(text) => setProductPrice(text)}
      />
      <TextInput
        placeholder="Product ID"
        value={productId}
        onChangeText={(text) => setProductId(text)}
      />
      <Button title="Add Product" onPress={addProduct} />

      <Text style={{ marginTop: 20 }}>Product List:</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text>{`${item.productName} - ${item.productPrice} - ${item.productId}`}</Text>
            <Button title="Edit" onPress={() => setSelectedProduct(item)} />
          </View>
        )}
      />

      {selectedProduct && (
        <>
          <Text style={{ marginTop: 20 }}>Edit Product:</Text>
          <TextInput
            placeholder="Product Name"
            value={productName || selectedProduct.productName}
            onChangeText={(text) => setProductName(text)}
          />
          <TextInput
            placeholder="Product Price"
            value={productPrice || selectedProduct.productPrice}
            onChangeText={(text) => setProductPrice(text)}
          />
          <TextInput
            placeholder="Product ID"
            value={productId || selectedProduct.productId}
            onChangeText={(text) => setProductId(text)}
          />
          <Button title="Save Changes" onPress={editProduct} />
        </>
      )}

      {/* <Button
        title="Delete Product"
        onPress={deleteProduct}
        disabled={!selectedProduct}
        style={{ marginTop: 20 }}
      /> */}
    </View>
  );
};

export default ProductScreen;
