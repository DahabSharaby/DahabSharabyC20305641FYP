import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Text, Input, Button } from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from "react-native";
import { auth, db } from "../firebase";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [num, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [companyID, setCompanyID] = useState("");
  const [error, setError] = useState("");

  const register = () => {
    if (pass !== confirmPass) {
      setError("Passwords do not match");
      return;
    }

    // Convert companyID to a number
    const companyIdNumber = parseInt(companyID);
    if (isNaN(companyIdNumber)) {
      setError("Invalid company ID. Please provide a valid ID.");
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
            .createUserWithEmailAndPassword(email, pass)
            .then((authUser) => {
              db.collection("/users")
                .doc(authUser.user.uid)
                .set({
                  usersEmail: email,
                  usersPassword: pass,
                  usersName: name,
                  usersNumber: num !== "" ? parseInt(num) : 0,
                  companyID: companyIdNumber, // Use the converted companyID
                });

              authUser.user.updateProfile({
                displayName: name,
              });

              if (authUser) {
                navigation.replace("Main");
              }

              setName("");
              setNumber("");
              setEmail("");
              setPassword("");
              setConfirmPass("");
              setCompanyID("");
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
      <View style={styles.logoContainer}>
        <Image
          source={require("../image1/DigitalBlitz.png")}
          style={styles.logo}
        />
      </View>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Name"
          autoFocus={false}
          type="name"
          value={name}
          onChangeText={(text) => setName(text)}
        />

        <Input
          placeholder="Phone Number"
          autoFocus={false}
          keyboardType="numeric"
          value={num.toString()}
          onChangeText={(text) => setNumber(text)}
        />

        <Input
          placeholder="Email"
          autoFocus={false}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        <Input
          placeholder="Password"
          secureTextEntry
          autoFocus={false}
          value={pass}
          onChangeText={(text) => setPassword(text)}
        />

        <Input
          placeholder="Confirm Password"
          secureTextEntry
          autoFocus={false}
          value={confirmPass}
          onChangeText={(text) => setConfirmPass(text)}
        />

        <Input
          placeholder="Company ID"
          autoFocus={false}
          keyboardType="numeric"
          value={companyID.toString()}
          onChangeText={(text) => setCompanyID(text)}
        />

        {error !== "" && <Text style={styles.error}>{error}</Text>}
      </View>
      <Button
        onPress={register}
        containerStyle={styles.button}
        title="Register"
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={styles.textButton}
      >
        <Text style={styles.textButtonLabel}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logo: {
    width: "150%",
    height: "100%",
    resizeMode: "contain",
    marginRight: 30,
  },
  inputContainer: {
    width: "100%",
  },
  button: {
    marginTop: 10,
  },
  textButton: {
    alignItems: "center",
    marginTop: 10,
  },
  textButtonLabel: {
    color: "#007bff",
  },
  error: {
    marginTop: 10,
    color: "red",
  },
});
