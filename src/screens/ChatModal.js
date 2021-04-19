import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Text, View, SafeAreaView, Platform } from 'react-native'

// Analytics
import { sendMessageButtonPressEvent } from '../utils/analyticsEvents'

// Components
import AccountabilityPartnerChatSwiper from '../components/AccountabilityPartnerChatSwiper'
import CloseButton from '../components/UiComponents/CloseButton'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Lib
import { GiftedChat, Bubble, Send, Message, MessageImage, focusTextInput } from 'react-native-gifted-chat'
import { db, storage } from '../lib/firebase'
import dayjs from 'dayjs'
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)

// Services
import { setMessageService, updateMostRecentEvent } from '../services/messages'
import { getSingleUser } from '../services/users'

// Styles
import { IconButton, Avatar, Divider } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { windowWidth } from '../utils/dimensions'
import { checkAndSetFire, checkAndSetAchievement } from '../utils/eventsHelpers'

export default function ChatModal({ navigation, route }) {

    const { 
        // fullChatPartner, 
        chatPartnerId,
        allUserEvents,
        allApEvents,
        selectedActivity,
    } = route.params

    const chatRef = useRef()

    const { user } = useUserState()

    const [fullChatPartner, setFullChatPartner] = useState({})

    const [text, setText] = useState('')
    const [messages, setMessages] = useState([])

    const [selectedActivityIsOnFire, setSelectedActivityIsOnFire] = useState()
    const [selectedActivityAchievement, setSelectedActivityAchievement] = useState()

    const [isSelectedActivity, setIsSelectedActivity] = useState(selectedActivity ? true : false)

    useEffect(() => {
        const getSingleUserFunc = async () => {
            const newFullChatPartner = await getSingleUser(chatPartnerId)
            setFullChatPartner(newFullChatPartner)
        }

        getSingleUserFunc()

    }, [chatPartnerId])

    
    useEffect(() => {

        const unsubscribe = navigation.addListener('blur', () => {
            updateMostRecentEvent(user.uid, chatPartnerId)
        })

        return unsubscribe
    }, [navigation])

    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
            updateMostRecentEvent(user.uid, chatPartnerId)
        })

        return unsubscribe
    }, [navigation])


    useEffect(() => {
        // gets all messages
        const sortedIds = [user.uid, chatPartnerId].sort()
        const unsubscribe = db.collection('conversations').doc(`${sortedIds[0]}_${sortedIds[1]}`)
            .collection('messages')
            // .where('dateTimeSent', '>=', dayjs().startOf('day').toDate())
            .orderBy('dateTimeSent', 'desc').onSnapshot(snapshot => {
                const data = snapshot.docs.map(s => ({ ...s.data(), id: s.id }))
                
                // Convert data to format accepted by react-native-gifted-chat
                const newData = data.map(item => ({
                    _id: item.id,
                    text: item.messageContent,
                    createdAt: dayjs.unix(item.dateTimeSent.seconds),
                    user: item.senderId && {
                        _id: item.senderId,
                        avatar: fullChatPartner && fullChatPartner.avatarUrl && fullChatPartner.avatarUrl 
                    },
                    system: item.system,
                    image: item.image,
                    activityData: item.activityData
                }))
                setMessages(newData)
        })
        return unsubscribe
        
    }, [fullChatPartner])

    useEffect(() => {
        if (selectedActivity) {
            chatRef.current.focusTextInput()
        }
    }, [])

    useEffect(() => {
        if (selectedActivity) {
            const { isOnFire, achievement } = getExtraActivityProps(selectedActivity, allUserEvents, allApEvents)
            setSelectedActivityIsOnFire(isOnFire)
            setSelectedActivityAchievement(achievement)
        }

    }, [])

    const getExtraActivityProps = (activityData, allUserEvents, allApEvents) => {

        const startDateTime = activityData.startDateTime.seconds ? dayjs.unix(activityData.startDateTime.seconds) : dayjs(activityData.startDateTime)
        const allEvents = activityData.userId === user.uid ? allUserEvents : allApEvents[activityData.userId]
        const isOnFire = checkAndSetFire(allEvents, activityData.activity, activityData.eventId)
        const achievement = checkAndSetAchievement(allEvents, activityData.habit, startDateTime, activityData.eventId)

        return {
            isOnFire, 
            achievement
        }
    }

    const onSend = useCallback((messages = []) => {
        sendMessageButtonPressEvent(text, chatPartnerId)
        setMessageService({
            userId: user.uid, 
            chatPartnerId, 
            messageContent: text, 
            dateTimeSent: new Date(), 
            senderId: user.uid,
            senderName: user.displayName,
            selectedActivity: selectedActivity && isSelectedActivity ? selectedActivity : null
        })
        // setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        setIsSelectedActivity(false)
    }, [text])

    // styles
    const renderBubble = props => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        // alignItems: 'center',
                        backgroundColor: theme.colors.primary,
                        width: props.currentMessage.activityData ? 300 : 'auto',
                        // minWidth: props.currentMessage.activityData && 300,
                        // minHeight: props.currentMessage.activityData && props.currentMessage.image ? 300 : 20,
                        // justifyContent: props.currentMessage.activityData && props.currentMessage.image ? 'flex-start' : 'flex-end'
                    },
                    left: {
                        backgroundColor: '#EAEAEA',
                        width: props.currentMessage.activityData ? 300 : 'auto',
                        // minHeight: props.currentMessage.activityData && props.currentMessage.image ? 300 : 20, 
                        // justifyContent: props.currentMessage.activityData && props.currentMessage.image ? 'flex-start' : 'flex-end'     
                    },
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
                        color: '#909090',
                        // backgroundColor: 'white'
                    },
                    system: {
                        fontFamily: 'Ubuntu-Regular',
                        fontSize: 18,
                        color: '#909090'
                    }
              }}
            />
        )
    }

    const renderCustomView = props => {
        if (props.currentMessage.activityData) {

            const { isOnFire, achievement } = getExtraActivityProps(props.currentMessage.activityData, allUserEvents, allApEvents)
            return (
                <ActivitySlab 
                    activityData={props.currentMessage.activityData}
                    isOnFire={isOnFire}
                    achievement={achievement}
                    // isChatFooter={false}
                />
            )
        }
    }

    const ActivitySlab = ({ activityData, isOnFire, achievement }) => {

        const startDateTime = activityData.startDateTime.seconds ? dayjs.unix(activityData.startDateTime.seconds).format('h:mma') : dayjs(activityData.startDateTime).format('h:mma')
        const endDateTime = activityData.endDateTime.seconds ? dayjs.unix(activityData.endDateTime.seconds).format('h:mma') : dayjs(activityData.endDateTime).format('h:mma')

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 6,
                    paddingVertical: 6,
                    paddingHorizontal: activityData.status === 'complete' ? 0 : 6,
                    borderRadius: 20,
                    width: '95%',
                    height: 60,
                    alignSelf: 'center',
                    backgroundColor: 'white'
                }}
            >

                {
                    activityData.status === 'complete' &&
                        <Avatar.Icon 
                            icon={'check'}
                            size={48}
                            style={{
                                backgroundColor: 'transparent'
                            }}
                            color='#6AB178'
                        />
                }
                <View>
                    <View
                        style={{
                            flexDirection: 'row',
                            // marginLeft: props.currentMessage.activityData.status === 'complete' ? 0 : 6,
                        }}
                    >
                        <Text>{activityData.activity}</Text>
                        <Text>{isOnFire && `🔥`}</Text>
                        <Text>{activityData.status === 'complete' && achievement}</Text>

                    </View>
                    <Text>{startDateTime} - {endDateTime}</Text>
                </View>
            </View>
        )
    }

    const renderImage = props => {
        if (Platform.OS === 'ios') {
            if (props.currentMessage.activityData) {
                return (
                    <MessageImage 
                        {...props}
                        imageStyle={{
                            // marginHorizontal: 12,
                            width: '95%',
                            height: undefined,
                            aspectRatio: 1.5,
                            alignSelf: 'center',
                            minWidth: 150
                        }}
                    />
                )
            } else {
                return (
                    <MessageImage 
                        {...props}
                    />
                )
            }
        } else if (Platform.OS === 'android') {
            if (props.currentMessage.activityData) {
                return (
                    <View
                        style={{
                            borderRadius: 13,
                            overflow: 'hidden'
                        }}
                    >
                        <MessageImage 
                            {...props}
                            imageStyle={{
                                // marginHorizontal: 12,
                                width: '95%',
                                height: undefined,
                                aspectRatio: 1.5,
                                alignSelf: 'center',
                                minWidth: 150,
                                borderRadius: 13,
                            }}
                        />

                    </View>
                )
            } else {
                return (
                    <View
                        style={{
                            borderRadius: 20,
                            overflow: 'hidden'
                        }}
                    >
                        <MessageImage 
                            {...props}
                        />
                    </View>
                )
            }
        }
    }

    return (
        <>
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 24, paddingHorizontal: 12 }}>
                    {/* <Avatar.Image size={48} source={{ uri: fullCurrentChatPartner.avatarUrl }}/> */}
                    <View>
                        {
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar.Image size={38} source={{ uri: fullChatPartner.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} />
                                <Text style={{ marginLeft: 8, fontFamily: 'Ubuntu-Regular', color: theme.colors.text, fontSize: 20 }}>{fullChatPartner.displayName}</Text>
                            </View>
                        }
                    </View>
                
                </View>
                <Divider style={{ marginTop: 24 }}/>

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
                    renderCustomView={renderCustomView}
                    renderMessageImage={renderImage}
                    ref={chatRef}
                    // textInputProps={{autoFocus: true}}
                    // renderMessage={renderMessage}
                    renderChatFooter={() => (
                        selectedActivity && isSelectedActivity &&
                        <View
                            style={{
                                backgroundColor: '#EAEAEA',
                                paddingVertical: 6
                            }}
                        >
                            <IconButton 
                                icon="window-close" 
                                size={18} 
                                style={{
                                    backgroundColor: 'transparent', 
                                    position: 'absolute',
                                    right: 8,
                                    top: 10,
                                    zIndex: 1
                                }} 
                                color={theme.colors.text} 
                                onPress={() => setIsSelectedActivity(false)}
                            />
                            <ActivitySlab 
                                activityData={selectedActivity}
                                isOnFire={selectedActivityIsOnFire}
                                achievement={selectedActivityAchievement}
                                // isChatFooter={true}
                            />  
                        </View>
                    )
                    }
                    renderSend={props => (
                        <Send
                            {...props}
                        >
                            <IconButton icon={'send'} color={theme.colors.accent} />
                        </Send>
                    )}
                />
            </View>
        </SafeAreaView>
        </>
    )
}