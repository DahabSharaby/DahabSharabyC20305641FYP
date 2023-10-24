import { StyleSheet, Text, View, TouchableOpacity  } from 'react-native'
import React from 'react'
import { auth } from '../firebase';

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
     <TouchableOpacity onPress={signOutUser}>
           <Text> Sign Out</Text>
           </TouchableOpacity>
    
      {/* <Button onPress={() => navigation.navigate("Login")} 
      containerStyle={styles.button} title="Login"/>

      <Button onPress={() => navigation.navigate("Register")} 
/      containerStyle={styles.button} title="Login"/> */}


      </View>

      <Button containerStyle={styles.button} onPress={signIn} title="Login"/>

      {/* <Button onPress={() => navigation.navigate("Main")} 
       containerStyle={styles.button} title="Login"/> */}
      
      <Button onPress={() => navigation.navigate("Register")} 
      containerStyle={styles.button} type="outline" title="Regstier"/>
      
   </KeyboardAvoidingView>
);
}



export default WelcomeScreen

const styles = StyleSheet.create({})