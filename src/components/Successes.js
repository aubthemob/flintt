import React, { useEffect, useState } from 'react'
import { FlatList, View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native'

import FullScreenImage from './FullScreenImage'

import { useUserState } from '../contexts/UserAuthContext'

import * as firebase from 'firebase'
import { db } from '../lib/firebase'
import dayjs from 'dayjs'
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)
import Modal from 'react-native-modal'

import { ActivityIndicator, Avatar, IconButton } from 'react-native-paper'
import theme from '../styles/theme'

import { windowHeight, windowWidth } from '../utils/dimensions'
import { HABITS } from '../utils/activities'
import { calendarConfig } from '../utils/calendar'

import { checkAndSetFire, checkAndSetAchievement } from '../utils/eventsHelpers'


export default function Successes({ profileUserId, perspective, fullUser }) {

    const [eventsLoading, setEventsLoading] = useState(false)
    const [completeEvents, setCompleteEvents] = useState([])
    const [allEvents, setAllEvents] = useState([])

    const [imageSelected, setImageSelected] = useState(false)
    const [selectedImageUri, setSelectedImageUri] = useState('')
    const [selectedImageEventId, setSelectedImageEventId] = useState('')

    const [selectedHabit, setSelectedHabit] = useState('')

    const [filteredCompleteEvents, setFilteredCompleteEvents] = useState([])

    const { user } = useUserState()

    useEffect(() => {

        if (perspective === 'current-user') {
            const unsubscribe = db.collection('users').doc(profileUserId)
                .collection('events')
                // .where('status', '==', 'complete')
                .orderBy("startDateTime", "desc")
                .onSnapshot(snapshot => {
                    setEventsLoading(true)
                    const rawEvents = snapshot.docs.map(s => ({
                        id: s.id,
                        // startDateTime: dayjs(s.startDateTime.seconds),
                        // endDateTime: dayjs.unix(s.endDateTime.seconds),
                        ...s.data(),
                    }))
    
                    setAllEvents(rawEvents)

                    const newCompleteEvents = rawEvents.filter(r => r.status === 'complete')
    
                    setCompleteEvents(newCompleteEvents)
                    setEventsLoading(false)
                    
                })
            
            return unsubscribe
        }

        if (perspective === 'friend') {
            const unsubscribe = db.collection('users').doc(profileUserId)
                .collection('events')
                .where("accountabilityPartners", "array-contains", user.uid)
                // .where('status', '==', 'complete')
                .orderBy("startDateTime", "desc")
                .onSnapshot(snapshot => {
                    setEventsLoading(true)
                    const rawEvents = snapshot.docs.map(s => ({
                        id: s.id,
                        // startDateTime: dayjs.unix(s.startDateTime.seconds),
                        // endDateTime: dayjs.unix(s.endDateTime.seconds),
                        ...s.data(),
                    }))
    
                    setAllEvents(rawEvents)

                    const newCompleteEvents = rawEvents.filter(r => r.status === 'complete')
    
                    setCompleteEvents(newCompleteEvents)
                    setEventsLoading(false)
                    
                })
            
            return unsubscribe
        }

    }, [])

    const handleImagePress = (uri, eventId) => {
        setSelectedImageUri(uri)
        setSelectedImageEventId(eventId)
        setImageSelected(true)
    }

    const renderItem = ({ item }) => {

        const startDateTimeDayjs = dayjs.unix(item.startDateTime.seconds)
        const formattedDate = startDateTimeDayjs.calendar(null, calendarConfig)

        const curEvents = [...allEvents]
        const eventsWithProperDate = curEvents.map(c => ({
            ...c,
            startDateTime: dayjs.unix(c.startDateTime.seconds),
            endDateTime: dayjs.unix(c.endDateTime.seconds),
        }))

        const isOnFire = checkAndSetFire(allEvents, item.activity, item.id)
        const achievement = checkAndSetAchievement(eventsWithProperDate, item.habit, startDateTimeDayjs)

        return (

            <View
                style={{
                    paddingLeft: 10,
                }}
            >
                <View
                    style={{
                        // flex: 1,
                        // backgroundColor: 'blue',
                        flexDirection: 'row',
                        borderLeftWidth: 1,
                        borderColor: 'grey',
                        paddingBottom: 18
                        // borderWidth: 1
                    }}
                >

                    {/* <View 
                        style={{
                            height: 40,
                            width: 40,
                            borderRadius: 40/2,
                            borderWidth: 1,
                            borderColor: 'red',
                        }}
                    > */}
                        <Avatar.Icon 
                            icon='check'
                            size={20}
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: 'grey',
                                marginLeft: -10,
                                zIndex: 5,
                                
                            }}
                            color='green'
                        />
                    {/* </View> */}

                    <View
                        style={{
                            marginLeft: 10
                        }}
                    >
                        <View>
                            <View
                                style={{
                                    flexDirection: 'row'
                                }}
                            >
                                <Text>{item.activity}</Text>
                                <Text>{isOnFire && `🔥`}</Text>
                                <Text>{achievement}</Text>

                            </View>
                            <Text>{formattedDate}</Text>
                            {
                                item.description !== undefined && item.description !== '' &&
                                    <Text>{item.description}</Text> 
                            }
                        </View>
                        {
                            item.selfieUrl &&
                            <TouchableWithoutFeedback
                                onPress={() => handleImagePress(item.selfieUrl, item.id)}
                            >
                                <View
                                    style={{
                                        height: windowWidth,
                                        width: windowWidth,
                                        marginTop: 12,
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <Image 
                                        source={{ uri: item.selfieUrl }}
                                        style={{
                                            // flex: 1, 
                                            // alignItems: 'flex-end',
                                            height: '75%',
                                            width: '75%',
                                            borderRadius: 400,
                                            transform: [
                                                {scaleX: -1},
                                            ],
                                        }}
                                        resizeMode='cover'
                                        
                                    />
                                </View>

                            </TouchableWithoutFeedback>
                        }

                    </View>
                </View>
            </View>

        )
    }

    const ListFooterComponent = () => {
        return (
            <View
                style={{
                    paddingLeft: 10,
                }}
            >
                <View
                    style={{
                        // flex: 1,
                        // backgroundColor: 'blue',
                        flexDirection: 'row',
                        borderLeftWidth: 1,
                        borderColor: 'grey',
                        // paddingBottom: 18
                        // borderWidth: 1
                    }}
                >
                    <Avatar.Icon 
                        icon='circle'
                        size={20}
                        style={{
                            backgroundColor: 'white',
                            borderWidth: 1,
                            borderColor: 'grey',
                            marginLeft: -10,
                            
                        }}
                        color='transparent'
                    />

                    <View
                        style={{
                            marginLeft: 10
                        }}
                    >

                        <View
                            style={{
                                flexDirection: 'row'
                            }}
                        >
                            <Text>Joined Flintt</Text>
                            {
                                fullUser.createdAt &&
                                    <Text> on {fullUser.createdAt}</Text>
                            }
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const handleHabitIconPress = habit => {
        const newSelectedHabit = selectedHabit === habit ? '' : habit
        setSelectedHabit(newSelectedHabit)

        if (newSelectedHabit !== '') {
            const newFilteredCompleteEvents = completeEvents.filter(c => c.habit === newSelectedHabit)
            setFilteredCompleteEvents(newFilteredCompleteEvents)
        } else {
            setFilteredCompleteEvents(completeEvents)
        }
    }

    if (eventsLoading) {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} color={theme.colors.primary} size='large' />
            </View>
        )
    } else {
        return (
            <>

                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginBottom: 24
                        // borderRadius: 24,
                        // borderWidth: 1
                        // borderWidth: 1,
                    }}  
                >
                    {
                        HABITS.map((h, i) => (
                            <View
                                key={i}
                                style={ selectedHabit === h.habit ? styles.toggleSelected : styles.toggleUnselected }
                            >
                                <IconButton 
                                    icon={h.icon} 
                                    // style={selectedHabit === h.habit ? styles.toggleSelected : styles.toggleUnselected} 
                                    size={24} 
                                    color={selectedHabit === h.habit ? 'white' : '#D5D5D5'} 
                                    onPress={() => handleHabitIconPress(h.habit)}
                                />
                            </View>
                        ))
                    }
                </View>

                {
                    perspective === 'current-user' &&
                        <View
                            style={{
                                flexDirection: 'row',
                                marginBottom: 24
                            }}
                        >
                            <Avatar.Icon 
                                icon='information-outline'
                                size={28}
                                style={{
                                    backgroundColor: 'transparent'
                                }}
                                color='green'
                            />
                            <Text>Only the supporters tagged to these activities will be able to see these successes</Text>

                        </View>
                }

                <FlatList 
                    data={ selectedHabit === '' ? completeEvents : filteredCompleteEvents }
                    renderItem={renderItem}
                    scrollEnabled={false}
                    ListFooterComponent={ListFooterComponent}
                    ListEmptyComponent={
                        <View
                            style={{
                                paddingLeft: 10,
                            }}
                        >
                            <View
                                style={{
                                    // flex: 1,
                                    // backgroundColor: 'blue',
                                    flexDirection: 'row',
                                    borderLeftWidth: 1,
                                    borderColor: 'grey',
                                    // paddingBottom: 18
                                    // borderWidth: 1
                                }}
                            >
                                <Avatar.Icon 
                                    icon='circle'
                                    size={20}
                                    style={{
                                        backgroundColor: 'white',
                                        borderWidth: 1,
                                        borderColor: 'grey',
                                        marginLeft: -10,
                                        
                                    }}
                                    color='transparent'
                                />

                                <View
                                    style={{
                                        marginLeft: 10
                                    }}
                                >

                                    <View
                                        style={{
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <Text>Healthy activities will show up here!</Text>
                                        {
                                            fullUser.createdAt &&
                                                <Text> on {fullUser.createdAt}</Text>
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    }
                />

                <Modal
                    isVisible={imageSelected}
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    style={{
                        margin: 0
                    }}
                >
                    <FullScreenImage 
                        uri={selectedImageUri}
                        setFullScreenImageVisible={setImageSelected}
                        eventId={selectedImageEventId}
                        perspective={perspective}
                    />

                </Modal>

            </>
        )
    }
}

const styles = StyleSheet.create({
    toggleSelected: {
        backgroundColor: theme.colors.primary
    },
    toggleUnselected: {
        backgroundColor: '#EAEAEA'
    }
})