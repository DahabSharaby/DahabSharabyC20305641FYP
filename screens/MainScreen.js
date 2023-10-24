import { StyleSheet, Text, View, TouchableOpacity  } from 'react-native'
import React from 'react'
import { auth } from '../firebase';
import { KeyboardAvoidingView } from 'react-native';
import {StatusBar } from "expo-status-bar";
import {Button, Input, } from "react-native-elements";

const MainScreen = ({navigation}) => {

  const signOutUser = () => {
    auth.signOut().then(() => {
        navigation.replace('Welcome')
    })
}



return (
  <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <StatusBar style="light"/>
      

      <View style= {styles.inputContainer}>
      <Text>MainScreen</Text>
     
       </View>

      <Button onPress={() => navigation.navigate("Scanner")} 
      containerStyle={styles.button} type="outline" title="Scanner"/>

      <Button onPress={() => navigation.navigate("Input")} 
      containerStyle={styles.button} type="outline" title="Input"/>

      <Button onPress={() => navigation.navigate("Dashboard")} 
      containerStyle={styles.button} type="outline" title="Dashboard"/>

<TouchableOpacity onPress={signOutUser}>
                        <Text> Sign Out</Text>
                    </TouchableOpacity>
      
   </KeyboardAvoidingView>
);

      }



export default MainScreen

const styles = StyleSheet.create({})