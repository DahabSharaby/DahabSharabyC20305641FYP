import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const handleButton1Press = () => {
    alert('Button 1 Pressed');
  };
  
  const handleButton2Press = () => {
    alert('Button 2 Pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Hello World?!</Text>
        <Text>Dahab Sharaby</Text>
      </View>
        <View style={styles.buttonContainer}>
        <Button title="Button 1" onPress={handleButton1Press} />
        <Button title="Button 2" onPress={handleButton2Press} />
      </View>
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
  input: {
    width: 300, 
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20, 
  },
  buttonContainer: {
    flexDirection: 'row', 
  },
});

