import { StyleSheet, Text, View, TouchableOpacity  } from 'react-native'
import React from 'react'
import { auth } from '../firebase';
import { KeyboardAvoidingView } from 'react-native';
import {StatusBar } from "expo-status-bar";
//import {StyleSheet, View } from 'react-native'
import {Button, Input, } from "react-native-elements";

const WelcomeScreen = ({navigation}) => {

  const signOutUser = () => {
    auth.signOut().then(() => {
        navigation.replace('Register')
    })
}

//   return (
//     <View>
//    

// </View>
//   )

return (
  <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <StatusBar style="light"/>

      <View style= {styles.inputContainer}>
      <Text>Welcome</Text>
     
    
       <Button onPress={() => navigation.navigate("Login")} 
      containerStyle={styles.button} title="Login"/>

      <Button onPress={() => navigation.navigate("Register")} 
     containerStyle={styles.button} title="Register"/> 


      </View>
   </KeyboardAvoidingView>
);
}



export default WelcomeScreen

const styles = StyleSheet.create({

})