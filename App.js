import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as Sharing from "expo-sharing";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Camera } from "expo-camera";
import { Buffer } from "buffer";

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [restaurada, setRestaurada] = useState(false);
  const [base64Img, setbase64Img] = useState(null);
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
      base64: true,
    });
    if (!result.canceled) {
      //console.log(result.assets);
      //console.log(Object.keys(result.assets[0]));
      setbase64Img(result.assets[0].base64);
      setImageUri(result.assets[0].uri);
      setRestaurada(false);
    }
  };
  //Tomar foto con camara de usuario
  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync({
        allowsEditing: true,
        base64: true,
      });
      //console.log(Object.keys(photo));
      //console.log(photo.base64Img);
      setbase64Img(photo.base64);
      setImageUri(photo.uri);
      setCameraActive(false);
      setRestaurada(false);
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
    try {
      await MediaLibrary.createAlbumAsync("PhoRest", asset, false);
      ToastAndroid.show(
        "La imagen se ha descargado con éxito.",
        ToastAndroid.SHORT
      );
      console.log(imageUri);
    } catch (error) {
      alert(error);
    }
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
  const restoreImage = async () => {
    ToastAndroid.show("Enviando a restaurar...", ToastAndroid.SHORT);
    const formData = new FormData();
    formData.append("filename", {
      uri: imageUri,
      type: "image/jpeg",
      name: "filename.jpg",
    });

    fetch("https://dporta.pythonanywhere.com/getfilename", {
      method: "POST",
      redirect: "follow",
      body: formData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        setRestaurada(true);
        setImageUri(responseJson.finalImage);
        Alert.alert("Listo, el resultado es:", responseJson.imageResult, [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Abrir Imagen",
            onPress: () => Linking.openURL(responseJson.finalImage),
          },
        ]);
        //alert("Tu imagen está en: " + responseJson.finalImage);
        //ToastAndroid.show("Listo!!!", ToastAndroid.SHORT);
      })
      .catch((error) => {
        console.log("NOTTTT: " + error);
        alert("No se pudo enviar: " + error);
      });
  };

  return (
    <View style={styles.container}>
      {!cameraActive && (
        <View>
          <Text style={styles.myTitle}>PhotoRestorer</Text>
          <Text style={styles.mysubTitle}>
            Restauración de fotos antiguas o dañadas
          </Text>
        </View>
      )}
      {cameraActive ? (
        <View></View>
      ) : restaurada ? (
        <View>
          <Text style={styles.myRestoredTitle}>Imagen Restaurada :D</Text>
        </View>
      ) : (
        <View></View>
      )}
      {cameraActive ? (
        <View></View>
      ) : imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.myImage} />
      ) : (
        <Image
          source={{ uri: "https://picsum.photos/200/200" }}
          style={styles.myImage}
        />
      )}
      {!cameraActive && (
        <View style={styles.container2}>
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
          <TouchableOpacity onPress={restoreImage} style={styles.Sbutton}>
            <Text style={styles.myText}>Restaurar</Text>
          </TouchableOpacity>
        </View>
      )}
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
  container2: {
    alignItems: "center",
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
  myRestoredTitle: {
    color: "#4BB543",
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
