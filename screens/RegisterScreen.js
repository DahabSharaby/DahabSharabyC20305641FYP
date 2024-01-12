import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Button, Input } from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from 'react-native';
import { auth, db } from '../firebase';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [num, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPassword] = useState("");
  const [companyID, setCompanyID] = useState("");
  const [error, setError] = useState("");

  const register = () => {
    db.collection('/companies')
      .where('companyID', '==', companyID)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size === 0) {
          setError("Invalid company ID. Please provide a valid ID.");
        } else {
          
          auth.createUserWithEmailAndPassword(email, pass)
            .then((authUser) => {
              db.collection('/users').doc(authUser.user.uid).set({
                usersEmail: email,
                usersPassword: pass,
                usersName: name,
                usersNumber: num,
                companyID: companyID,
              });

              authUser.user.updateProfile({
                displayName: name,
              });

              console.log(authUser);

              if (authUser) {
                navigation.replace("Main");
              }

              setName('');
              setNumber('');
              setEmail('');
              setPassword('');
              setCompanyID('');
              setError('');
            })
            .catch((error) => alert(error.message));
        }
      })
      .catch((error) => {
        console.error("Error checking company ID:", error);
        setError("An error occurred. Please try again.");
      });
  };

  return (
    <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.inputContainer}>
        <Input
          placeholder="Name"
          autoFocus
          type="name"
          value={name}
          onChangeText={(text) => setName(text)}
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

        <Input
          placeholder="Company ID"
          autoFocus
          type="companyID"
          value={companyID}
          onChangeText={(text) => setCompanyID(text)}
        />

        {error !== "" && <Text style={styles.error}>{error}</Text>}
      </View>

      <Button onPress={() => navigation.navigate("Login")} containerStyle={styles.button} title="Login" />

      <Button containerStyle={styles.button} raised onPress={register} title="Register" />
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
  },
  inputContainer: {
    width: '100%',
  },
  button: {},
  error: {
    marginTop: 10,
    color: 'red',
  },
});
