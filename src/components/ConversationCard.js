import React, { useEffect, useState, useCallback, useContext } from 'react'
import { Alert, View, Text, StyleSheet, TextInput, ScrollView } from 'react-native'

// Components

// Contexts
import { useUserState } from '../contexts/UserAuthContext'
import { CardContext } from './FeedCardOLD'
import { FeedContext } from '../screens/FeedScreen'

// Libraries
import dayjs from 'dayjs' 
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { db, storage } from '../lib/firebase'
import * as firebase from 'firebase'
import { TabView, SceneMap } from 'react-native-tab-view';

// Services
import { getFriendService } from '../services/users'
import { getEventsService, setEventStatus } from '../services/events'
import { getConversationService, setMessageService, setSystemMessageService, setImageMessageService } from '../services/messages'
import { setConversationCardsVisible, setCardVisibleFalse, setCardVisibleTrue } from '../services/cards'

// Styles
import { Card, Divider, Button, Avatar, IconButton, Portal, Surface } from 'react-native-paper'
import theme from '../styles/theme'
import { bodyText, fullScreenButtonLabelStyle, subtitleText, timePickerText } from '../styles/styles'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'
import { ACTIVITIES } from '../utils/activities'

export default function ConversationCard({ cardId }) {

    const {
        eventId, 
        eventOrganizerId, 
        accountabilityPartnerId,
        currentEvent,
        setCurrentEvent,
        conversationId,
        // next,
        // dismiss
    } = useContext(CardContext)

    const { hideCard, scrollToIndex } = useContext(FeedContext)

    const { user } = useUserState()

    const [friendImageUrl, setFriendImageUrl] = useState(null) // change to avatar
    const [conversationFriend, setConversationFriend] = useState({ friendId: accountabilityPartnerId === user.uid ? eventOrganizerId : accountabilityPartnerId })
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [now, setNow] = useState(dayjs())

    // change to avatar
    useEffect(() => {
        const getImageUrl = async () => {
            try {
                const ref = firebase.storage().ref(`avatars/thumb@192_${conversationFriend.friendId}.jpeg`)
                const url = await ref.getDownloadURL()
                setFriendImageUrl(url)
            } catch(err) {
                // Alert.alert(err)
                console.log(err)
            }
        }
        getImageUrl()
    }, [])

    useEffect(() => {
        const getFriendData = async () => {
            try {
                const data = await getFriendService(user.uid)
                const currentFriend = data.find(d => d.id === conversationFriend.friendId)
                setConversationFriend(prevState => ({ ...prevState, displayName: currentFriend && currentFriend.displayName }))
                // setfriendImage
            } catch(err) {
                Alert.alert(err)
                console.log(err)
            }
        }
        getFriendData()
    }, [])

    useEffect(() => {
        const unsubscribe = db.collection('users').doc(eventOrganizerId)
        .collection('events').doc(eventId)
        .collection('conversations').doc(conversationId)
        .collection('messages').orderBy('dateTimeSent', 'desc').onSnapshot(snapshot => {
            const data = snapshot.docs.map(s => ({ ...s.data(), id: s.id }))
            
            // Convert data to format accepted by react-native-gifted-chat
            const newData = data.map(item => ({
                _id: item.id,
                text: item.messageContent,
                createdAt: dayjs.unix(item.dateTimeSent.seconds),
                user: item.senderId && {
                    _id: item.senderId,
                    avatar: friendImageUrl
                },
                system: item.system,
                image: item.image
            }))
            setMessages(newData)
        })
        return unsubscribe
        
    }, [friendImageUrl])
    
    const onSend = useCallback((messages = []) => {
        setMessageService({
            accountabilityPartnerId, 
            eventOrganizerId, 
            eventId, 
            messageContent: text, 
            dateTimeSent: new Date(), 
            senderId: user.uid,
            senderName: user.displayName
        })
        setCardVisibleTrue(accountabilityPartnerId, eventOrganizerId, eventId)
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    }, [text])

    // styles
    const renderBubble = props => {
        return (
            <Bubble
              {...props}
              wrapperStyle={{
                right: {
                  backgroundColor: theme.colors.primary,
                }
              }}
              textStyle={{
                  right: {
                      fontFamily: 'Montserrat-Regular',
                      fontSize: 14,
                      color: 'white'
                  },
                  left: {
                    fontFamily: 'Montserrat-Regular',
                    fontSize: 14,
                    color: '#606060'
                },
                system: {
                    fontFamily: 'Ubuntu-Regular',
                    fontSize: 14,
                    color: '#909090'
                }
              }}
            />
        )
    }

    return (
        <>
        
            <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
                <Card 
                    style={{ width: windowWidth*0.9, height: windowHeight/1.5 }}
                    elevation={1}
                >

                    <Card.Title 
                        title={
                            user.uid === eventOrganizerId ? 
                                `Encouragement from ${conversationFriend.displayName}` : 
                                `Encouragement for ${conversationFriend.displayName}`
                        } 
                        subtitle={
                            currentEvent && `to ${currentEvent.simple.toLowerCase()} ${now.to(currentEvent.start)}`
                        }
                        left={props => <IconButton icon={'close'} onPress={() => hideCard(cardId)}/>}
                        leftStyle={{ marginLeft: -12, marginTop: -12 }}
                        titleNumberOfLines={2}
                        titleStyle={{ fontFamily: 'Ubuntu-Bold' }}
                        subtitleStyle={{ fontFamily: 'Montserrat-Medium' }}
                    />

                    {
                        currentEvent && currentEvent.image &&
                        <Card.Cover source={currentEvent.image} resizeMode='cover' />
                    }

                    <Card.Content style={{ flex: 1 }}>
                        <Divider />
                        <View style={{ flex: 1, justifyContent:'center' }}>

                            {/* <Flatlist 
                                items
                            /> */}


                            <GiftedChat
                                messages={messages}
                                onSend={message => onSend(message)}
                                user={{
                                    _id: user.uid,
                                }}
                                renderBubble={renderBubble}
                                text={text}
                                onInputTextChanged={input => setText(input)}
                                dateFormat='lll'
                                textInputProps={{
                                    onFocus: () => scrollToIndex
                                }}
                                // renderSend={() => <IconButton icon={'send'} />}
                            />
                            
                        </View>
                    </Card.Content>

                    <Card.Actions>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>

                            {/* <Button
                                labelStyle={fullScreenButtonLabelStyle}
                                mode="text"
                                icon="chevron-right"
                                uppercase={false}
                                compact={true}
                                labelStyle={{ color: theme.colors.primary, fontFamily: 'Ubuntu-Regular' }}
                                style={{ margin: 6 }}
                                onPress={() => {
                                    next()
                                }}
                            >
                                Next
                            </Button> */}
                            
                        </View>
                    </Card.Actions>

                </Card>
            </View>
            
        </>
    )
    // return (
    //     <>
    //         <Surface
    //             style={{
    //                 // flex: 1,
    //                 height: 500
    //             }}
    //         >
    //             <GiftedChat
    //                 messages={messages}
    //                 onSend={message => onSend(message)}
    //                 user={{
    //                     _id: user.uid,
    //                 }}
    //                 renderBubble={renderBubble}
    //                 text={text}
    //                 onInputTextChanged={input => setText(input)}
    //                 // dateFormat='lll'
    //                 textInputProps={{
    //                     onFocus: () => scrollToIndex
    //                 }}
    //                 renderInputToolbar={() => <View></View>}
    //                 disableComposer={true}
    //                 style={{ height: 200 }}
    //                 // renderSystemMessage={() => <Text>{'hi'}</Text>}
    //                 // renderSend={() => <IconButton icon={'send'} />}
    //             />
    //         </Surface>
    //     </>
    // )
}

const styles = StyleSheet.create({
    fullScreenButtonLabelStyle
})