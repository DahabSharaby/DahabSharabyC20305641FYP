import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { auth, db } from "../firebase";
import { Feather } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");

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

  const handleEditUserInfo = async () => {};

  const hiddenPassword = "********";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      {userData && (
        <View style={styles.userDataContainer}>
          <Text style={styles.subtitle}>User Information</Text>
          <TouchableOpacity
            onPress={handleEditUserInfo}
            style={styles.editIcon}
          >
            <Feather name="edit" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{userData.usersName}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userData.usersEmail}</Text>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{userData.usersNumber}</Text>
          <Text style={styles.label}>Company ID:</Text>
          <Text style={styles.value}>{userData.companyID}</Text>
          <Text style={styles.label}>Password:</Text>
          <Text style={styles.value}>{hiddenPassword}</Text>
        </View>
      )}
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
  userDataContainer: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    height: "50%",
    position: "relative",
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
});

export default ProfileScreen;
