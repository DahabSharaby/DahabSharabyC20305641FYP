import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const handleButtonPress = () => {
    // Define the action you want to perform when the button is pressed.
    alert('Button Pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Hello World?!</Text>
        <Text>Dahab Sharaby</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Press Me" onPress={handleButtonPress} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingBottom: 20, // You can adjust the value to control the spacing between the content and the button
    paddingHorizontal: 20, // Optional padding for the button container
  },
});

