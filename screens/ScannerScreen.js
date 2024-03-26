import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ScannerScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ScanScreen', { source: 'camera' })}
      >
        <Text style={styles.text}>Scan Invoice</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ScanScreen', { source: 'gallery' })}
      >
        <Text style={styles.text}>Pick From Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'lightblue',
    padding: 15, 
    margin: 10, 
    borderRadius: 5,
    width: '80%', 
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ScannerScreen;
