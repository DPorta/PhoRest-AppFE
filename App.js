import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as Sharing from "expo-sharing";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { Camera } from "expo-camera";

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  //Peticion de permisos
  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA,
        Permissions.MEDIA_LIBRARY
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
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  //Tomar foto con camara de usuario
  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      console.log(photo);
      setImageUri(photo.uri);
      setCameraActive(false);
      // Aquí puedes hacer lo que quieras con la foto
    }
  };
  //Editar la imagen
  const editImage = async () => {
    const imgUri = imageUri;
    const editedImage = await ImageManipulator.manipulateAsync(imgUri, [], {
      format: "png",
    });
    console.log(editedImage);
    setImageUri(editedImage.uri);
  };
  //Descargar la imagen
  const downloadImage = async () => {
    const asset = await MediaLibrary.createAssetAsync(imageUri);
    await MediaLibrary.createAlbumAsync("PhoRest", asset, false);
    console.log(asset);
    ToastAndroid.show(
      "La imagen se ha descargado con éxito.",
      ToastAndroid.SHORT
    );
  };
  //Compartir la imagen
  const shareImage = async () => {
    try {
      await Sharing.shareAsync(imageUri);
    } catch (error) {
      console.log(error);
      alert(error);
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
        <TouchableOpacity
          onPress={() => setCameraActive(true)}
          style={styles.button}
        >
          <Feather name="camera" size={24} color="white" />
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity onPress={editImage} style={styles.button}>
            <Feather name="edit" size={24} color="white" />
          </TouchableOpacity>
        )}
        {imageUri && (
          <TouchableOpacity onPress={downloadImage} style={styles.button}>
            <Feather name="download" size={24} color="white" />
          </TouchableOpacity>
        )}
        {imageUri && (
          <TouchableOpacity onPress={shareImage} style={styles.button}>
            <Feather name="share-2" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={test} style={styles.Sbutton}>
        <Text style={styles.myText}>Restaurar</Text>
      </TouchableOpacity>

      {cameraActive && (
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.buttonCamContainer}>
            <TouchableOpacity
              style={styles.buttonCam}
              onPress={() => takePicture()}
            ></TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonCancelCam}
              onPress={() => setCameraActive(false)}
            >
              <Feather name="x-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      )}

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
  myText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
  },
  myImage: {
    height: "25%",
    width: "60%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  Sbutton: {
    backgroundColor: "#32CD32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "60%",
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  buttonCamContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
  },
  buttonCam: {
    width: 70,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 50,
    borderWidth: 5,
    borderColor: "#000",
  },
  buttonCancelCam: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    right: 20,
    width: 35,
    height: 35,
    backgroundColor: "black",
    borderRadius: 50,
    borderWidth: 5,
    borderColor: "#000",
  },
});
