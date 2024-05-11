import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button, Input } from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from "react-native";
import { db } from "../firebase";
import Clipboard from "@react-native-community/clipboard";

const CompanyReg = ({ navigation }) => {
  const [CompanyName, setCompanyName] = useState("");
  const [num, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [companyRegNumber, setCompanyRegNumber] = useState("");
  const [message, setMessage] = useState("");

  const generateCompanyID = async () => {
    const min = 10000;
    const max = 99999;
    let companyID = Math.floor(Math.random() * (max - min + 1)) + min;
    const companySnapshot = await db
      .collection("/companies")
      .where("companyID", "==", companyID)
      .get();

    while (!companySnapshot.empty) {
      companyID = Math.floor(Math.random() * (max - min + 1)) + min;
      companySnapshot = await db
        .collection("/companies")
        .where("companyID", "==", companyID)
        .get();
    }

    return companyID;
  };

  const register = async () => {
    try {
      const isValid = validateFields();
      if (!isValid) return;

      const companyID = await generateCompanyID();

      await db
        .collection("/companies")
        .doc(companyID.toString())
        .set({
          companyEmail: email,
          companyName: CompanyName,
          companyNumber: Number(num),
          companyID: companyID,
          address: address,
          companyRegNumber: Number(companyRegNumber),
        });

      Alert.alert(
        `Thank you for registering, ${CompanyName}!`,
        `Your unique company ID is: ${companyID}. Please save this ID for future use. The next step now is to sign up using your company ID: ${companyID}.`,
        [
          { text: "OK", onPress: () => {} },
          {
            text: "Sign Up",
            onPress: () => {
              navigation.navigate("Register", { companyID });
            },
          },
        ]
      );

      setCompanyName("");
      setNumber("");
      setEmail("");
      setAddress("");
      setCompanyRegNumber("");
      setMessage("");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error(error.message);
    }
  };

  const validateFields = () => {
    if (!CompanyName || !num || !email || !address || !companyRegNumber) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return false;
    }
    return true;
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../image1/DigitalBlitz.png")}
        style={styles.logo}
      />
      <View style={styles.inputContainer}>
        <Input
          placeholder="Company Name"
          value={CompanyName}
          onChangeText={(text) => setCompanyName(text)}
        />

        <Input
          placeholder="Phone Number"
          keyboardType="numeric"
          value={num}
          onChangeText={(int) => setNumber(int)}
        />

        <Input
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        <Input
          placeholder="Address"
          value={address}
          onChangeText={(text) => setAddress(text)}
        />

        <Input
          placeholder="Company Registration Number"
          keyboardType="numeric"
          value={companyRegNumber}
          onChangeText={(int) => setCompanyRegNumber(int)}
        />
      </View>
      <Button
        containerStyle={styles.button}
        raised
        onPress={register}
        title="Register"
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={styles.loginText}
      >
        <Text style={styles.loginTextStyle}>
          Already Registered? Login Here
        </Text>
      </TouchableOpacity>

      {message !== "" && <Text style={styles.message}>{message}</Text>}
    </KeyboardAvoidingView>
  );
};

export default CompanyReg;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "white",
  },
  inputContainer: {
    width: "100%",
  },
  button: {},
  message: {
    marginTop: 10,
    color: "green",
  },
  logo: {
    width: 450,
    height: 400,
    alignSelf: "center",
    marginRight: 30,
  },
  loginText: {
    alignItems: "center",
    marginTop: 20,
  },
  loginTextStyle: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});
