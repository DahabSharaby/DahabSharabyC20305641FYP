import React, { useState } from 'react'
import {StyleSheet, Text, View } from 'react-native'
import {button, Input, Impage } from "react-native-elements";
import {StatusBar } from "expo-status-bar";


const LoginScreen = () => {
    const [email, setEmail] = useState("")
    const [pass, setPassword] = useState("")
    return (
        <View>
            <StatusBar style="light"/>

            <Text> Login Screen </Text>
            <View style= {styles.inputContainer}>
                <Input placeholder="Email" autoFocus type="email"
                value={email} onChangeText={(text) => setEmail(text)}/>

                <Input placeholder="Password" secureTextEntry type="password"
                value={pass} onChangeText={(text) => setPassword(text)}/>

            </View>


         </View>
    );
};

export default LoginScreen 

const styles = StyleSheet.create({
    inputContainer:{},

});