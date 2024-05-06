import React, { useState } from "react";
import { Text, View, Button, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";

function UploadScreen() {
  const [excelData, setExcelData] = useState(null);

  const handleFilePick = async () => {
    try {
      const document = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (document.type === "success") {
        const workbook = XLSX.read(document.uri, { type: "uri" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(data.slice(0, 10));
      } else if (document.type === "cancel") {
        console.log("Document picker cancelled by user");
      } else {
        Alert.alert("Error", "Failed to pick the document");
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert(
        "Error",
        "Failed to pick the document. Please try again later."
      );
    }
  };

  return (
    <View>
      <Text>Upload Screen</Text>
      <Button title="Pick Excel File" onPress={handleFilePick} />
      {excelData && (
        <View>
          <Text>Uploaded Data:</Text>
          <ul>
            {excelData.map((item, index) => (
              <Text key={index}>{JSON.stringify(item)}</Text>
            ))}
          </ul>
        </View>
      )}
    </View>
  );
}

export default UploadScreen;
