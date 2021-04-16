import React, { useState } from 'react'
import { Text, View } from 'react-native'

import Modal from 'react-native-modal'

import CameraComponent from './CameraComponent'
import { IconButton, Button } from 'react-native-paper'
import theme from '../styles/theme'

export default function DoneSelfieModal({ setDoneSelfieModalVisible, eventId, setSnackbarMessage, setSnackbarVisible, trackerFormDispatch, TRACKER_FORM_ACTIONS }) {

    const [cameraVisible, setCameraVisible] = useState(false)

    return (
        <>
            <Text
                style={{
                    fontFamily: 'Ubuntu-Regular',
                    color: theme.colors.text
                }}
            >
                Congrats on completing your activity! Would you like to include a photo as proof?
            </Text>

            <View
                style={{
                    flexDirection: 'row',
                    marginTop: 12
                }}
            >
                
                <Button 
                    // title="Skip"
                    onPress={() => {
                        setDoneSelfieModalVisible(false)
                        trackerFormDispatch({ type: TRACKER_FORM_ACTIONS.COMPLETE })
                        setSnackbarVisible(true)
                        setSnackbarMessage(`Your tagged friends will see that you completed your activity!`)
                    }} 
                    color={theme.colors.accent}
                    style={{
                        marginHorizontal: 3,
                        borderRadius: 24
                    }}
                    mode='contained'
                    labelStyle={{ color: 'white' }}
                >Skip</Button>

                <Button 
                    onPress={() => setCameraVisible(true)}
                    color={theme.colors.accent}
                    style={{
                        marginHorizontal: 3
                    }}
                    mode='contained'
                    labelStyle={{ color: 'white' }}
                >Take a photo</Button>


            </View>

            <Modal
                isVisible={cameraVisible}
                onBackdropPress={() => setCameraVisible(false)}
                style={{margin: 0}}
            >
                <CameraComponent 
                    setCameraVisible={setCameraVisible}
                    eventId={eventId}
                    setDoneSelfieModalVisible={setDoneSelfieModalVisible}
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarVisible={setSnackbarVisible}
                    trackerFormDispatch={trackerFormDispatch}
                    TRACKER_FORM_ACTIONS={TRACKER_FORM_ACTIONS}
                />
            </Modal>
        </>
    )
}

