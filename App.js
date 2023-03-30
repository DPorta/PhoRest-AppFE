import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as Sharing from "expo-sharing";

export default function App() {
  const [imageUri, setImageUri] = useState(null);

  //Peticion de permisos
  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );
      if (status !== "granted") {
        alert(
          "Se requieren permisos de cámara y galería para usar esta aplicación."
        );
      }
    })();
  }, []);

  //Escoger la imagen
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };
  //Compartir la imagen
  const shareImage = async () => {
    try {
      await Sharing.shareAsync(imageUri);
    } catch (error) {
      console.log(error);
    }
  };
  //Test
  const test = async () => {
    try {
      console.log(imageUri);
    } catch (error) {
      console.log(error);
    }
  };
  //TEST API POST TO SEND IMAGE
  /*
  import axios from 'axios';
  const processImage = async () => {
    try {
      let formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      let response = await axios.post(
        'https://example.com/api/process-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProcessedImageUri(response.data.imageUri);
    } catch (error) {
      console.log(error);
    }
  };

  */

  return (
    <View style={styles.container}>
      <Text style={styles.myTitle}>PhotoRestorer</Text>
      <Text style={styles.mysubTitle}>
        Restauración de fotos antiguas o dañadas
      </Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.myImage} />
      ) : (
        <Image
          source={{ uri: "https://picsum.photos/200/200" }}
          style={styles.myImage}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.button}>
          <Feather name="image" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={test} style={styles.button}>
          <Feather name="camera" size={24} color="white" />
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity onPress={shareImage} style={styles.button}>
            <Feather name="share" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <StatusBar style="inverted" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  myTitle: {
    color: "#fff",
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
  },
  mysubTitle: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 10,
  },
  myImage: {
    height: 200,
    width: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
