import { StyleSheet, View, Button } from "react-native";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const DeleteProductButton = ({ index, onDelete }) => {
  return (
    <View>
      <Button title="deleteButton" onPress={() => onDelete(index)}>
        <FontAwesomeIcon icon={faTrash} size={20} style={styles.icon} />
      </Button>
    </View>
  );
};

export default DeleteProductButton;

const styles = StyleSheet.create({
  icon: {
    color: "red",
  },
});

// 1. Scan screen pass to the DeleteProductButton a prop called index= products index.
// 2. deletebutton file take that prop index and use it in the handleDelete props.index  passing data by prop
