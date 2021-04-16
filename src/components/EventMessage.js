import React, { useEffect, useState } from 'react'
import { Alert, View, Text, StyleSheet, TextInput } from 'react-native'

// Components
import { setMessageService } from '../services/messages'

// Contexts
import { useUserState } from '../contexts/UserAuthContext' 

// Lib
import { GifSearch } from 'react-native-gif-search'

// Services
import { setCardVisibleTrue } from '../services/cards'


// Styles
import { IconButton } from 'react-native-paper'
import theme from '../styles/theme'

export default function EventMessage({ eventId, eventOrganizerId, setSnackbarVisible, accountabilityPartnerId }) {
    const [messageTypeSelected, setMessageTypeSelected] = useState('message')
    const [messageContent, setMessageContent] = useState('')

    const { user } = useUserState()

    const handleSendPress = async () => {
        const lengthError = messageContent === '' || messageContent.length >= 60 ? false : true
        try {
            if (lengthError) {
                await setMessageService({
                    senderId: user.uid,
                    senderName: user.displayName,
                    accountabilityPartnerId: user.uid,
                    recipientId: eventOrganizerId,
                    messageType: messageTypeSelected,
                    messageContent,
                    eventOrganizerId,
                    dateTimeSent: new Date(),
                    eventId
                })
                setMessageContent('')
                await setCardVisibleTrue(accountabilityPartnerId, eventOrganizerId, eventId)
            } else {
                setSnackbarVisible(true)
            }
        } catch(err) {
            Alert.alert('Error: your message could not be sent at this time. Please try again later.')
            console.log(err)
        }
    }

    return (
        <>
            {
                messageTypeSelected === 'GIF' &&
                <GifSearch
                    giphyApiKey={'asdasdasdasd'} 
                    onGifSelected={gifUrl => console.log(gifUrl)}
                    style={{ backgroundColor: 'white' }}
                    developmentMode={false}
                    darkGiphyLogo={true}
                    showScrollBar={false}
                />
            }
            {
                messageTypeSelected === 'message' &&
                <View style={{ flex: 1, flexDirection: 'row', margin: 12 }}>
                    <TextInput
                        autoFocus={true}
                        label="encouragement"
                        placeholder="Say something encouraging!"
                        onChangeText={input => setMessageContent(input)}
                        style={{ flex: 1, borderColor: theme.colors.text, borderWidth: 0.5, borderRadius: 40, padding: 12, backgroundColor: 'white', fontFamily: 'Montserrat-Regular', fontSize: 14, color: theme.colors.text }}
                        value={messageContent}
                    />
                    <IconButton 
                        icon="send"  
                        onPress={handleSendPress}
                        color={theme.colors.primary}
                    />
                </View>
            }    
        </>
    )
}
