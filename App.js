import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import "react-native-gesture-handler";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainScreen from './screens/MainScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ScannerScreen from './screens/ScannerScreen.js';
import InputScreen from './screens/InputScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen.js';
import DeleteAccountScreen from './screens/DeleteAccountScreen.js';
import CustomerScreen from './screens/CustomerScreen.js';
import ProductScreen from './screens/ProductScreen.js';
import CompanyReg from './screens/CompanyReg.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name='Welcome' component={WelcomeScreen}/>
      <Stack.Screen name='Login' component={LoginScreen}/>
      <Stack.Screen name='Register' component={RegisterScreen}/>
      <Stack.Screen name='Company Registeration' component={CompanyReg}/>
      <Stack.Screen name='Main' component={MainScreen}/>
      <Stack.Screen name='Scanner' component={ScannerScreen}/>
      <Stack.Screen name='Input' component={InputScreen}/>
      <Stack.Screen name='Dashboard' component={DashboardScreen}/>
      <Stack.Screen name='Admin' component={AdminScreen}/>
      <Stack.Screen name="Customer" component={CustomerScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      </Stack.Navigator>
      
      </NavigationContainer>
  );
}