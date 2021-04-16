import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import ActionButton from 'react-native-action-button'

import { useUserState } from '../contexts/UserAuthContext'

import { db } from '../lib/firebase'

import dayjs from 'dayjs'
import _, { sortBy, groupBy } from 'underscore'
import { Avatar, Badge, IconButton } from 'react-native-paper'
import theme from '../styles/theme'
import { TouchableWithoutFeedback, TouchableHighlight } from 'react-native-gesture-handler'

import { getCertainUsers } from '../services/users'

import RNActionButton from 'react-native-action-button'
import { Animated } from 'react-native'

// MONKEY PATCH

RNActionButton.prototype.animateButton = function(animate = true) {
    if (this.state.active) return this.reset();

    if (animate) {
      Animated.spring(this.anim, { toValue: 1, useNativeDriver: false }).start();
    } else {
      this.anim.setValue(1);
    }

    this.setState({ active: true, resetToken: this.state.resetToken });
}

RNActionButton.prototype.reset = function (animate = true) {
    if (this.props.onReset) this.props.onReset();

    if (animate) {
      Animated.spring(this.anim, { toValue: 0, useNativeDriver: false }).start();
    } else {
      this.anim.setValue(0);
    }

    setTimeout(() => {
      if (this.mounted) {
        this.setState({ active: false, resetToken: this.state.resetToken });
      }
    }, 250);
}

