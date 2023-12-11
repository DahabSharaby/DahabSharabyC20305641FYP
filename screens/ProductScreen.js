import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import { db } from '../firebase';

const ProductScreen = () => {
  const [action, setAction] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const productsRef = db.collection('products');
      const snapshot = await productsRef.get();

      const loadedProducts = [];
      snapshot.forEach((doc) => {
        const productData = doc.data();
        loadedProducts.push({ id: doc.id, ...productData });
      });

      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addProduct = async () => {
    try {
      await db.collection('products').add({
        productName: productName,
        productPrice: productPrice,
        productId: productId,
      });
      Alert.alert('Product Added', 'Product has been added successfully.');
      setAction('');
      setProductName('');
      setProductPrice('');
      setProductId('');
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const editProduct = async (id, newName, newPrice, newId) => {
    try {
      await db.collection('products').doc(id).update({
        productName: newName,
        productPrice: newPrice,
        productId: newId,
      });
      Alert.alert('Product Edited', 'Product has been edited successfully.');
      setAction('');
      setProductName('');
      setProductPrice('');
      setProductId('');
      loadProducts();
    } catch (error) {
      console.error('Error editing product:', error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await db.collection('products').doc(id).delete();
      Alert.alert('Product Deleted', 'Product has been deleted successfully.');
      setAction('');
      setProductName('');
      setProductPrice('');
      setProductId('');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleActionSelection = (selectedAction) => {
    setAction(selectedAction);
    setProductName('');
    setProductPrice('');
    setProductId('');
  };

  const performAction = async () => {
    switch (action) {
      case 'add':
        addProduct();
        break;
      case 'edit':
        editProduct();
        break;
      case 'delete':
        deleteProduct();
        break;
      case 'view':
        loadProducts();
        break;
      default:
        break;
    }
  };

  const renderAddEditProductForm = () => (
    <View style={styles.container}>
      <Text>{action === 'add' ? 'Add Product' : 'Edit Product'}</Text>
      <TextInput
        placeholder="Product Name"
        value={productName}
        onChangeText={(text) => setProductName(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Product Price"
        value={productPrice}
        onChangeText={(text) => setProductPrice(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Product ID"
        value={productId}
        onChangeText={(text) => setProductId(text)}
        style={styles.input}
      />
      <Button title={action === 'add' ? 'Add Product' : 'Edit Product'} onPress={performAction} />
    </View>
  );

  const renderProductsList = () => (
    <View style={styles.container}>
      <Text>Products List</Text>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{`Product ID: ${item.productId}`}</Text>
            <Text>{`Product Name: ${item.productName}`}</Text>
            <Text>{`Product Price: ${item.productPrice}`}</Text>
            <Button title="Edit" onPress={() => handleActionSelection('edit')} />
            <Button title="Delete" onPress={() => handleActionSelection('delete')} />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );

  const renderActionView = () => {
    switch (action) {
      case 'add':
      case 'edit':
        return renderAddEditProductForm();
      case 'delete':
        return renderProductsList();
      case 'view':
        return renderProductsList();
      default:
        return (
          <View style={styles.container}>
            <Text>Select an Action</Text>
            <View style={styles.buttonContainer}>
              <Button title="Add Product" onPress={() => handleActionSelection('add')} />
              <Button title="Edit Product" onPress={() => handleActionSelection('edit')} />
              <Button title="Delete Product" onPress={() => handleActionSelection('delete')} />
              <Button title="View Products" onPress={() => handleActionSelection('view')} />
            </View>
          </View>
        );
    }
  };

  return renderActionView();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
    margin: 5,
    width: 200,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default ProductScreen;

