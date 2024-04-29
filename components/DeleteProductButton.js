import { StyleSheet, View, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const DeleteProductButton = ({ index, onDelete }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onDelete(index)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

export default DeleteProductButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginRight: 10,
    marginTop: 10,
  },
});
