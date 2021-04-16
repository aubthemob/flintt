import React, { useReducer, useState, useEffect, useRef } from 'react'
import { Alert, StyleSheet, Text, View, LayoutAnimation, UIManager, TouchableOpacity, Platform, ScrollView, PixelRatio } from 'react-native'
import * as Permissions from 'expo-permissions'
import * as Localization from 'expo-localization'

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// Analytics
import { scheduleActivityFormSubmitEvent, deleteEventButtonPressEvent } from '../utils/analyticsEvents'

// Components
import AddAccountabilityPartners from './AddAccountabilityPartners'
import SelectActivity from './SelectActivity'
import EventModalRow from './EventModalRow'
import PopupModal from '../components/PopupModal'
import SelectFrequency from './SelectFrequency'
import TooltipModal from './TooltipModal'
import AskForPermissions from './AskForPermissions';
import AllEventsConfirmationModal from './AllEventsConfirmationModal';
import TimePicker from './TimePicker'
import ActivityDescription from './ActivityDescription'
import SelectHabit from './SelectHabit'
import PushNotificationsSwitch from './PushNotificationsSwitch'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Libs
import dayjs from 'dayjs'
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)
import Slider from '@react-native-community/slider'
import Modal from 'react-native-modal'
import DateTimePickerModal from "react-native-modal-datetime-picker";
const shortid = require('shortid')

// Services
import { createEvent, updateEvent, deleteEvent } from '../services/events'
import { getFriendService, getSingleUser } from '../services/users'
// import { setFriendTagNotification } from '../services/pushNotifications'
import { setExpoToken } from '../services/auth'

// Styles
import { Avatar, Button, IconButton, Chip, Divider, Snackbar } from 'react-native-paper'
import { bodyText, fullScreenButtonLabelStyle, subtitleText, timePickerText } from '../styles/styles'
import theme from '../styles/theme'

// Utils
import { windowHeight, windowWidth } from '../utils/dimensions'
import { timeFormatter } from '../utils/helperFunctions'
import { frequencyItems, reduceFrequencyValue } from '../utils/activityFrequencyValues'
import { registerForPushNotificationsAsync } from '../utils/pushNotifications'
import { PLACEHOLDERS } from '../utils/placeholders'


// --- End of imports ---

// Reducer

const EVENT_FORM_ACTIONS = {
    CHANGE_START_TIME: 'change-start-time',
    CHANGE_END_TIME: 'change-end-time',
    CHANGE_DIFFERENCE: 'change-difference',
    CHANGE_ACCOUNTABILITY_PARTNERS: 'change-accountability-partners',
    SET_ERRORS: 'set-errors',
    REMOVE_ACCOUNTABILITY_PARTNERS: 'remove-accountability-partners',
    MERGE_ACCOUNTABILITY_PARTNER_INFO: 'merge-accountability-partner-info',
    CHANGE_ACTIVITY_TITLE: 'change-activity-title',
    CHANGE_FREQUENCY: 'change-frequency',
    SET_TIMEZONE: 'set-timezone',
    CHANGE_HABIT: 'change-habit',
    CHANGE_DESCRIPTION: 'change-description',
    CHANGE_ICON: 'change-icon'
}

function formReducer(state, action) {
    switch (action.type) {
        case EVENT_FORM_ACTIONS.CHANGE_START_TIME:
            return { ...state, startDateTime: action.payload }
        case EVENT_FORM_ACTIONS.CHANGE_END_TIME:
            return { ...state, endDateTime: action.payload }
        case EVENT_FORM_ACTIONS.CHANGE_ACCOUNTABILITY_PARTNERS: 
            return { ...state, accountabilityPartners: action.payload }
        // case EVENT_FORM_ACTIONS.REMOVE_ACCOUNTABILITY_PARTNERS:
        //     const currentAccountabilityPartners = state.accountabilityPartners
        //     const newAccountabilityPartners = currentAccountabilityPartners.filter(ap => ap !== action.payload)
        //     return { ...state, accountabilityPartners: newAccountabilityPartners }
        case EVENT_FORM_ACTIONS.CHANGE_ACTIVITY_TITLE:
            return {
                ...state, 
                activity: action.payload.activity,
                habit: action.payload.habit,
                icon: action.payload.icon
            }
        case EVENT_FORM_ACTIONS.MERGE_ACCOUNTABILITY_PARTNER_INFO:
            return { ...state, accountabilityPartners: action.payload }
        case EVENT_FORM_ACTIONS.CHANGE_FREQUENCY:
            return { ...state, frequency: action.payload }  
        case EVENT_FORM_ACTIONS.SET_TIMEZONE:
            return { ...state, timezone: action.payload }
        case EVENT_FORM_ACTIONS.CHANGE_HABIT:
            return { ...state, habit: action.payload }
        case EVENT_FORM_ACTIONS.CHANGE_ICON:
            return { ...state, icon: action.payload }
        case EVENT_FORM_ACTIONS.CHANGE_DESCRIPTION:
            return { ...state, description: action.payload }
        default:
            throw new Error("Invalid action type")
    }
}

