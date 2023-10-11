import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const handleButtonPress = () => {
    alert('Button Pressed');
  };

  return (
    <View style={styles.container}>
      <Text>Hello World!</Text>
      <Text>Dahab Sharaby</Text>
      <Button title="Press Me" onPress={handleButtonPress} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