export default function ChatActionButton({ navigation, fullCurrentUser, setSnackbarMessage, setSnackbarVisible, fullFriends, allUserEvents, allApEvents }) {

    const [recentMessages, setRecentMessages] = useState({})
    const [recentEvents, setRecentEvents] = useState({})
    const [badgesList, setBadgesList] = useState([])

    const { user } = useUserState()

    // listener to get the most recent messages
    useEffect(() => {

        const unsubscribe = db.collectionGroup('messages').where('participants', 'array-contains', user.uid)
            .onSnapshot(snapshot => {

                const data = snapshot.docs.map(doc => ({
                    // id: doc.id, 
                    // ...doc.data(),
                    senderId: doc.data().senderId,
                    dateTimeSent: dayjs.unix(doc.data().dateTimeSent.seconds),
                }))
                const filteredMessages = data.filter(d => d.senderId !== user.uid)
                // console.log(filteredMessages)
                const messagesSortedByTime = sortBy( filteredMessages, 'dateTimeSent' ).reverse()
                const grouped = groupBy(messagesSortedByTime, 'senderId')
                const entries = Object.entries(grouped)
                let finalObj = {}
                for (const [senderId, arr] of entries) {
                    finalObj[senderId] = arr[0].dateTimeSent
                }

                setRecentMessages(finalObj)

            })

        return unsubscribe

    }, [])

    // listener to get most recent time the user checked into the conversation with each friend
    useEffect(() => {
        
        const unsubscribe = db.collection('conversations').where('participants', 'array-contains', user.uid)
            .onSnapshot(snapshot => {

                const docs = snapshot.docs.map(doc => ({
                    ...doc.data()
                }))

                const newData = docs.map(doc => {
                    const entries = Object.entries(doc)
                    
                    const otherParticipant = doc.participants.filter(p => p !== user.uid)
                    // console.log(otherParticipant)
                    const finalObj = {}
                    for (const [key, val] of entries) {
                        if (key === user.uid) {
                            newVal = dayjs.unix(val.seconds)
                            finalObj[otherParticipant] = newVal 
                        }
                    }

                    return finalObj

                })
                
                const reducedNewData = newData.reduce(function(acc, x) {
                    for (var key in x) acc[key] = x[key];
                    return acc;
                }, {})

                setRecentEvents(reducedNewData)

            })

        return unsubscribe

    }, [])

    // effect to compare recent events to recent messages
    useEffect(() => {
        
        const currentMessages = Object.entries(recentMessages)
        const currentEvents = recentEvents

        const currentBadgeList = badgesList
        let newBadgeList = []
        for (const [userId, mesTime] of currentMessages) {
            const recentEventTime = currentEvents[userId] || dayjs('2019-01-25') // arbitrary date before now

            if (dayjs(mesTime).isAfter(dayjs(recentEventTime))) {
                if (!currentBadgeList.includes(userId)) {
                    newBadgeList = [userId, ...currentBadgeList]
                } else {
                    newBadgeList = currentBadgeList
                }
            } else {
                newBadgeList = newBadgeList.filter(n => n !== userId)
            }
            
        }

        setBadgesList(newBadgeList)

    }, [recentMessages, recentEvents]) 


    // collection group query to get the friends of fullCurrentUser
    // useEffect(() => {
    //     const friends = fullCurrentUser.friends
    //     const fullFriends = db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', )
    // }, [fullCurrentUser])

    return (
        <>
        {
            fullCurrentUser && fullCurrentUser.friends && fullCurrentUser.friends.length > 0 &&
                <ActionButton
                    buttonColor={'white'}
                    useNativeFeedback={true}
                    fixNativeFeedbackRadius={true}
                    // shadowStyle={{
                    //     shadowColor: "#000",
                    //     shadowOffset: {
                    //         width: 0,
                    //         height: 2,
                    //     },
                    //     shadowOpacity: 0.25,
                    //     shadowRadius: 3.84,

                    //     elevation: 5,
                    // }}
                    useNativeDriver={true}
                    bgColor={'rgba(0,0,0,0.2)'}
                    renderIcon={(active) => (
                        !active ?
                        <View>
                            <Avatar.Icon 
                                icon="chat" 
                                color={'#9a9a9a'}
                                style={{
                                    backgroundColor: 'white'
                                }}
                                size={48}
                            />
                            {
                                badgesList.length > 0 && 
                                    <Badge 
                                        size={8}
                                        style={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 10,
                                        }}
                                    />
                            }
                        </View> :
                        <Avatar.Icon 
                        icon="chevron-right" 
                            style={{
                                backgroundColor: 'white',
                                transform: [{
                                    rotate: "45deg"
                                }]
                            }}
                            size={48}
                        />
                    )}
                >
                    {
                        fullFriends.map(f => (
                            <ActionButton.Item
                                hideLabelShadow={true}
                                key={f.id}
                                fixNativeFeedbackRadius={true}
                                title={f.displayName}
                                textStyle={{
                                    fontFamily: 'Montserrat-Regular',
                                    fontSize: 12,
                                    color: theme.colors.text
                                }}
                                textContainerStyle={{
                                    marginVertical: 6,
                                    borderRadius: 48,
                                    backgroundColor: 'rgba(255,255,255,1)'
                                }}
                                // shadowStyle={{
                                //     shadowColor: "#000",
                                //     shadowOffset: {
                                //         width: 0,
                                //         height: 2,
                                //     },
                                //     shadowOpacity: 0.25,
                                //     shadowRadius: 3.84,
        
                                //     elevation: 5,
                                // }}
                                shadowStyle={{
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 0,
                                    },
                                    shadowOpacity: 0,
                                    shadowRadius: 0,
        
                                    elevation: 0,
                                }}
                                onPress={() => {
                                    navigation.navigate('Chat', { 
                                        chatPartnerId: f.id,
                                        allUserEvents: allUserEvents,
                                        allApEvents: allApEvents,
                                        selectedActivity: null
                                    })
                                }}
                            >
                                <Avatar.Image 
                                    source={{ uri: f.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} 
                                />
                                {
                                    badgesList.includes(f.id) &&
                                        <Badge 
                                            size={12}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: -2,
                                            }}
                                        />
                                }
                            </ActionButton.Item>

                        ))
                    }
                </ActionButton>
        }

        {
            fullCurrentUser && fullCurrentUser.friends && fullCurrentUser.friends.length === 0 &&
                          
                    <View
                        style={{
                            // flexDirection: 'row',
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            position: 'absolute',
                            bottom: 25,
                            right: 25
                        }}
                    >
                        <IconButton 
                            icon="chat" 
                            color={'#9a9a9a'}
                            style={{
                                backgroundColor: 'white',
                            }}
                            size={36}
                            onPress={() => {
                                setSnackbarVisible(true)
                                setSnackbarMessage('You must add a friend in order to chat!')
                                // console.log('pressed')
                            }}
                        />
                        <Badge 
                            size={8}
                            style={{
                                position: 'absolute',
                                top: 20,
                                right: 18,
                            }}
                        />
                    </View>

        }
        
        </>
    )
}
