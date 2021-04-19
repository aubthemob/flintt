import React, { useReducer, useEffect, useState } from 'react'
import { StyleSheet, View, Alert, Text, SafeAreaView } from 'react-native'
import * as Permissions from 'expo-permissions'

// Analytics
import { addFriendButtonEvent, calendarCellPressEvent, calendarEventPressEvent } from '../utils/analyticsEvents'

// Components
import EventModal from '../components/EventModal'
import TooltipModal from '../components/TooltipModal'
import AddFriendModal from '../components/AddFriendModal'
import AskForPermissions from '../components/AskForPermissions'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Libraries
import { Calendar } from '../components/custom-calendar/index'
import dayjs from 'dayjs'
import { db } from '../lib/firebase'
import shortid from 'shortid'
import { useRoute } from '@react-navigation/native'
import {
    PulseIndicator,
  } from 'react-native-indicators'

// Services
import { getEventsService } from '../services/events'

// Styles
import { modalShadow } from '../styles/styles'
import theme from '../styles/theme'
import { Snackbar, FAB, Portal, Chip, IconButton } from 'react-native-paper'

// Utils
import 'dayjs/locale/en-ca'
import Modal from 'react-native-modal'
import { registerForPushNotificationsAsync } from '../utils/pushNotifications'
import UxGuidePopup from '../components/UxGuidePopup'
import { windowWidth, windowHeight } from '../utils/dimensions'
import { handleShare } from '../utils/sharing'
// import { dailyFrequencyItems, frequencyItems } from '../utils/activityFrequencyValues'


// --- End of imports ---

// Reducer
const EVENT_ACTIONS = {
    PRESS_CAL_CELL: 'press-cell',
    CLOSE_EVENT_MODAL: 'close-modal',
    ADD_EVENT: 'add-event',
    PRESS_CAL_EVENT: 'press-cal-event',
    GET_EVENTS: 'get-events',
    UPDATE_EVENT: 'update-event',
    DELETE_EVENT: 'delete-event'
}

const eventReducer = (state, action) => {
    switch (action.type) {
        case EVENT_ACTIONS.PRESS_CAL_CELL:
            return ({ 
                ...state, 
                eventModalOpen: true,
                eventModalProps: action.payload
            })
        case EVENT_ACTIONS.CLOSE_EVENT_MODAL:
            return ({
                ...state,
                eventModalProps: {},
                eventModalOpen: false
            })
        case EVENT_ACTIONS.ADD_EVENT:
            const newEvents = [...state.events]
            return ({    
                ...state,
                events: newEvents,
                eventModalOpen: false,
                eventModalProps: {
                    eventId: null,
                    startDateTime: null,            
                    endDateTime: null,  
                    activity: null,
                    title: null,
                    accountabilityPartners: [],
                    editMode: false,  
                },
            })
        case EVENT_ACTIONS.PRESS_CAL_EVENT:
            return ({
                ...state,
                eventModalOpen: true,
                eventModalProps: action.payload
            })
        case EVENT_ACTIONS.GET_EVENTS:
            return { ...state, events: action.payload }
        case EVENT_ACTIONS.UPDATE_EVENT:
            return { ...state, eventModalOpen: false }
        case EVENT_ACTIONS.DELETE_EVENT:
            const filteredEvents = state.events.filter(e => e.eventId !== action.payload)
            return { ...state, events: filteredEvents, eventModalOpen: false }
        default:
            throw new Error("Invalid action type")
    }
}