export default function EventModal(props) {
    const { 
        startDateTime, 
        endDateTime,
        activity,
        editMode, 
        accountabilityPartners, 
        frequency,
        eventId, 
        eventGroupId,
        hideEventModal, 
        eventDispatch, 
        EVENT_ACTIONS, 
        events,
        setSnackbarVisible,
        setSnackbarMessage,
        setPermissionPopupVisible,
        habit,
        icon,
        description
    } = props
    
    const [formState, formDispatch] = useReducer(formReducer, {
        eventId: eventId ? eventId : shortid.generate(),
        activity: editMode ? activity : '',
        startDateTime: dayjs(startDateTime),
        difference: editMode ? dayjs(endDateTime).diff(dayjs(startDateTime), 'minute') : 0,
        endDateTime: editMode ? dayjs(endDateTime) : dayjs(startDateTime),
        accountabilityPartners: editMode ? accountabilityPartners : [],
        frequency: editMode ? frequency : frequencyItems.map(f => f.key),
        timezone: '',
        eventGroupId: eventGroupId ? eventGroupId : shortid.generate(),
        description: editMode ? description : '',
        habit: editMode ? habit : '',
        icon: editMode ? icon : ''
    })
    const [friends, setFriends] = useState([])
    const [componentFocused, setComponentFocused] = useState(null)
    const [timeComponentFocused, setTimeComponentFocused] = useState(null)

    const [errorSnackbarVisible, setErrorSnackbarVisible] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [modalState, setModalState] = useState(false)

    const [notificationsPermissions, setNotificationsPermissions] = useState('')

    const [allEventsConfirmationModalVisible, setAllEventsConfirmationModalVisible] = useState(false)
    const [allEventsConfirmationModalType, setAllEventsConfirmationModalType] = useState('')
    
    const [fullUser, setFullUser] = useState({})
    
    const [timePickerType, setTimePickerType] = useState(false)
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false)

    const { user } = useUserState()

    console.log(formState.accountabilityPartners)

    useEffect(() => {
        getUserFunc()
    }, [])

    useEffect(() => {
        const timezone = Localization.timezone
        formDispatch({ type: EVENT_FORM_ACTIONS.SET_TIMEZONE, payload: timezone })
    }, [])

    const getUserFunc = async () => {
        const newUser = await getSingleUser(user.uid)
        setFullUser(newUser)
    }

    useEffect(() => {
        getFriends()
    }, [])

    const getFriends = async () => {
        try {
            const data = await getFriendService(user.uid)
            setFriends(data)
            if (!editMode) {
                const initialFriends = data.map(d => d.id)
                formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_ACCOUNTABILITY_PARTNERS, payload: initialFriends })
            }

        } catch(err) {
            Alert.alert(err.message)
            console.log(err)
        }
    }

    const setFriendsOnAddFirstFriendInFlow = (data) => { //disgusting. im sorry 
        const dataMod = data.map(d => ({
            title: d.displayName || null,
            key: d.id,
            selected: true,
            avatar: d.avatarUrl || null
        }))
        setFriends(dataMod)
        const accountabilityPartners = dataMod.filter(d => d.selected === true)
        formDispatch({ type: EVENT_FORM_ACTIONS.MERGE_ACCOUNTABILITY_PARTNER_INFO, payload: accountabilityPartners })
    }

    useEffect(() => {
        if (componentFocused !== 'Time') {
            setTimeComponentFocused(null)
        } 
    }, [componentFocused])

    useEffect(() => {
        getPermissionsAsync()
    }, [])

    const errorCheck = () => {

        const timeError = formState.startDateTime >= formState.endDateTime
        const activityError = formState.activity && formState.activity.length >= 3 && formState.activity.length < 60 ? false : true
        const overlapError = !editMode && overlapErrorCheck(formState.startDateTime, formState.endDateTime)
        const habitError = formState.habit === ''

        if (!timeError && !activityError && !overlapError && !habitError) {
            return true
        } else if (timeError) {
            setErrorMessage(`Your activity must last at least 5 minutes.`)
            setErrorSnackbarVisible(true)
            return false
        } else if (activityError) {
            setErrorMessage(`Your activity must be between 3 & 60 characters.`)
            setErrorSnackbarVisible(true)
            return false
        } else if (overlapError) {
            setErrorMessage(`This activity overlaps with another activity.`)
            setErrorSnackbarVisible(true)
            return false
        } else if (habitError) {
            setErrorMessage('You must select a habit category by pressing the button next to the activity name!')
            setErrorSnackbarVisible(true)
        }

    }

    const handleFormSubmit = async (eventsType) => {
        try {                
            let payload = formState
            payload.userName = user.displayName
            payload.eventsType = eventsType
            payload.accountabilityPartnerNames = getNames(payload.accountabilityPartners)
            
            if (editMode === false) {
                scheduleActivityFormSubmitEvent(payload.activityId, payload.startDateTime, payload.endDateTime, payload.accountabilityPartners, friends, editMode)
                eventDispatch({ type: EVENT_ACTIONS.ADD_EVENT, payload }) // Remove with realtime listener?
                const data = { userId: user.uid, ...payload }
                await createEvent(data)
                setSnackbarVisible(true)
                setSnackbarMessage('Your activity was scheduled')
                if (notificationsPermissions !== 'granted' || !fullUser.expoPushToken) {
                    setPermissionPopupVisible(true)
                }

            } else {
                scheduleActivityFormSubmitEvent(payload.activityId, payload.startDateTime, payload.endDateTime, payload.accountabilityPartners, friends, editMode)
                eventDispatch({ type: EVENT_ACTIONS.UPDATE_EVENT, payload }) // Remove with realtime listener?
                const data = { userId: user.uid, ...payload }
                await updateEvent(data)
                setSnackbarVisible(true)
                setSnackbarMessage('Your activity was successfully edited')
                if (notificationsPermissions !== 'granted' || !fullUser.expoPushToken) {
                    setPermissionPopupVisible(true)
                }

            }

        } catch(err) {
            Alert.alert(err.message)
            console.log(err)
        }
    }

    const getNames = (idArr) => {
        if (idArr.length > 0) {
            const filtFriends = friends.filter(f => idArr.includes(f.id))
            const names = filtFriends.map(f => f.displayName)
            return names
        } else {
            return []
        }
    }

    const overlapErrorCheck = (start, end) => {
        let error = false
        events.forEach(e => {
            if (start > e.start && start < e.end) {
                error = true
            } else if (end > e.start && end < e.end) {
                error = true
            } else if (start < e.start && end > e.end) {
                error = true
            } else if (start > e.start && end < e.end) {
                error = true
            }
        })
        return error
    } 

    const handleEventDelete = async (eventsType) => {

        const options = {
            userId: user.uid,
            eventId,
            eventGroupId: eventGroupId || null,
            eventsType
        }

        try {
            deleteEventButtonPressEvent(formState.activityId)
            await deleteEvent(options)
            eventDispatch({ type: EVENT_ACTIONS.DELETE_EVENT, payload: formState.eventId })
        } catch(err) {
            Alert.alert(err.message)
            console.log(err)
        }
    }

    const getPermissionsAsync = async () => {
        const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
        setNotificationsPermissions(status)
    }

    const defineFrequencyText = (frequency) => {
        if (frequency.length < 7) {
            const days = frequencyItems.filter(fi => frequency.includes(fi.key)).map(fi => fi.title).join(', ')
            return days
        } else {
            return 'Every day'
        }
    }

    const getPlaceholders = (user) => {
        const habit = user.firstHabit || 'exercise'
        const proficiency = user.firstHabitLevel ? String('proficiency' + user.firstHabitLevel) : String('proficiency' + 0)
        const returnItem = PLACEHOLDERS[habit][proficiency]
        return returnItem
    }
    
    return (
        <>
            <View style={{ height: windowHeight/1.75 }}>

                <View 
                    style={{ 
                        backgroundColor: 'white', 
                        height: windowHeight/1.75,
                        paddingTop: 24, 
                        paddingBottom: 24, 
                        borderTopLeftRadius: 48, 
                        borderTopRightRadius: 48, 
                        overflow: 'hidden' 
                    }}
                >

                    {/* FIRST ROW */}

                    <View style={{ flex: 1, flexDirection: 'row', marginBottom: 24, paddingHorizontal: 12 }}>
                        
                        <IconButton 
                            icon="window-close" 
                            size={24} 
                            style={{ backgroundColor: 'white', marginTop: -6 }} 
                            color={theme.colors.text} 
                            onPress={hideEventModal}
                        />

                        <View 
                            style={{ 
                                flex: 1, 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                            }}
                        >
                            
                            <SelectHabit 
                                fullUser={fullUser}
                                formState={formState}
                                getPlaceholders={getPlaceholders}
                                EVENT_FORM_ACTIONS={EVENT_FORM_ACTIONS}
                                formDispatch={formDispatch}
                                editMode={editMode}
                            />

                            <SelectActivity 
                                formState={formState}
                                formDispatch={formDispatch}
                                EVENT_FORM_ACTIONS={EVENT_FORM_ACTIONS}
                                getPlaceholders={getPlaceholders}
                                fullUser={fullUser}
                            />

                        </View>

                        {
                            editMode && 
                            <IconButton 
                                icon="delete" 
                                size={24} 
                                style={{ backgroundColor: 'white' }} 
                                color={theme.colors.text} 
                                onPress={() => {

                                    if (formState.frequency.length > 0) {
                                        setAllEventsConfirmationModalVisible(true)
                                        setAllEventsConfirmationModalType('delete')
                                    } else if (formState.frequency.length === 0) {
                                        handleEventDelete('one-event')
                                    }

                                }}
                            />
                        }
                            <Button
                                onPress={() => {

                                    const noErrors = errorCheck()

                                    if (noErrors === true && editMode === false) {
                                        handleFormSubmit()
                                    }

                                    if (noErrors === true && editMode === true) {

                                        if (formState.frequency.length === 0) {
                                            handleFormSubmit('one-event')
                                        }

                                        if (formState.frequency.length > 0) {
                                            setAllEventsConfirmationModalVisible(true)
                                            setAllEventsConfirmationModalType('edit')
                                        }

                                    }
                                }} 
                                labelStyle={styles.fullScreenButtonLabelStyle}
                                mode="contained"
                                style={{ backgroundColor: theme.colors.accent, alignSelf: 'flex-start', margin: 6, minHeight: 34 }}
                            >
                                Commit
                            </Button>

                    </View>

                    <Divider style={{ marginHorizontal: 12 }} />

                    {/* SECOND ROW */}

                    {/* <View style={ componentFocused === 'SelectActivity' ? { flex: 4, marginTop: 12 } : { flex: 1, marginVertical: 12 }}> */}
                    <View style={{ flex: 1, marginVertical: 12, flexDirection: 'row', alignItems: 'center' }}>

                        {
                            fullUser &&
                                <ActivityDescription 
                                    getPlaceholders={getPlaceholders}
                                    description={formState.description}
                                    EVENT_FORM_ACTIONS={EVENT_FORM_ACTIONS}
                                    fullUser={fullUser}
                                    formDispatch={formDispatch}
                                    formState={formState}
                                />
                        }

                    </View>

                    <Divider style={{ marginHorizontal: 12 }} />

                    {/* TIME */}

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginVertical: 12
                            }}
                        >
                            <Avatar.Icon icon="clock" size={48} style={{ backgroundColor: 'transparent' }} color={theme.colors.text} /> 
                            <View>
                                <View
                                    style={{
                                        flexDirection: 'row'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            setTimePickerType('start')
                                            setTimePickerVisibility(true)
                                        }}
                                        style={{
                                            backgroundColor: '#EAEAEA',
                                            padding: 10,
                                            borderRadius: 12
                                        }}  
                                    >
                                        <Text
                                            style={{
                                                fontSize: 20,
                                                color: theme.colors.text,
                                                fontFamily: 'Montserrat-Regular',
                                                backgroundColor: '#EAEAEA',
                                            }}
                                        >
                                            {dayjs(formState.startDateTime).format('LT')}
                                        </Text>
                                    </TouchableOpacity>

                                    <Text
                                        style={{
                                            marginHorizontal: 6,
                                            fontFamily: 'Montserrat-Regular',
                                            color: theme.colors.text,
                                            fontSize: 24
                                        }}
                                    >
                                        - 
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setTimePickerType('end')
                                            setTimePickerVisibility(true)
                                        }}
                                        style={{
                                            backgroundColor: '#EAEAEA',
                                            padding: 10,
                                            borderRadius: 12
                                        }}  
                                    >
                                        <Text
                                            style={{
                                                fontSize: 20,
                                                color: theme.colors.text,
                                                fontFamily: 'Montserrat-Regular'

                                            }}
                                        >
                                            {dayjs(formState.endDateTime).format('LT')}
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                                <Text 
                                    style={{
                                        // alignSelf: 'flex-start',
                                        color: 'grey',
                                        fontFamily: 'Montserrat-Regular',
                                        fontSize: 12,
                                    }}
                                >
                                    Starting { formState.startDateTime.format('ddd MMM D') }
                                </Text>
                            </View>
                        </View>


                    {/* RECURRING ACTIVITY */}
                    <Divider style={{ marginHorizontal: 12 }} />

                    <EventModalRow
                        placeholder={'Select activity frequency'} 
                        value={ defineFrequencyText(formState.frequency) } 
                        onPress={setModalState}
                    />

                    <Divider style={{ marginHorizontal: 12 }} />

                    {/* FOURTH ROW */}

                    <AddAccountabilityPartners 
                        friends={friends}
                        setComponentFocused={setComponentFocused}
                        componentFocused={componentFocused}
                        getFriends={getFriends}
                        setFriendsOnAddFirstFriendInFlow={setFriendsOnAddFirstFriendInFlow}
                        accountabilityPartners={formState.accountabilityPartners}
                        formDispatch={formDispatch}
                        EVENT_FORM_ACTIONS={EVENT_FORM_ACTIONS}
                        eventId={eventId}
                        eventGroupId={eventGroupId}
                    /> 

                    {
                        fullUser && !fullUser.expoPushToken &&
                        <>
                            <Divider style={{ marginHorizontal: 12 }} />
                            <PushNotificationsSwitch fullUser={fullUser} />
                        </>
                    }

                    <Snackbar
                        visible={errorSnackbarVisible}
                        onDismiss={() => setErrorSnackbarVisible(false)}
                        style={{ backgroundColor: '#404040' }}
                        duration={3000}
                    >
                        {errorMessage}
                    </Snackbar>

                </View>

            </View>
            
            {/* Frequency modal */}
            <Modal
                isVisible={modalState}
                onBackdropPress={() => setModalState(false)}
            >
                <SelectFrequency 
                    frequencyItems={frequencyItems}
                    setModalState={setModalState}
                    formDispatch={formDispatch}
                    formState={formState}
                    EVENT_FORM_ACTIONS={EVENT_FORM_ACTIONS}
                />
            </Modal>

            <Modal
                isVisible={allEventsConfirmationModalVisible}
                onBackdropPress={() => setAllEventsConfirmationModalVisible(false)}
            >
                <AllEventsConfirmationModal 
                    setAllEventsConfirmationModalVisible={setAllEventsConfirmationModalVisible}
                    type={allEventsConfirmationModalType}
                    activity={formState.activity}
                    handleFormSubmit={handleFormSubmit}
                    handleEventDelete={handleEventDelete}
                />
            </Modal>

            <TimePicker 
                type={timePickerType}
                dateTime={timePickerType === 'start' ? formState.startDateTime : formState.endDateTime}
                formDispatch={formDispatch}
                EVENT_FORM_ACTIONS={EVENT_FORM_ACTIONS}
                isTimePickerVisible={isTimePickerVisible}
                setTimePickerVisibility={setTimePickerVisibility}
            />
        </>
    )
}

const styles = StyleSheet.create({
    bodyText,
    fullScreenButtonLabelStyle,
    subtitleText,
    timePickerText
})
