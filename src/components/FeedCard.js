import React, { useState, useEffect, useContext, useRef } from 'react'
import { Text, View, StyleSheet, Image, TouchableOpacity, Alert, FlatList, Animated } from 'react-native'

// Analytics
import { chatButtonPressEvent } from '../utils/analyticsEvents'

// Components
import ActivityInCard from './ActivityInCard'
import StartOfDay from './StartOfDay'

// Contexts 
import { useUserState } from '../contexts/UserAuthContext'
import { useNavigation } from '@react-navigation/native'
import { FeedContext } from '../screens/FeedScreen'

import Modal from 'react-native-modal'
import dayjs from 'dayjs'
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)
const sampleSize = require('lodash.samplesize')

// Services
import { getCertainUsers } from '../services/users'
import { setMessageService } from '../services/messages'

// Styles
import { Card, Divider, Button, Avatar, IconButton, Snackbar, Chip, Badge, Menu, Provider } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'
import { TouchableWithoutFeedback, ScrollView } from 'react-native-gesture-handler'
import { QUICK_REPLIES } from '../utils/quickReplies'
import { isEarliestEventToday } from '../utils/eventsHelpers'
import { calendarConfig } from '../utils/calendar'

export default function FeedCard({ userId: eventOrganizerId, events, navigateToFriendsProfile, allEvents, navigateToChat, allUserEvents, allApEvents }) {

    const { user } = useUserState()
    const navigation = useNavigation()
    const { setSnackbarMessage, setSnackbarVisible } = useContext(FeedContext)

    const [cardPerspective, setCardPerspective] = useState('')

    const [accountabilityPartners, setAccountabilityPartners] = useState([])
    const [fullEventOrganizer, setFullEventOrganizer] = useState({})
    const [fullAccountabilityPartners, setFullAccountabilityPartners] = useState([])

    const [quickReplies, setQuickReplies] = useState([])

    const [messageType, setMessageType] = useState('text')
    const [menuVisible, setMenuVisible] = useState(false)

    const [selectedActivity, setSelectedActivity] = useState('')

    useEffect(() => {
        const newAccountabilityPartners = extractAccountabilityPartners(events)
        setAccountabilityPartners(newAccountabilityPartners)
    }, [])

    useEffect(() => {
        if (eventOrganizerId === user.uid) {
            setCardPerspective('event-organizer')
        } else {
            setCardPerspective('accountability-partner')
        }
    }, [])

    useEffect(() => {
        mergeUserData()
    }, [accountabilityPartners])

    useEffect(() => { // need to remove duplicates from the random int array

        const hasEvents = allEvents.length !== 0
        const eventsToday = hasEvents && events.length !== 0
        const pastEndTimeOfLastEventOfDay = events.length > 0 && dayjs() > events[events.length-1].endDateTime
        const eventsCompletedToday = events.length > 0 && events.filter(f => f.status === 'complete').length > 0
        const noEventsCompletedToday = eventsToday && pastEndTimeOfLastEventOfDay && !eventsCompletedToday

        if (hasEvents && !eventsToday || noEventsCompletedToday) {
            const quickRepliesOfCurrentType = QUICK_REPLIES.filter(q => q.type === messageType)
            const chastisingReplies = quickRepliesOfCurrentType.filter(q => q.type !== 'text' ? q.moment === 'chastising' : true)
            const newQuickReplies = messageType === 'gif' ? sampleSize(chastisingReplies, 3) : sampleSize(chastisingReplies, 5)
            setQuickReplies(newQuickReplies)
        } else {
            const quickRepliesOfCurrentType = QUICK_REPLIES.filter(q => q.type === messageType)
            const nonChastisingReplies = quickRepliesOfCurrentType.filter(q => q.type !== 'text' ? q.moment !== 'chastising' : true)
            const newQuickReplies = messageType === 'gif' ? sampleSize(nonChastisingReplies, 3) : sampleSize(nonChastisingReplies, 5)
            setQuickReplies(newQuickReplies)
        }
        

    }, [messageType])

    const extractAccountabilityPartners = events => {
        const allAccountabilityPartnersArr = events.map(e => e.accountabilityPartners)

        const allAccountabilityPartners = flatten(allAccountabilityPartnersArr)
        const allAccountabilityPartnersUnique = [...new Set(allAccountabilityPartners)]
        return allAccountabilityPartnersUnique
    }

    const mergeUserData = async () => {
        const data = await getCertainUsers([...accountabilityPartners, eventOrganizerId])

        const newEventOrganizer = data.find(d => d.id === eventOrganizerId)
        setFullEventOrganizer(newEventOrganizer)
        
        const newAccountabilityPartners = data.filter(d => d.id !== eventOrganizerId)
        const newAccountabilityPartnersUnique = [...new Set(newAccountabilityPartners)]
        setFullAccountabilityPartners(newAccountabilityPartnersUnique)
    }

    // Helper functions
    const flatten = arr => {
        return Array.prototype.concat(...arr)
    }

    const handleQuickReplyPress = item => {

        // if none are selected
        const itemIsSelected = quickReplies.filter(q => q.selected === true).length > 0
        if (!itemIsSelected) {
            // make the new item selected
            const currentQuickReplies = [...quickReplies]
            const currentQuickReplyIndex = currentQuickReplies.findIndex(q => q.message === item.message)
            const currentQuickReply = quickReplies[currentQuickReplyIndex]
            currentQuickReplies[currentQuickReplyIndex] = { ...currentQuickReply, selected: true }
            setQuickReplies(currentQuickReplies)

            // increase the size to 100
            Animated.timing(resizeGif, {
                toValue: 100,
                duration: 200,
                useNativeDriver: true
            }).start()

            // else if one is selected
        } else if (itemIsSelected) {

            const currentlySelectedItem = quickReplies.find(q => q.selected === true)

            // if not the same item
            if (item.message !== currentlySelectedItem.message) {
                
                // decrease the size to 50 + make prev item no longer selected + make new item selected
                Animated.timing(resizeGif, {
                    toValue: 50,
                    duration: 100,
                    useNativeDriver: true
                }).start(() => {
                    const currentQuickReplies = [...quickReplies]
                    const currentQuickReplyIndex = currentQuickReplies.findIndex(q => q.message === item.message)
                    const currentQuickReply = quickReplies[currentQuickReplyIndex]
                    const newQuickReplies = currentQuickReplies.map(c => ({ ...c, selected: false }))
                    newQuickReplies[currentQuickReplyIndex] = { ...currentQuickReply, selected: !currentQuickReply.selected }
                    setQuickReplies(newQuickReplies)

                    // increase the size to 100
                    Animated.timing(resizeGif, {
                        toValue: 100,
                        duration: 200,
                        useNativeDriver: true
                    }).start()
                })

                // if the same item
            } else if (item.message === currentlySelectedItem.message) {

                // decrease the size to 50
                Animated.timing(resizeGif, {
                    toValue: 50,
                    duration: 100,
                    useNativeDriver: true
                }).start(() => {

                    // make the item no longer selected
                    const currentQuickReplies = [...quickReplies]
                    const newQuickReplies = currentQuickReplies.map(c => ({ ...c, selected: false }))
                    setQuickReplies(newQuickReplies)
                })

            }

        }

    }

    const handlePressActivity = event => {
        if (event.eventId === selectedActivity.eventId) {
            setSelectedActivity('')
        } else if (event.eventId !== selectedActivity.eventId) {
            setSelectedActivity(event)
        }
    }

    const resizeGif = useRef(new Animated.Value(50)).current

    return (
        <>
            <View 
                style={{ 
                    // alignItems: 'center', 
                    // flex: 1,
                    marginTop: 12, 
                    // marginRight: 18,
                    paddingBottom: 18,
                    width: windowWidth*0.96,
                    backgroundColor: 'white',
                    alignSelf: 'center',
                    borderRadius: 36,
                    // backgroundColor: 'blue'
                }}
            >

                <View
                    style={{
                        flexDirection: 'row',
                        // alignSelf: 'flex-start',
                        marginLeft: 18,
                        marginVertical: 18
                    }}
                >
                    <TouchableWithoutFeedback
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        onPress={() => navigateToFriendsProfile({
                            userId: eventOrganizerId,
                            displayName: fullEventOrganizer.displayName
                        })}
                    >
                        <Avatar.Image 
                            size={48} 
                            source={{ uri: fullEventOrganizer.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} 
                        />
                        <Text
                            style={{
                                fontFamily: 'Ubuntu-Regular',
                                color: theme.colors.text,
                                fontSize: 22,
                                marginLeft: 14,
                                marginBottom: 4
                            }}
                        >
                            {
                                cardPerspective === 'event-organizer' ? 
                                    `Your day` :
                                    `${fullEventOrganizer.displayName}`
                            }
                        </Text>

                    </TouchableWithoutFeedback>

                </View>

                <FlatList 
                    data={events}
                    keyExtractor={(item, index) => `${item.eventId}${index}`}
                    // contentContainerStyle={{ marginTop: 24 }}
                    listKey={(item, index) => `${item.eventId}${index}`}
                    scrollEnabled={false}
                    ListFooterComponent={
                        <Text>
                            {
                                events.length > 0 && events.filter(e => e.startDateTime >= dayjs().startOf('day')).length === 0 &&
                                `${allEvents.find(e => e.startDateTime > dayjs()) && 
                                    `Next activity: ${allEvents.find(e => e.startDateTime > dayjs()).activity} ${dayjs(allEvents.find(e => e.startDateTime > dayjs()).startDateTime).calendar(null, calendarConfig).toLowerCase()}` || 
                                    'No activities scheduled 😭'}`
                                
                            }
                            {
                                events.length === 0 &&
                                `No activities scheduled (yet!)`
                            }
                            
                        </Text> 
                    }
                    renderItem={({ item }) => {

                        const day = isEarliestEventToday(item.eventId, events)
                        return (
                            <>
                            <StartOfDay day={day}/>
                            {/* <TouchableWithoutFeedback
                                onPress={() => handlePressActivity(item)}
                            > */}
                                <ActivityInCard 
                                    {...item}
                                    cardPerspective={cardPerspective}
                                    fullAccountabilityPartners={fullAccountabilityPartners}
                                    allEvents={allEvents}
                                    isSelectedActivity={selectedActivity.eventId === item.eventId}
                                    handlePressActivity={handlePressActivity}
                                />

                            {/* </TouchableWithoutFeedback> */}
                            </>

                        )
                    }}
                />

                {
                    cardPerspective === 'accountability-partner' &&
                        <Divider style={{
                            flex: 1,
                            marginTop: 12,
                            marginBottom: 6,
                            // borderWidth: 0.2,
                            width: '90%',
                            alignSelf: 'center'
                        }} />
                }

                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                        marginLeft: 6,
                    }}
                >
                    {/* <IconButton 
                        icon='comment-text'
                        onPress={() => setMenuVisible(true)}
                    /> */}
                    {/* <Provider> */}
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <IconButton 
                                    icon={
                                        messageType === 'text' && 'comment-text' ||
                                        messageType === 'gif' && 'gif' ||
                                        messageType === 'emoji' && 'sticker-emoji' 
                                    }
                                    style={{
                                        backgroundColor: '#EAEAEA'
                                    }}
                                    onPress={() => setMenuVisible(true)}
                                />
                            }
                        >
                            <Menu.Item 
                                onPress={() => {
                                    setMessageType('text')
                                    setMenuVisible(false)
                                }} 
                                title="Text" 
                                icon='comment-text'
                            />
                            <Menu.Item 
                                onPress={() => {
                                    setMessageType('gif')
                                    setMenuVisible(false)
                                }} 
                                title="GIF" 
                                icon='gif'
                            />
                            <Menu.Item 
                                onPress={() => {
                                    setMessageType('emoji')
                                    setMenuVisible(false)
                                }}
                                title='Emoji'
                                icon='sticker-emoji'
                            />

                        </Menu>

                    {/* </Provider> */}

                    {
                        cardPerspective === 'accountability-partner' && 
                        (messageType === 'text' || messageType === 'emoji') &&
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        // backgroundColor: 'blue',
                                        flex: 1,
                                    }}
                                >
                                    {
                                        quickReplies.map(item => (

                                            <TouchableWithoutFeedback
                                                onPress={() => handleQuickReplyPress(item)}
                                            >
                                                <Chip 
                                                    mode={item.selected ? 'flat' : 'outlined'}
                                                    style={{
                                                        marginHorizontal: 4,
                                                        backgroundColor: item.selected ? theme.colors.primary : 'transparent'
                                                    }}
                                                    textStyle={{
                                                        fontFamily: 'Montserrat-Regular',
                                                        color: item.selected ? 'white' : theme.colors.text
                                                    }}
                                                >
                                                    {item.message}
                                                </Chip>

                                            </TouchableWithoutFeedback>
                                        ))
                                    }
                                </View>
                            </ScrollView>
                    }

                    {
                        cardPerspective === 'accountability-partner' && messageType === 'gif' && // had to split up gif from text because couldn't find a way for the gifs to transform within the ScrollView
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                // backgroundColor: 'blue',
                                flex: 1,
                            }}
                        >
                            {
                                quickReplies.map(item => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            handleQuickReplyPress(item)
                                        }}
                                        style={{
                                            zIndex: item.selected ? 500 : 1,
                                            shadowColor: "#000",
                                            shadowOffset: {
                                                width: 0,
                                                height: item.selected ? 2 : 0,
                                            },
                                            shadowOpacity: item.selected ? 0.25 : 0,
                                            shadowRadius: item.selected ? 3.84 : 0,
                                            elevation: item.selected ? 5 : 0,
                                            borderRadius: 12,
                                            // overflow: 'hidden'
                                        }}
                                        activeOpacity={1}
                                    >
                                        <Animated.View
                                            style={{
                                                flex: 1,
                                                transform: [{
                                                    scale: item.selected ? resizeGif.interpolate({
                                                        inputRange: [50, 100],
                                                        outputRange: [1, 2]
                                                    }) : 1
                                                }],
                                                marginHorizontal: 4,
                                                shadowColor: "#000",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: item.selected ? 2 : 0,
                                                },
                                                shadowOpacity: item.selected ? 0.25 : 0,
                                                shadowRadius: item.selected ? 3.84 : 0,
                                                elevation: item.selected ? 5 : 0,
                                                borderRadius: 12,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Animated.Image 
                                                source={{ uri: item.message }}
                                                style={{
                                                    height: 50,
                                                    width: 50,
                                                    borderRadius: 12,
                                                    // zIndex: item.selected ? 500 : 1
                                                    // marginHorizontal: 4,
                                                }}
                                                resizeMode='cover'
                                            />

                                        </Animated.View>
                                    </TouchableOpacity>

                                ))
                            }
                            
                        </View>
                        
                    }
                    
                    {
                        cardPerspective === 'accountability-partner' && 
                            <IconButton 
                                icon='dots-horizontal'
                                style={{ margin: 0, zIndex: -10 }}
                                onPress={() => {
                                    navigateToChat(eventOrganizerId, allUserEvents, allApEvents, selectedActivity)
                                    setSelectedActivity('')
                                    const curQuickReplies = [...quickReplies]
                                    const newQuickReplies = curQuickReplies.map(c => ({ ...c, selected: false }))
                                    setQuickReplies(newQuickReplies)
                                }}
                                disabled={selectedActivity === ''}
                            />
                    }                          
                    
                    {
                        cardPerspective === 'accountability-partner' &&
                            <IconButton
                                icon="send"
                                disabled={ quickReplies.filter(q => q.selected === true).length === 0 }
                                size={28} 
                                color={'#9a9a9a'} 
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}
                                onPress={() => {

                                    const messageContent = quickReplies.find(q => q.selected === true).message
                                    const options = { 
                                        userId: user.uid, 
                                        chatPartnerId: eventOrganizerId, 
                                        messageContent: messageType !== 'gif' && messageContent, 
                                        dateTimeSent: new Date(), 
                                        senderId: user.uid, 
                                        senderName: user.displayName,
                                        image: messageType === 'gif' && messageContent,
                                        selectedActivity
                                    }
                                    setMessageService(options)

                                    setSnackbarVisible(true)
                                        setSnackbarMessage('Your messasge was sent')

                                    Animated.timing(resizeGif, {
                                        toValue: 50,
                                        duration: 100,
                                        useNativeDriver: true
                                    }).start(() => {
                                        
                                        const currentQuickReplies = [...quickReplies]
                                        const newQuickReplies = currentQuickReplies.map(c => ({...c, selected: false}))
                                        setQuickReplies(newQuickReplies)
    
                                        setSelectedActivity('')

                                    })

                                }}
                            />
                    }

                </View>

            </View>

            
        </>
    )
}