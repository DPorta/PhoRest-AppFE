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
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [imageLabel, setImageLabel] = useState(null);
  const [restaurada, setRestaurada] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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
      //console.log(result.assets);
      //console.log(Object.keys(result.assets[0]));
      setImageUri(result.assets[0].uri);
      setRestaurada(false);
      setDownloaded(false);
    }
  };

  //Tomar foto con camara de usuario
  /*const takePicture = async () => {
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
      setDownloaded(false);
      // Aquí puedes hacer lo que quieras con la foto
    }
  };*/
  const takePictureCam = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (pickerResult.cancelled === true) {
      return;
    }
    setImageUri(pickerResult.assets[0].uri);
    setRestaurada(false);
    setDownloaded(false);
  };
  //Descargar imagen en PhoRest
  async function saveImageToAlbum(uri) {
    const asset = await MediaLibrary.createAssetAsync(uri);
    setImageUri(uri);
    console.log("asset uri: " + asset.uri);
    await MediaLibrary.createAlbumAsync("PhoRest", asset, false);
    ToastAndroid.show(
      "La imagen se ha descargado con éxito.",
      ToastAndroid.SHORT
    );
    console.log("rf" + imageUri);
    setDownloaded(true);
  }
  //Descargar la imagen de URL
  const downloadImage = async () => {
    console.log("1st uri: " + imageUri);
    FileSystem.downloadAsync(
      imageUri,
      FileSystem.documentDirectory + "image.png"
    )
      .then(({ uri }) => {
        console.log("dwd uri: " + uri);
        saveImageToAlbum(uri);
      })
      .catch((error) => {
        console.log("Error downloading image:", error);
        alert(error + ". Revisar galería...");
      });
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
      console.log(url2img(imageUri));
    } catch (error) {
      console.log(error);
    }
  };
  //API POST TO SEND IMAGE
  const restoreImage = async () => {
    ToastAndroid.show("Enviando a restaurar...", ToastAndroid.SHORT);
    setImageUri(
      "https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif"
    );
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
        setImageLabel(responseJson.imageResult);
        /*Alert.alert(
          "Imagen restaurada",
          "El análisis fue: " +
            responseJson.imageResult +
            ". Puedes abrir la imagen en internet para poder descargarla.",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Abrir",
              onPress: () => Linking.openURL(responseJson.finalImage),
            },
          ]
        );*/
        //alert("Tu imagen está en: " + responseJson.finalImage);
        ToastAndroid.show("Listo!!!", ToastAndroid.SHORT);
      })
      .catch((error) => {
        console.log("No se pudo enviar: " + error);
        alert("No se pudo enviar: " + error);
      });
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.myTitle}>PhotoRestorer</Text>
        <Text style={styles.mysubTitle}>
          Restauración de retratos antiguos o dañados con Deep Learning
        </Text>
        <Text style={styles.mysubTitle}>
          Selecciona tu imagen de la galería o con tu cámara
        </Text>
      </View>
      {restaurada ? (
        <View>
          <Text style={styles.myRestoredTitle}>Imagen Restaurada :D</Text>
          <Text style={styles.myRestoredTitle}>
            Análisis de imagen subida: {imageLabel}
          </Text>
        </View>
      ) : (
        <View></View>
      )}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.myImage} />
      ) : (
        <Image
          source={{ uri: "https://picsum.photos/400/400" }}
          style={styles.myImage}
        />
      )}
      <View style={styles.container2}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.button}>
            <Feather name="image" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={takePictureCam} style={styles.button}>
            <Feather name="camera" size={24} color="white" />
          </TouchableOpacity>
          {restaurada && (
            <TouchableOpacity onPress={downloadImage} style={styles.button}>
              <Feather name="download" size={24} color="white" />
            </TouchableOpacity>
          )}
          {downloaded && (
            <TouchableOpacity onPress={shareImage} style={styles.button}>
              <Feather name="share-2" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
        {restaurada ? (
          <View>
            <Text style={styles.mysubTitle}>
              Para volver a Restaurar elige o toma una foto :D
            </Text>
          </View>
        ) : (
          imageUri && (
            <TouchableOpacity onPress={restoreImage} style={styles.Sbutton}>
              <Text style={styles.myText}>Restaurar</Text>
            </TouchableOpacity>
          )
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
  container2: {
    alignItems: "center",
  },
  myTitle: {
    color: "#fff",
    fontSize: 30,
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
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  myText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
  },
  myImage: {
    height: "40%",
    width: "80%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 15,
    marginBottom: 15,
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
    width: "80%",
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
