import { Text, StyleSheet, View , Image, TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

 const DetectOject = () => {
    const [imageUri, setImageUri] = useState(null);
    const [labels, setLabels] = useState([]);
    const pickImage = async () => {

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4,3],
                quality: 1,
            });

            if (!result.canceled){
                setImageUri(result.assets[0].uri);
            }
        console.log(result);
        }catch(error) {
         console.error('error picking image:' , error);
        }

    };

    const analyzeImage = async () => {
        try{
            if(!imageUri){
                alert('pleasse pick an image');
                return;
            }
            // here making api connection
            const apiKey = "AIzaSyBJ3FyjJzcNMApNqb7itGQBGP4wE6BO5bI";
            const apiURL = 'https://vision.googleapis.com/v1/images:annotate?key=${apiKey}';

            //here reading the image and converting it to base64
            const base64ImageData = await FileSystem.readAsStringAsync(imageUri,{
                encoding: FileSystem.EncodingType.Base64,
            });

            const requestData = {
            requests: [
                {
                    image:{
                        content: base64ImageData,
                    },
                    features: [{type: 'LABEL_DETECTION', MAXResults: 5}],
                },
            ],

        };

        const apiResponse = await axios.post(apiURL, requestData);
        setLabels(apiResponse.data.responses[0].labelAnnotations);

    }catch(error){
        console.error('error analyzing image:' , error);
        alert('error analyzing image. please try againg:');
    }
 };

    return (
      <View>
        <Text>DetectOject</Text>

        {imageUri && (
            <image
                source={{uri: imageUri}}
                style={{width: 300, height}}
            />
        )}
        <TouchableOpacity>
            onPress={pickImage}
            style={styles.button}

            <Text style={styles.text}>Choose an image...</Text>

        </TouchableOpacity>

        <TouchableOpacity>
            onPress={analyzeImage}
            style={styles.button}

            <Text style={styles.text}>analyzeImage image...</Text>

        </TouchableOpacity>
{
    labels.length > 0 && (
        <View>
          <Text style={styles.labels}>
            Labels: 
            </Text> 
            {
                labels.map((label) => (
                    <Text 
                    key={label.mid}
                    style={styles.outputtext}
                    >
                        {label.decription}
                    </Text>
                ))
            } 
        </View>
    )
}


      </View>
    )
}

const styles = StyleSheet.create({


})

export default DetectOject