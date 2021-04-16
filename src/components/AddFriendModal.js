import React, { useState, useEffect } from 'react'
import { Text, TextInput, KeyboardAvoidingView, StyleSheet, View, Alert } from 'react-native'
import Constants from 'expo-constants'

import * as Linking from 'expo-linking'


// Analytics
import { addFriendFormSubmitEvent } from '../utils/analyticsEvents'

// Components
import PopupModal from './PopupModal'
import Modal from 'react-native-modal'

// Libraries
import { useRoute } from '@react-navigation/native'

// Services
import { addFriendService, checkIfFriendExists } from '../services/users'

// Styles
import { Divider, Button, Snackbar } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { createLink } from '../utils/links'

const AddFriendContent = (props) => {

    const route = useRoute()

    // const releaseChannel = Constants.manifest.releaseChannel

    const { 
        type, 
        user, 
        friendsCode, 
        setFriendsCode, 
        doneDisabled, 
        done, 
        close, 
        getFriends, 
        setSnackbarMessage, 
        setSnackbarVisible,
        setFriendsOnAddFirstFriendInFlow,
        setScreenSnackbarVisible,
        setScreenSnackbarMessage,
    } = props

    const [link, setLink] = useState('')

    useEffect(() => {
        getLink()
    }, [])

    const getLink = async () => {
        const { shortLink } = await createLink('add-friend', user.uid, user.displayName)
        setLink(shortLink)
    }
    
    return (
        <>
            <View style={{ flex: 0, justifyContent: 'space-around', marginTop: 12, marginBottom: 12, paddingHorizontal: 12 }}>

                <View style={{ alignSelf: 'center', marginVertical: 24 }}>
                    <Text style={{ alignSelf: 'center', fontFamily: 'Ubuntu-Regular', color: theme.colors.text, fontSize: 24 }}>Add a friend</Text>
                </View>
                
                <View style={{ marginVertical: 12 }}>
                    <Text style={styles.text}>{'First, have your friend download Flintt at '}</Text>
                    <Text style={[styles.text, {color: theme.colors.primary}]} selectable>{link}</Text>
                    {/* <Text style={[styles.text, {color: theme.colors.primary}]} selectable>
                        {
                            releaseChannel === undefined ? 
                            'https://flintt.page.link/get-flintt' : // marketing link setup in the console
                            'https://flintt.co/links/download' // marketing link setup in the console
                        }
                    </Text> */}
                </View>

                <View style={{ marginVertical: 12 }}>
                    <Text style={styles.text}>{'Then, share your code with them:'}</Text>
                    <Text style={[styles.text, {color: theme.colors.primary}]} selectable>{user.uid}</Text>
                </View>

                <Text style={[styles.text, { marginVertical: 12 }]}>{'If you have your friend\'s code, add it here:'}</Text>

                <TextInput 
                    value={friendsCode}
                    style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text, fontSize: 16, borderColor: '#EAEAEA', borderWidth: 1, marginHorizontal: 24, marginVertical: 12, borderRadius: 48, padding: 12 }}
                    placeholder="Add friend's code here"
                    onChangeText={value => setFriendsCode(value)}
                />

                <Button
                    mode="contained"
                    disabled={doneDisabled}
                    labelStyle={{
                        color: 'white'
                    }}
                    color={theme.colors.accent}
                    style={{
                        alignSelf: 'stretch',
                        marginVertical: 12,
                        marginHorizontal: 24
                    }}
                    onPress={ async () => {
                        try {
                            const friendExists = await checkIfFriendExists(friendsCode)
                            if (friendExists === true) {
                                addFriendFormSubmitEvent(user.uid, route.name, friendsCode, type === 'schedule-activity' ? 'schedule-activity-flow' : 'global-flow')
                                const friendSnapshot = await done()
                                const friendData = { ...friendSnapshot.data(), id: friendSnapshot.id }
                                if (type === 'schedule-activity') {
                                    setFriendsOnAddFirstFriendInFlow([friendData])
                                } else {
                                    setScreenSnackbarVisible(true)
                                    setScreenSnackbarMessage(`${friendData.displayName} was added to activities where all supporters are visible!`)
                                }
                                setFriendsCode('')
                                close(false)
                            } else {
                                setSnackbarVisible(true)
                                setSnackbarMessage("This code is invalid")
                            }
                        } catch (err) {
                            setSnackbarVisible(true)
                            setSnackbarMessage("This code is invalid")
                        }
                    }}
                >
                    Add friend
                </Button>
            </View>
        </>
    )
}

export default function AddFriendModal(props) {

    const { 
        isVisible, 
        close, 
        user, 
        type, 
        handleFriendPress, 
        getFriends, 
        setFriendsOnAddFirstFriendInFlow,
        screenSnackbarVisible,
        setScreenSnackbarVisible, 
        screenSnackbarMessage,
        setScreenSnackbarMessage
    } = props

    const [friendsCode, setFriendsCode] = useState('')

    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    return (
        <>
            <Modal
                isVisible={isVisible}
                style={{ marginVertical: 'auto' }}
                onBackdropPress={ () => close(false) }
            >
                <KeyboardAvoidingView
                    behavior="position"
                    enabled
                >
                    <PopupModal 
                        close={close}
                        contentComponent={
                            <AddFriendContent 
                                user={user} 
                                friendsCode={friendsCode} 
                                setFriendsCode={setFriendsCode} 
                                done={ async () => {
                                    const friend = await addFriendService(user.uid, friendsCode)
                                    return friend
                                }}
                                close={close}
                                doneDisabled={ friendsCode === '' ? true : false }
                                getFriends={getFriends}
                                setSnackbarMessage={setSnackbarMessage}
                                setSnackbarVisible={setSnackbarVisible}
                                type={type}
                                handleFriendPress={handleFriendPress}
                                setFriendsOnAddFirstFriendInFlow={setFriendsOnAddFirstFriendInFlow}
                                setScreenSnackbarVisible={setScreenSnackbarVisible}
                                setScreenSnackbarMessage={setScreenSnackbarMessage}
                            />
                        }
                    />
                    <Snackbar
                        visible={snackbarVisible}
                        onDismiss={() => setSnackbarVisible(false)}
                        style={{ backgroundColor: '#404040' }}
                        duration={3000}
                    >
                        {snackbarMessage}
                    </Snackbar>
                </KeyboardAvoidingView>
            </Modal>

            {/* <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                style={{ backgroundColor: '#404040' }}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar> */}
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