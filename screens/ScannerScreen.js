import React, { useState } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const ScannerScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [labels, setLabels] = useState([]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setImageUri(result.assets[0].uri);
      }
      console.log(result);
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const analyzeImage = async () => {
    try {
      if (!imageUri) {
        alert('Please pick an image');
        return;
      }

      
      const apiKey = "AIzaSyBJ3FyjJzcNMApNqb7itGQBGP4wE6BO5bI"; 
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [{ type: 'LABEL_DETECTION', maxResults: 5 }], 
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);
      setLabels(apiResponse.data.responses[0].labelAnnotations);
    } catch (error) {
      console.error('Error analyzing image:', error.response ? error.response.data : error.message);
      alert('Error analyzing image. Please try again.');
    }
    
  };

  return (
    <View style={styles.container}>
      <Text>Detect Object</Text>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 300, height: 300 }} 
        />
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.text}>Choose an image...</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={analyzeImage}>
        <Text style={styles.text}>Analyze image...</Text>
      </TouchableOpacity>

      {labels.length > 0 && (
        <View>
          <Text style={styles.labels}>Labels:</Text>
          {labels.map((label) => (
            <Text key={label.mid} style={styles.outputText}>
              {label.description}
            </Text>
          ))}
        </View>
      )}
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
  labels: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  outputText: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default ScannerScreen;