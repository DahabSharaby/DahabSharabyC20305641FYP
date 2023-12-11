import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AdminScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>AdminScreen</Text>
      <Button
        title="Add Customer"
        onPress={() => navigation.navigate('Customer')}
      />
      <Button
        title="Add Product"
        onPress={() => navigation.navigate('Product')}
      />
      <Button
        title="Delete Account"
        onPress={() => navigation.navigate('DeleteAccount')}
      />
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
