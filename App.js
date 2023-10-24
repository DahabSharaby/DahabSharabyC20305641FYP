//import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View, Button } from 'react-native';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import "react-native-gesture-handler";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainScreen from './screens/MainScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ScannerScreen from './screens/ScannerScreen';
import InputScreen from './screens/InputScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name='Welcome' component={WelcomeScreen}/>
      <Stack.Screen name='Login' component={LoginScreen}/>
      <Stack.Screen name='Register' component={RegisterScreen}/>
      <Stack.Screen name='Main' component={MainScreen}/>
      <Stack.Screen name='Scanner' component={ScannerScreen}/>
      <Stack.Screen name='Input' component={InputScreen}/>
      <Stack.Screen name='Dashboard' component={DashboardScreen}/>
      </Stack.Navigator>
      
      </NavigationContainer>
  );
}


// UNNEEDED FOR NOW
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   input: {
// //     width: 300, 
// //     height: 40,
// //     borderColor: 'gray',
// //     borderWidth: 1,
// //     padding: 10,
// //     marginBottom: 20, 
// //   },
// //   buttonContainer: {
// //     flexDirection: 'row', 
// //   },
// });

