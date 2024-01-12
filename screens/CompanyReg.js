import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Button, Input } from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from 'react-native';
import { auth, db } from '../firebase';

const CompanyReg = ({ navigation }) => {
  const [CompanyName, setCompanyName] = useState("");
  const [num, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPassword] = useState("");
  const [message, setMessage] = useState(""); 

  const generateCompanyID = () => {
    return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const register = () => {
    const companyID = generateCompanyID();

    auth.createUserWithEmailAndPassword(email, pass)
      .then((authUser) => {
        db.collection('/companies').doc(authUser.user.uid).set({
          usersEmail: email,
          usersPassword: pass,
          usersName: CompanyName,
          usersNumber: num,
          companyID: companyID,
        });

        authUser.user.updateProfile({
          displayName: CompanyName,
        });

        authUser.user.sendEmailVerification()
          .then(() => {
            setMessage("Thank you for registering! Your company ID has been sent to your email.");
            console.log("Email sent with companyID");
          })
          .catch((error) => {
            setMessage("Error sending email verification. Please try again.");
            console.error("Error sending email verification", error);
          });

        if (authUser) {
          navigation.replace("Main");
        }

        setCompanyName('');
        setNumber('');
        setEmail('');
        setPassword('');
      })
      .catch((error) => {
        setMessage(`Error: ${error.message}`);
        console.error(error.message);
      });
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.inputContainer}>
        <Input
          placeholder="Company Name"
          autoFocus
          type="CompanyName"
          value={CompanyName}
          onChangeText={(text) => setCompanyName(text)}
        />

        <Input
          placeholder="Number"
          autoFocus
          type="num"
          value={num}
          onChangeText={(int) => setNumber(int)}
        />

        <Input
          placeholder="Email"
          autoFocus
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        <Input
          placeholder="Password"
          secureTextEntry
          type="password"
          value={pass}
          onChangeText={(text) => setPassword(text)}
        />
      </View>

      <Button onPress={() => navigation.navigate("Login")} containerStyle={styles.button} title="Login" />

      <Button containerStyle={styles.button} raised onPress={register} title="Register" />

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
  },
  inputContainer: {
    width: '100%',
  },
  button: {},
  message: {
    marginTop: 10,
    color: 'green',
  },
});
