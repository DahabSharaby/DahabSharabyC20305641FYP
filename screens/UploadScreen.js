import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Alert,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import XLSX from "xlsx";

const UploadScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access media library is required!");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      setError(error.message || "Unknown error occurred");
    }
  };

  const parseExcelData = async (fileUri) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const workbook = XLSX.read(fileContent, { type: "binary" });
      const sheetNames = workbook.SheetNames;

      const parsedData = sheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        return { sheetName, sheetData };
      });

      setExtractedData(parsedData);
      setIsLoading(false);
      Alert.alert("Success", "Data uploaded successfully!");
    } catch (error) {
      console.error("Error in parseExcelData:", error);
      setError(error.message || "Unknown error occurred");
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      console.log("DocumentPicker result:", result);

      if (result.type === "cancel") {
        throw new Error("File selection canceled by user");
      }

      const fileUri = result.assets[0].uri;

      console.log("Parsed file URI:", fileUri);

      await parseExcelData(fileUri);
    } catch (error) {
      console.error("Error in handleUpload:", error);
      setError(error.message || "Unknown error occurred");
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Button
        title="Upload Excel File"
        onPress={handleUpload}
        disabled={isLoading}
      />

      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && <Text>Error: {error}</Text>}

      <View style={{ marginTop: 20 }}>
        {extractedData.map((sheet, index) => (
          <View key={index}>
            <Text>Sheet Name: {sheet.sheetName}</Text>
            <FlatList
              data={sheet.sheetData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text>{JSON.stringify(item)}</Text>}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default UploadScreen;