export default function CalendarScreen({ navigation }) {
    const [eventState, eventDispatch] = useReducer(eventReducer, {
        events: [],
        eventModalOpen: false,
        eventModalProps: {
            eventId: null,
            startDateTime: null,      
            endDateTime: null,
            activity: {},
            title: null,
            accountabilityPartners: [],      
            editMode: false,
            frequency: [],
            habit: '',
            icon: ''
        }
    })
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState(false)

    const [loading, setLoading] = useState(true)
    
    const [popupIsVisible, setPopupIsVisible] = useState(false)

    const [permissionPopupVisible, setPermissionPopupVisible] = useState(false)

    const { user } = useUserState()
    const route = useRoute()

    React.useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <IconButton 
                icon="account-plus" 
                color={theme.colors.accent}
                style={{ 
                    marginHorizontal: 12,
                }}
                onPress={() => {
                    // setPopupIsVisible(true)
                    handleShare('add-friend', user.uid, user.displayName)
                    addFriendButtonEvent(route.name)
                }}
                animated={true}
                mode='contained'
            />
          ),
        });
    }, [navigation])

    useEffect(() => {
        // realtime listener to get events

        setLoading(true)

        const unsubscribe = db.collection('users').doc(user.uid)
            .collection('events')
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
                const newData = data.map(item => {
                    return {
                        end: item.endDateTime ? dayjs.unix(item.endDateTime.seconds) : null,
                        eventId: item.id,
                        accountabilityPartners: item.accountabilityPartners,
                        start: item.startDateTime ? dayjs.unix(item.startDateTime.seconds) : null,
                        title: item.activity,
                        frequency: item.frequency,
                        eventGroupId: item.eventGroupId,
                        habit: item.habit,
                        icon: item.icon,
                        description: item.description
                    }
                })
    
                eventDispatch({ type: EVENT_ACTIONS.GET_EVENTS, payload: newData })
                setLoading(false)
            })
        return unsubscribe

    }, [])

    const hideEventModal = () => {
        eventDispatch({ type: EVENT_ACTIONS.CLOSE_EVENT_MODAL }) 
    }

    const handlePressCalCell = (dateTime) => {
        if (dateTime > dayjs().subtract(1, 'hour')) {
            eventDispatch({ type: EVENT_ACTIONS.PRESS_CAL_CELL, payload: { 
                startDateTime: dateTime, 
                endDateTime: dateTime, 
                editMode: false, 
                frequency: []
            } })
        } else {
            setSnackbarMessage('Activities must be scheduled in the future')
            setSnackbarVisible(true)
        }
        calendarCellPressEvent()
    }

    const handlePressEvent = ({ start, end, accountabilityPartners, eventId, activity, title, frequency, eventGroupId, icon, habit, description }) => {
        const payload = { 
            eventId, 
            startDateTime: start, 
            endDateTime: end, 
            accountabilityPartners,
            editMode: true, 
            activity: title,
            frequency,
            eventGroupId,
            icon,
            habit,
            description
            // frequencyVals: 
        }
        eventDispatch({ type: EVENT_ACTIONS.PRESS_CAL_EVENT, payload })
        calendarEventPressEvent()
    }

    return (
        <>
        <SafeAreaView style={{ flex: 1 }}>

            {
                loading ? 
                    <PulseIndicator 
                        color={theme.colors.primary}
                        size={120}
                    />
                :
                    <View style={{ flex: 1, justifyContent: 'flex-start' }}>

                        {
                            !loading &&
                                <View style={{ flex: 1, marginTop: 18 }}>
                                    <Calendar 
                                        events={eventState.events} 
                                        scrollOffsetMinutes={600}
                                        ampm={true}
                                        // eventCellStyle={ event => event.title === 'Exercise' ? { backgroundColor: theme.colors.primary  } : { backgroundColor: theme.colors.primary } } // modify color depending on activity type
                                        swipeEnabled={false}
                                        locale="en-ca"
                                        height={600} 
                                        onPressCell={dateTime => handlePressCalCell(dateTime)}
                                        onPressEvent={event => handlePressEvent(event)}
                                        swipeEnabled={true}      
                                        showTime={false}
                                        // Droppable={Droppable}
                                        // setDropTime={setDropTime}
                                    />
                                </View>
                        }
                            

                        {
                            !loading && eventState.events.length === 0 && eventState.eventModalOpen === false &&
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 120,
                                    zIndex: 1,
                                    // left: 100,
                                    alignSelf: 'flex-end', 
                                    maxWidth: windowWidth/1.25
                                }}
                            >
                                    <UxGuidePopup 
                                        type='press-cal-cell'
                                    />

                                </View>
                        }
                                
                        <Modal
                            animationType="slide"
                            avoidKeyboard={true}
                            hasBackdrop={true}
                            onBackdropPress={hideEventModal}
                            onDismiss={hideEventModal}
                            style={{ justifyContent: 'flex-end', margin: 0 }}
                            visible={eventState.eventModalOpen}
                            // swipeDirection={['down', 'up']}
                            // onSwipeComplete={hideEventModal}
                        >
                            <View style={[styles.modalShadow, { borderTopLeftRadius: 48, borderTopRightRadius: 48, }]}>
                                <EventModal
                                    {...eventState.eventModalProps}
                                    hideEventModal={hideEventModal}
                                    eventDispatch={eventDispatch}
                                    EVENT_ACTIONS={EVENT_ACTIONS}
                                    events={eventState.events}
                                    setSnackbarVisible={setSnackbarVisible}
                                    setSnackbarMessage={setSnackbarMessage}
                                    setPermissionPopupVisible={setPermissionPopupVisible} 
                                />
                            </View>
                        </Modal>

                        <AddFriendModal 
                            isVisible={popupIsVisible}
                            close={setPopupIsVisible}
                            user={user}
                            type={'global'}
                            screenSnackbarVisible={snackbarVisible}
                            setScreenSnackbarVisible={setSnackbarVisible}
                            screenSnackbarMessage={snackbarMessage}
                            setScreenSnackbarMessage={setSnackbarMessage}
                            // getFriends={getFriends}
                        />

                        <AskForPermissions 
                            isVisible={permissionPopupVisible}
                            close={setPermissionPopupVisible}
                            // askForPermissionAsync={askForPermissionAsync}
                            registerForPushNotificationsAsync={registerForPushNotificationsAsync}
                        />

                        <Snackbar 
                            visible={snackbarVisible}
                            onDismiss={() => setSnackbarVisible(false)}
                            duration={3000}
                            style={{ backgroundColor: '#404040' }}
                        >
                            {snackbarMessage}
                        </Snackbar>

                    </View>
            }


        </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    modalShadow
})