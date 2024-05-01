import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { auth, db } from "../firebase";
import { Feather } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("User not authenticated.");
        }

        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        const userData = userDoc.data();
        console.log("User data:", userData);
        setUserData(userData);

        // Set newName and newPhone with current user data
        setNewName(userData.usersName || "");
        setNewPhone(userData.usersNumber || "");

        const companyID = userData.companyID;
        console.log("Company ID:", companyID);

        if (companyID) {
          const companiesRef = db.collection("companies");
          const querySnapshot = await companiesRef
            .where("companyID", "==", companyID)
            .get();

          if (!querySnapshot.empty) {
            const companyDoc = querySnapshot.docs[0];
            const companyData = companyDoc.data();
            console.log("Company data:", companyData);
            setCompanyData(companyData);
          } else {
            console.log(
              "No company found with the given company ID:",
              companyID
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleEditUserInfo = async () => {
    // Verify old password with the database
    try {
      const currentUser = auth.currentUser;
      const userDoc = await db.collection("users").doc(currentUser.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new Error("User data not found.");
      }

      if (oldPassword !== "" && userData.usersPassword !== oldPassword) {
        Alert.alert("Error", "Old password does not match.");
        return;
      }

      const updates = {};

      if (newName !== "") {
        updates.usersName = newName;
      }

      if (newPhone !== "") {
        updates.usersNumber = newPhone;
      }

      if (newPassword !== "") {
        updates.usersPassword = newPassword;
      }

      // Update user information
      await db.collection("users").doc(currentUser.uid).update(updates);

      setUserData((prevUserData) => ({
        ...prevUserData,
        ...updates,
      }));

      Alert.alert("Success", "User information updated successfully.");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user information:", error);
      Alert.alert("Error", "Failed to update user information.");
    }
  };

  const hiddenPassword = "********";

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}>User Profile</Text>
        <View style={styles.userDataContainer}>
          <Text style={styles.subtitle}>User Information</Text>
          {!editMode && (
            <TouchableOpacity
              onPress={() => setEditMode(true)}
              style={styles.editIcon}
            >
              <Feather name="edit" size={24} color="black" />
            </TouchableOpacity>
          )}
          {editMode && (
            <View>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter new name"
              />
              <Text style={styles.label}>Phone:</Text>
              <TextInput
                style={styles.input}
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="Enter new phone number"
              />
              <Text style={styles.label}>Old Password:</Text>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={true}
                placeholder="Enter old password"
              />
              <Text style={styles.label}>New Password:</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
                placeholder="Enter new password"
              />
              <TouchableOpacity
                onPress={handleEditUserInfo}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
          {!editMode && (
            <View>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{userData && userData.usersName}</Text>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>
                {userData && userData.usersEmail}
              </Text>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>
                {userData && userData.usersNumber}
              </Text>
              <Text style={styles.label}>Company ID:</Text>
              <Text style={styles.value}>{userData && userData.companyID}</Text>
              <Text style={styles.label}>Password:</Text>
              <Text style={styles.value}>{hiddenPassword}</Text>
            </View>
          )}
        </View>
        {companyData && (
          <View style={styles.companyDataContainer}>
            <Text style={styles.subtitle}>Company Information</Text>
            <Text style={styles.label}>Company Name:</Text>
            <Text style={styles.value}>{companyData.companyName}</Text>
            <Text style={styles.label}>Company Email:</Text>
            <Text style={styles.value}>{companyData.companyEmail}</Text>
            <Text style={styles.label}>Company Number:</Text>
            <Text style={styles.value}>{companyData.companyNumber}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  userDataContainer: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    minHeight: 400,
  },
  companyDataContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default ProfileScreen;
