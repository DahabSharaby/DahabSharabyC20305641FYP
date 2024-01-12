import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Button, Input, Text } from 'react-native-elements'; 
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView } from 'react-native';
import { auth, db } from '../firebase';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [pass, setPassword] = useState('');
  const [id, setCompanyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      console.log(authUser);
      if (authUser) {
        navigation.navigate('Main');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = () => {
    db.collection('/companies')
      .where('companyID', '==', id)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size === 0) {
          setError('Invalid company ID. Please provide a valid ID.');
        } else {
          auth
            .signInWithEmailAndPassword(email, pass)
            .then(() => {
              setEmail('');
              setPassword('');
              setCompanyId('');
              setError('');
            })
            .catch((error) => setError(error.message));
        }
      })
      .catch((error) => {
        console.error('Error checking company ID:', error);
        setError('An error occurred. Please try again.');
      });
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.inputContainer}>
        <Input
          placeholder="Email"
          autoFocus
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input} 
        />

        <Input
          placeholder="Password"
          secureTextEntry
          type="password"
          value={pass}
          onChangeText={(text) => setPassword(text)}
          style={styles.input} 
        />

        <Input
          placeholder="CompanyID"
          autoFocus
          type="id"
          value={id}
          onChangeText={(int) => setCompanyId(int)}
          style={styles.input} 
        />

        {error !== '' && <Text style={styles.error}>{error}</Text>}
      </View>

      <Button containerStyle={styles.button} onPress={signIn} title="Login" />

      <Button
        onPress={() => navigation.navigate('Register')}
        containerStyle={styles.button}
        type="outline"
        title="Register"
      />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  inputContainer: {
    width: width - 40, 
  },
  input: {
    width: '100%', 
  },
  button: {},
  error: {
    marginTop: 10,
    color: 'red',
  },
});
