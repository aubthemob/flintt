import React, { useContext, useState } from 'react'
import { Alert, View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Platform, } from 'react-native'

// Components


// Contexts
import { useUserState } from '../contexts/UserAuthContext'
// import { CardContext } from './FeedCardOLD'

// Libs
import * as ImagePicker from 'expo-image-picker';
import firebase from '../lib/firebase'

// Styles
import { Divider, Avatar, ActivityIndicator } from 'react-native-paper'
import theme from '../styles/theme'

export default function DoneEventTracker({ eventTrackerForm, setEventTrackerForm }) {

    const [loading, setLoading] = useState(false)

    const { user } = useUserState()

    const selfieFunction = async () => {
        try {
            setLoading(true)
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status === 'granted') {
                const image = await ImagePicker.launchCameraAsync()
                if (!image.cancelled) {
                    const result = await uploadImage(image.uri)
                    setSelfieUrl(result)
                }
            } else {
                setSnackbarVisible(true)
                setSnackbarMessage('You need to provide camera permissions in order to include an image')
            }
            setLoading(false)
        } catch(err) {
            Alert.alert(err.message)
            console.log(err)
        }
    }

    const uploadImage = async uri => {
        const response = await fetch(uri)
        const blob = await response.blob()
        const ref = firebase.storage().ref().child(`event-selfies/${user.uid}/${currentEvent.eventId}`)
        await ref.put(blob)
        const downloadURL = await ref.getDownloadURL()
        return downloadURL
    }

    const setSelfieUrl = url => {
        setEventTrackerForm(prevState => ({
            ...prevState,
            selfieUrl: url
        }))
    }

    return (
        <>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Avatar.Icon icon="camera" size={42} style={{ backgroundColor: 'transparent' }} color={theme.colors.text} />
                {
                    eventTrackerForm.selfieUrl ? (
                        // <TouchableOpacity onPress={selfieFunction}>
                            <Image 
                                style={{ 
                                    flex: 1, 
                                    alignSelf: 'stretch', 
                                    width: undefined, 
                                    height: undefined, 
                                    resizeMode: 'contain',
                                    margin: 6,
                                }} 
                                source={{ uri: eventTrackerForm.selfieUrl }} 
                                
                            />
                        // </TouchableOpacity> 
                    ) : (
                        loading ? (
                            <ActivityIndicator size={'large'} animating={true} color={theme.colors.primary} style={{ flex: 1 }} />
                        ) : (
                            <TouchableOpacity onPress={selfieFunction}>
                                <Text style={{
                                    fontFamily: 'Montserrat-Regular',
                                    fontSize: 16,
                                    color: theme.colors.text,
                                    marginVertical: 24
                                }}>Include an image</Text>
                            </TouchableOpacity>
                        )
                    )
                }
                

            </View>
        </>
    )
}
