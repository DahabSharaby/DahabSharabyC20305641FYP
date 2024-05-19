import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AdminScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Page</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Customer')}>
        <Text style={styles.buttonText}>Customer Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Product')}>
        <Text style={styles.buttonText}>Product Data</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DeleteAccount')}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    //alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AdminScreen;
