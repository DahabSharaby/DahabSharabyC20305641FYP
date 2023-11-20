import React, { useState } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const ScannerScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      analyzeImage(result.uri);
    }
  };

  const analyzeImage = async (uri) => {
    try {
      const apiKey = 'AIzaSyBJ3FyjJzcNMApNqb7itGQBGP4wE6BO5bI'; 
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const base64ImageData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);
      const detectedText = apiResponse.data.responses[0].fullTextAnnotation.text;
      setRecognizedText(detectedText);
    } catch (error) {
      console.error('Error analyzing image:', error.response ? error.response.data : error.message);
      alert('Error analyzing image. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Detect Handwritten Text</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 300, height: 300 }} />
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.text}>Choose an image...</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        multiline={true}
        placeholder="Recognized Text"
        value={recognizedText}
        onChangeText={(text) => setRecognizedText(text)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'lightblue',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 20,
    padding: 10,
  },
});

export default ScannerScreen;
