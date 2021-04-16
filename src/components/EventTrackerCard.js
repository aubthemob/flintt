import React, { useEffect, useState, useCallback, useContext } from 'react'
import { Alert, View, Text, StyleSheet, TextInput, ScrollView, LayoutAnimation, UIManager } from 'react-native'

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// Components
import DoneEventTracker from '../components/DoneEventTracker'
import NopeEventTracker from '../components/NopeEventTracker'
import LaterEventTracker from '../components/LaterEventTracker'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'
import { CardContext } from './FeedCardOLD'
import { FeedContext } from '../screens/FeedScreen'

// Libraries
import dayjs from 'dayjs' 
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

// Services
import { getFriendService } from '../services/users'
import { getEventsService, updateEventAfterResult } from '../services/events'
import { setSystemMessageService, setImageMessageService } from '../services/messages'
import { setConversationCardsVisible, setCardVisibleFalse, getApCardsService } from '../services/cards'

// Styles
import { Card, Divider, Button, Avatar, IconButton } from 'react-native-paper'
import theme from '../styles/theme'
import { bodyText, fullScreenButtonLabelStyle, subtitleText, timePickerText } from '../styles/styles'

// Utils


export default function EventTrackerCard(props) {

    const {
        startDateTime,
        endDateTime,
        displayName,
        simple,
        userId: eventOrganizerId,
        accountabilityPartners,
        status,
        eventId
    } = props

    const [now, setNow] = useState(dayjs())
    const [eventTrackerForm, setEventTrackerForm] = useState({
        newStatus: 'failed',
        reasonsForSkipping: [],
        startDateTime,
        endDateTime,
        newStartDateTime: null,
        newEndDateTime: null,
        // difference: currentEvent && dayjs(currentEvent.end).diff(dayjs(currentEvent.start), 'minute'),
        selfieUrl: '',
    })

    const { setSnackbarMessage, setSnackbarVisible, getCards } = useContext(FeedContext)

    const { user } = useUserState()

    const setNewStatus = status => {
        setEventTrackerForm(prevState => ({
            ...prevState,
            newStatus: status
        }))
    }

    const handleEventTrackerFormSubmit = async () => {
        try {
            await updateEventAfterResult(user.uid, eventId, eventTrackerForm)
            await setSystemMessageService(user.uid, eventId, accountabilityPartners, eventTrackerForm.newStatus, user.displayName )
            // if (eventTrackerForm.selfieUrl) { await setImageMessageService({ accountabilityPartnerIds: accountabilityPartners, eventOrganizerId: eventOrganizerId, eventId: eventId, image: selfieUrl, senderId: user.uid }) }
            // await getCards()
            setSnackbarVisible(true)
            setSnackbarMessage('Your accountability partners have been notified!')
        } catch(err) {
            Alert.alert(err)
            console.log(err)
        }
    }
    
    return (
        <>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 12 }}>


                {/* Change this tab style from buttons to something more tab-like */}
                
                <Button
                    mode="text"
                    icon="close"
                    compact={true}
                    uppercase={false}
                    color='#D62525'
                    labelStyle={ eventTrackerForm.newStatus === 'failed' ? { color: '#D62525', fontFamily: 'Montserrat-SemiBold' } : { color: theme.colors.text, fontFamily: 'Montserrat-Regular' }}
                    style={{ margin: 6 }}
                    onPress={() => {
                        // LayoutAnimation.easeInEaseOut()
                        setNewStatus('failed')
                    }}
                >
                    Nope
                </Button>

                <Button
                    mode="text"
                    icon="fast-forward"
                    compact={true}
                    uppercase={false}
                    color='#FFBA38'
                    labelStyle={ eventTrackerForm.newStatus === 'postponed' ? { color: '#FFBA38', fontFamily: 'Montserrat-SemiBold' } : { color: theme.colors.text, fontFamily: 'Montserrat-Regular' }}
                    style={{ margin: 6 }}
                    onPress={() => {
                        // LayoutAnimation.easeInEaseOut()
                        setNewStatus('postponed')
                    }}
                >
                    Later
                </Button>

                <Button
                    mode="text"
                    icon="check"
                    compact={true}
                    uppercase={false}
                    color='#07951D'
                    labelStyle={ eventTrackerForm.newStatus === 'complete' ? { color: '#07951D', fontFamily: 'Montserrat-SemiBold' } : { color: theme.colors.text, fontFamily: 'Montserrat-Regular' }}
                    style={{ margin: 6 }}
                    onPress={() => {
                        // LayoutAnimation.easeInEaseOut()
                        setNewStatus('complete')
                    }}
                >
                    Done
                </Button>

            </View>

            {/* <Divider /> */}
            <View style={{ flex: 1, justifyContent:'center' }}>

                {
                    eventTrackerForm.newStatus === 'failed' &&
                        <NopeEventTracker 
                            eventTrackerForm={eventTrackerForm}
                            setEventTrackerForm={setEventTrackerForm}
                        /> ||
                    
                        eventTrackerForm.newStatus === 'postponed' &&
                        <LaterEventTracker 
                            eventTrackerForm={eventTrackerForm}
                            setEventTrackerForm={setEventTrackerForm}
                        /> ||
                    
                        eventTrackerForm.newStatus === 'complete' &&
                        <DoneEventTracker 
                            eventTrackerForm={eventTrackerForm}
                            setEventTrackerForm={setEventTrackerForm}
                        />
                }
                
            </View>
                
            <Button
                style={{
                    backgroundColor: theme.colors.accent,
                    maxWidth: 100,
                    alignSelf: 'flex-end'
                }}
                color='white'
                onPress={handleEventTrackerFormSubmit}
            >
                Save
            </Button>
        </>
    )
}

const styles = StyleSheet.create({
    fullScreenButtonLabelStyle
})