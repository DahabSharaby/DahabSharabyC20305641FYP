import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainScreen from "./screens/MainScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import ScannerScreen from "./screens/ScannerScreen.js";
import InputScreen from "./screens/InputScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AdminScreen from "./screens/AdminScreen.js";
import DeleteAccountScreen from "./screens/DeleteAccountScreen.js";
import CustomerScreen from "./screens/CustomerScreen.js";
import ProductScreen from "./screens/ProductScreen.js";
import CompanyReg from "./screens/CompanyReg.js";
import ScanScreen from "./screens/ScanScreen.js";
import InvoiceScreen from "./screens/InvoiceScreen.js";
import InvoiceDetail from "./screens/InvoiceDetail.js";
import ProfileScreen from "./screens/ProfileScreen.js";
import UploadScreen from "./screens/UploadScreen.js";
import Payments from "./screens/Payments";
import Expenses from "./screens/Expenses";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Company Registeration"
          component={CompanyReg}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Input" component={InputScreen} options={{headerShown: false}} />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Customer"
          component={CustomerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Product"
          component={ProductScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DeleteAccount"
          component={DeleteAccountScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ScanScreen" component={ScanScreen} />
        <Stack.Screen
          name="InvoiceScreen"
          component={InvoiceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InvoiceDetail"
          component={InvoiceDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UploadScreen"
          component={UploadScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Payments"
          component={Payments}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Expenses"
          component={Expenses}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
