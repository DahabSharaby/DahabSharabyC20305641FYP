import { StyleSheet, Text, View, TouchableOpacity  } from 'react-native'
import React from 'react'
import { KeyboardAvoidingView } from 'react-native';
import {StatusBar } from "expo-status-bar";
import {Button, Input, } from "react-native-elements";

const WelcomeScreen = ({navigation}) => {
return (
  <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <StatusBar style="light"/>

      <View style={styles.contentContainer}>
        <Text style={styles.header}>Welcome</Text>
     
    
       <Button onPress={() => navigation.navigate("Login")} 
      containerStyle={styles.button} title="Staff Login"/>

      <Button onPress={() => navigation.navigate("Register")} 
     containerStyle={styles.button} title="Staff Sign up"/> 

      <Button onPress={() => navigation.navigate("Company Registeration")} 
     containerStyle={styles.button} title="Company Registeration"/> 


      </View>
   </KeyboardAvoidingView>
);
}

export default WelcomeScreen

  const styles = StyleSheet.create({
      container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    contentContainer: {
      width: '100%',
    },
    header: {
      fontSize: 30, 
      textAlign: 'center', 
      marginBottom: 10,
    },
    button: {
      marginTop: 10,
    },
    buttonStyle: {
      width: '100%',  
    },
  });
