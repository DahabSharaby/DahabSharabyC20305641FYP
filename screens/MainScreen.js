import { StyleSheet, Text, View, TouchableOpacity  } from 'react-native'
import React from 'react'
import { auth } from '../firebase';

const MainScreen = ({navigation}) => {

  const signOutUser = () => {
    auth.signOut().then(() => {
        navigation.replace('Register')
    })
}



return (
  <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <StatusBar style="light"/>
      

      <View style= {styles.inputContainer}>
      <Text>MainScreen</Text>
      <TouchableOpacity onPress={signOutUser}>
                        <Text> Sign Out</Text>
                    </TouchableOpacity>
    
       </View>

      <Button onPress={() => navigation.navigate("Scanner")} 
      containerStyle={styles.button} type="outline" title="Scanner"/>

      <Button onPress={() => navigation.navigate("Input")} 
      containerStyle={styles.button} type="outline" title="Input"/>

      <Button onPress={() => navigation.navigate("Dashboard")} 
      containerStyle={styles.button} type="outline" title="Dashboard"/>
      
   </KeyboardAvoidingView>
);

      }



export default MainScreen

const styles = StyleSheet.create({})