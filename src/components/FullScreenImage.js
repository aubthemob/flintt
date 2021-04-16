import React from 'react'
import { ImageBackground, Text, View } from 'react-native'

import { useUserState } from '../contexts/UserAuthContext'

import { setSelfieUrl } from '../services/events'

import { IconButton } from 'react-native-paper'

import { windowHeight, windowWidth } from '../utils/dimensions'

export default function FullScreenImage({ uri, setFullScreenImageVisible, eventId, perspective }) {

    const { user } = useUserState()

    return (
        <>
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
                    onPress={() => setFullScreenImageVisible(false)}
                />

                {
                    perspective === 'event-organizer' &&
                        <IconButton 
                            icon="delete" 
                            size={24} 
                            style={{
                                backgroundColor: 'transparent', 
                                position: 'absolute',
                                right: 6,
                                top: 18,
                                zIndex: 1
                            }} 
                            color={'white'} 
                            onPress={() => {
                                setSelfieUrl(user.uid, eventId, null)
                                setFullScreenImageVisible(false)
                            }}
                        />
                }

                <ImageBackground
                    source={{ uri }}
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
                </ImageBackground>
            </View>
        </>
    )
}
