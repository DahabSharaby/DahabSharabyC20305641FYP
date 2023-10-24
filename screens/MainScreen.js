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
    <View>
      <Text>MainScreen</Text>
      <TouchableOpacity onPress={signOutUser}>
                        <Text> Sign Out</Text>
                    </TouchableOpacity>
      
    </View>

    
  )
}



export default MainScreen

const styles = StyleSheet.create({})