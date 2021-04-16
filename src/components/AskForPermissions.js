import React from 'react'
import { Text, View, StyleSheet, TextInput, Alert } from 'react-native'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

import PopupModal from '../components/PopupModal'
import Modal from 'react-native-modal'

import { Button } from 'react-native-paper'

import theme from '../styles/theme'
import { setExpoToken } from '../services/auth'

const PermissionsPopupContent = (props) => {

    const {
        close,
        registerForPushNotificationsAsync
    } = props

    const { user } = useUserState()

    return (
        <>
        <View style={{ flex: 0, justifyContent: 'space-around', marginTop: 36, marginBottom: 12, paddingHorizontal: 12 }}>
            
            <View style={{ marginVertical: 12 }}>
                <Text style={styles.text}>{`Would you like to be reminded when it's time to complete your healthy activity?`}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                <Button
                    mode="contained"
                    // disabled={doneDisabled}
                    labelStyle={{
                        color: 'white'
                    }}
                    color={theme.colors.accent}
                    style={{
                        alignSelf: 'stretch',
                        marginVertical: 12,
                        marginHorizontal: 24
                    }}
                    onPress={() => close(false)}
                >
                    No
                </Button>

                <Button
                    mode="contained"
                    // disabled={doneDisabled}
                    labelStyle={{
                        color: 'white'
                    }}
                    color={theme.colors.accent}
                    style={{
                        alignSelf: 'stretch',
                        marginVertical: 12,
                        marginHorizontal: 24
                    }}
                    onPress={async () => {
                        try {
                            const expoPushToken = await registerForPushNotificationsAsync()
                            if (expoPushToken !== undefined) {
                                setExpoToken(user.uid, expoPushToken)
                                close(false)
                            } else {
                                Alert.alert('Something went wrong...', 'You will need to manually enable push notifications in your settings', [{
                                    text: 'Okay',
                                    onPress: () => close(false)
                                }])
                            }
                        } catch (err) {
                            Alert.alert('Something went wrong...', 'You will need to manually enable push notifications in your settings', [{
                                text: 'Okay',
                                onPress: () => close(false)
                            }])
                        }
                    }}
                >
                    Yes
                </Button>
            </View>
        </View>
    </>
    )
}

export default function AskForPermissions(props) {

    const {
        isVisible,
        close,
        registerForPushNotificationsAsync
    } = props

    return (
        <>
            <Modal
                isVisible={isVisible}
                style={{ marginVertical: 'auto' }}
                onBackdropPress={ () => close(false) }
                // backdropColor={'#EAEAEA'}
            >
                <PopupModal 
                    close={close}
                    contentComponent={
                        <PermissionsPopupContent 
                            close={close}
                            registerForPushNotificationsAsync={registerForPushNotificationsAsync}
                        />
                    }
                />
            </Modal>
        </>
    )
}


const styles = StyleSheet.create({
    text: {
        alignSelf: 'center', 
        fontFamily: 'Montserrat-Regular', 
        color: theme.colors.text, 
        fontSize: 16,
        textAlign: 'center'
    }
})