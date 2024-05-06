import React from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const WelcomeScreen = ({ navigation }) => {
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logoContainer}>
        <Image
          source={require("../images/DigitalBlit.png")}
          style={styles.logo}
        />
      </View>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.customButton}
        >
          <Text style={styles.customButtonText}>Staff Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.customButton}
        >
          <Text style={styles.customButtonText}>Staff Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Company Registeration")}
          style={styles.customButton}
        >
          <Text style={styles.customButtonText}>Company Registration</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#004080",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
    height: "50%",
    marginLeft: 1,
    marginRight: 30,
  },
  logo: {
    width: "150%",
    height: "140%",
    resizeMode: "contain",
  },
  contentContainer: {
    width: "100%",
  },
  header: {
    fontSize: 30,
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },
  customButton: {
    backgroundColor: "#0056b3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  customButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
