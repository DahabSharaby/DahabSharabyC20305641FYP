import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, Input, Text } from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { auth, db } from "../firebase";

const { width } = Dimensions.get("window");
const logoWidth = width * 20;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [pass, setPassword] = useState("");
  const [id, setCompanyId] = useState("");
  const [error, setError] = useState("");

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const companyIdInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      console.log(authUser);
      if (authUser) {
        navigation.navigate("Main");
      }
    });

    return unsubscribe;
  }, []);

  const signIn = () => {
    const companyIdNumber = Number(id);
    if (isNaN(companyIdNumber)) {
      setError("Company ID must be a number.");
      return;
    }

    db.collection("/companies")
      .where("companyID", "==", companyIdNumber)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size === 0) {
          setError("Invalid company ID. Please provide a valid ID.");
        } else {
          auth
            .signInWithEmailAndPassword(email, pass)
            .then(() => {
              setEmail("");
              setPassword("");
              setCompanyId("");
              setError("");
            })
            .catch((error) => setError(error.message));
        }
      })
      .catch((error) => {
        console.error("Error checking company ID:", error);
        setError("An error occurred. Please try again.");
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="light" />

      <Image
        source={require("../image1/DigitalBlitz.png")}
        style={{
          width: logoWidth,
          resizeMode: "contain",
          marginRight: 30,
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          ref={emailInputRef}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
          onSubmitEditing={() => passwordInputRef.current.focus()}
        />

        <TextInput
          ref={passwordInputRef}
          placeholder="Password"
          secureTextEntry
          value={pass}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          onSubmitEditing={() => companyIdInputRef.current.focus()}
        />

        <TextInput
          ref={companyIdInputRef}
          placeholder="Company ID"
          keyboardType="numeric"
          value={id}
          onChangeText={(text) => setCompanyId(text)}
          style={styles.input}
          onSubmitEditing={signIn}
        />

        {error !== "" && <Text style={styles.error}>{error}</Text>}
      </View>

      <Button
        containerStyle={styles.loginButton}
        buttonStyle={{ backgroundColor: "#007bff" }}
        titleStyle={{ color: "#fff" }}
        onPress={signIn}
        title="Login"
      />

      <Text
        style={styles.registerText}
        onPress={() => navigation.navigate("Register")}
      >
        Haven't registered yet? No problem! Press here to register.
      </Text>
    </KeyboardAvoidingView>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  inputContainer: {
    width: width - 40,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 18,
  },
  loginButton: {
    width: "100%",
    marginBottom: 10,
  },
  registerText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  error: {
    marginTop: 10,
    color: "red",
  },
});
