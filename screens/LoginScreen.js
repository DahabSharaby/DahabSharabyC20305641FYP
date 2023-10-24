import React, { useEffect, useState } from 'react'
import {StyleSheet, View } from 'react-native'
import {Button, Input, } from "react-native-elements";
import {StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from 'react-native';
import { auth } from '../firebase';
const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState("")
    const [pass, setPassword] = useState("")
    const [id, setCompanyId] = useState ("")
    
    {
         useEffect (() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
                console.log(authUser);
                if (authUser){
                    navigation.navigate("Main");
                } 
        });

        return unsubscribe;
    }, []);
    };

    const signIn = () => {
        auth.signInWithEmailAndPassword(email, pass).catch((error) => alert(error))
    }
      
    return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
            <StatusBar style="light"/>

            <View style= {styles.inputContainer}>
                <Input placeholder="Email" autoFocus type="email"
                value={email} onChangeText={(text) => setEmail(text)}/>

                <Input placeholder="Password" secureTextEntry type="password"
                value={pass} onChangeText={(text) => setPassword(text)}/>

                <Input placeholder="CompanyID" autoFocus type="id"
                value={id} onChangeText={(int) => setCompanyId(int)}/> 

            </View>

            <Button containerStyle={styles.button} onPress={signIn} title="Login"/>

            {/* <Button onPress={() => navigation.navigate("Main")} 
             containerStyle={styles.button} title="Login"/> */}
            
            <Button onPress={() => navigation.navigate("Register")} 
            containerStyle={styles.button} type="outline" title="Regstier"/>
            
         </KeyboardAvoidingView>
    );
};

export default LoginScreen 

const styles = StyleSheet.create({
    Container:{
        flex: 1,
        alignItems: "center",
        justifyContent:"center",
        padding: 10,
    },
    inputContainer:{},
    button:{},

});