import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, PixelRatio, ImageBackground, SafeAreaView } from 'react-native';
import { Camera, takePictureAsync } from 'expo-camera';

// Contexts
import { useUserState } from '../contexts/UserAuthContext'


// Lib
import firebase from '../lib/firebase'

// Services
import { setSelfieUrl } from '../services/events'

// Styles
import { IconButton, Button } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { windowHeight, windowWidth } from '../utils/dimensions'
// import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default function CameraComponent(props) {

  const { 
    setCameraVisible, 
    eventId, 
    setDoneSelfieModalVisible, 
    setSnackbarMessage, 
    setSnackbarVisible, 
    trackerFormDispatch, 
    TRACKER_FORM_ACTIONS, 
  } = props

  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null)
  const [type, setType] = useState(Camera.Constants.Type.front);

  const [selfie, setSelfie] = useState(null)

  // Screen ratio and image padding
  const [imagePadding, setImagePadding] = useState(0);
  const [ratio, setRatio] = useState('4:3');  // default is 4:3
  const screenRatio = windowHeight / windowWidth;
  const [isRatioSet, setIsRatioSet] =  useState(false);
  const [pixelRatio, setPixelRatio] = useState(null)

  const { user } = useUserState()

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const newPixelRatio = PixelRatio.get()
    setPixelRatio(newPixelRatio)
  })

  // set the camera ratio and padding.
  // this code assumes a portrait mode screen
  const prepareRatio = async () => {
    let desiredRatio = '4:3';  // Start with the system default
    // This issue only affects Android
    if (Platform.OS === 'android') {
      const ratios = await camera.getSupportedRatiosAsync();

      // Calculate the windowWidth/windowHeight of each of the supported camera ratios
      // These windowWidth/windowHeight are measured in landscape mode
      // find the ratio that is closest to the screen ratio without going over
      let distances = {};
      let realRatios = {};
      let minDistance = null;
      for (const ratio of ratios) {
        const parts = ratio.split(':');
        const realRatio = parseInt(parts[0]) / parseInt(parts[1]);
        realRatios[ratio] = realRatio;
        // ratio can't be taller than screen, so we don't want an abs()
        const distance = screenRatio - realRatio; 
        distances[ratio] = realRatio;
        if (minDistance == null) {
          minDistance = ratio;
        } else {
          if (distance >= 0 && distance < distances[minDistance]) {
            minDistance = ratio;
          }
        }
      }
      // set the best match
      desiredRatio = minDistance;
      //  calculate the difference between the camera windowWidth and the screen windowHeight
      const remainder = Math.floor(
        (windowHeight - realRatios[desiredRatio] * windowWidth) / 2
      );
      // set the preview padding and preview ratio
      setImagePadding(remainder / 2);
      setRatio(desiredRatio);
      // Set a flag so we don't do this 
      // calculation each time the screen refreshes
      setIsRatioSet(true);
    }
  };

  // the camera must be loaded in order to access the supported ratios
  const setCameraReady = async() => {
    if (!isRatioSet) {
      await prepareRatio();
    }
  };

  // Take picture function
  const onPressTakePictureButton = async () => {
    try {
      const res = await camera.takePictureAsync()
      if (res) {
        setSelfie(res)
      }
    } catch (err) {
      console.log(err)
    }
  }

  // save picture function
  const uploadImage = async uri => {

    return new Promise(async (res, rej) => {

      const response = await fetch(uri)
      const blob = await response.blob()
      const ref = firebase.storage().ref().child(`event-selfies/${user.uid}/${eventId}`)
      
      const uploadTask = ref.put(blob)
      uploadTask.on('state_changed', snapshot => {}, () => {}, () => {
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              res(downloadURL)
          })
      })

    })

  }

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (selfie !== null) {
    return (
      <>
      {/* <SafeAreaView
        style={{ flex: 1 }}
      > */}
        <View
          style={{
            flex: 1,
          }}
        >
          <IconButton 
            icon="close" 
            size={24} 
            style={{
                backgroundColor: 'transparent', 
                position: 'absolute',
                left: 6,
                top: 18,
                zIndex: 1
            }} 
            color={'white'} 
            onPress={() => setSelfie(null)}
          />
          <ImageBackground
            source={{ uri: selfie.uri }}
            resizeMode="cover"
            style={{
              flex: 1,
              flexDirection: 'column',
              height: windowHeight,
              width: windowWidth,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [
                {scaleX: -1},
              ],
            }}
          >
            <View
              style={{
                transform: [
                  {scaleX: -1},
                ],
                position: 'absolute',
                bottom: 40,
                left: 40
              }}
            >

              <Button 
                onPress={async () => {
                  const newSelfieUrl = await uploadImage(selfie.uri)
                  setSelfieUrl(user.uid, eventId, newSelfieUrl)
                  setCameraVisible(false)
                  setSelfie(null)
                  setDoneSelfieModalVisible(false)

                  trackerFormDispatch({ type: TRACKER_FORM_ACTIONS.COMPLETE })
                  setSnackbarVisible(true)
                  setSnackbarMessage(`Your tagged friends will see your photo!`)
                }}
                color={theme.colors.accent}
                labelStyle={{ color: 'white' }}
                mode='contained'
              >Save</Button>

            </View>
          </ImageBackground>
        </View>
        {/* </SafeAreaView> */}
      </>
    )
  }

  if (selfie === null) {
    return (
      <>
      {/* <SafeAreaView
        style={{ 
          flex: 1,
          // justifyContent: 'space-around'
        }}
      > */}
        <IconButton 
            icon="arrow-left" 
            size={24} 
            style={{
                backgroundColor: 'transparent', 
                position: 'absolute',
                left: 6,
                top: 18,
                zIndex: 1
            }} 
            color={'white'} 
            onPress={() => setCameraVisible(false)}
        />

        <IconButton 
          icon='camera-retake'
          onPress={() => {
            setType(
              type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            )
          }}
          color={'white'} 
          style={{
            position: 'absolute',
            right: 6,
            top: 18,
            zIndex: 1,
          }}
        />

        <View style={styles.container}>
          <Camera 
            style={styles.camera} 
            type={type}
            onCameraReady={setCameraReady}
            ratio={ratio}
            ref={(ref) => {
              setCamera(ref);
            }}
          >
    
            <View 
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <TouchableOpacity
                onPress={onPressTakePictureButton}
              >
                <Image 
                  source={require('./images/take_photo_button.png')}
                  style={{
                    height: 100,
                    width: 100,
                    marginBottom: 50
                  }}
                />
              </TouchableOpacity>
            </View>
    
          </Camera>
        </View>
        {/* </SafeAreaView> */}
      </>
    );

  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});