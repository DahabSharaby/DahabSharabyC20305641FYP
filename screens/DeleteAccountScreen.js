import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, BackHandler } from 'react-native';
import { db, auth } from '../firebase';

const DeleteAccountScreen = () => {
  const currentUser = auth.currentUser;

  const deleteUserAccount = async () => {
    try {
      if (currentUser) {
        await db.collection('users').doc(currentUser.uid).delete();
        await auth.currentUser.delete();
        Alert.alert('Deleting Account', 'Your account is being deleted now.', [], { cancelable: false });

        setTimeout(() => {
          Alert.alert('Goodbye', 'Sorry to see you go. Your account has been deleted.', [], { cancelable: false });

          setTimeout(async () => {
            await auth.signOut();
            BackHandler.exitApp();
          }, 5000); 
        }, 10000); 
      } else {
        Alert.alert('Error', 'No user is currently logged in.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the account.');
      console.error('Error deleting account:', error);
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Cannot go back. Account deletion in progress.');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); 
  }, []);

  return (
    <View style={styles.container}>
      <Text>DeleteAccountScreen</Text>
      <Button title="Delete Account" onPress={deleteUserAccount} />
    </View>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
