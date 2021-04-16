import React, { useEffect, useState, useCallback } from 'react'
import { Alert, View, Text, StyleSheet, TextInput, ScrollView } from 'react-native'

// Components
import EventTrackerCard from './EventTrackerCard'
import ConversationCard from './ConversationCard'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Libraries
import dayjs from 'dayjs' 
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

// Services
import { getEventsService, setEventStatus } from '../services/events'

// Styles
import { Card, Divider, Button, Avatar, IconButton, Snackbar } from 'react-native-paper'
import theme from '../styles/theme'
import { bodyText, fullScreenButtonLabelStyle, subtitleText, timePickerText } from '../styles/styles'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'
import { ACTIVITIES } from '../utils/activities'

// --- End of imports ---

// export const CardContext = React.createContext()

export default function FeedCard(props) {
    const { 
        eventId, 
        eventOrganizerId, 
        cardId,
        navigateToCalendarScreen,
        startDateTime,
        simple
    } = props

    const [now, setNow] = (dayjs())
    
    const { user } = useUserState()

    // const cardContextValue = {
    //     ...props,
    //     currentEvent,
    // }

    return (
        <>
            {/* <CardContext.Provider value={cardContextValue}> */}
                <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', marginVertical: 24 }}>
                    <Card 
                        style={{ width: windowWidth*0.95, height: windowHeight/1.5 }}
                        elevation={1}
                    >

                        {/* <Card.Title 
                            title={
                                startDateTime < now ? 
                                'Past' :
                                'Future'
                            } 
                            // subtitle={
                            //     `to ${simple.toLowerCase()} ${now.to(currentEvent.start)}`
                            // }
                            // // left={props => <IconButton icon={'close'} onPress={() => hideCard(cardId)}/>}
                            // // leftStyle={{ marginLeft: -12, marginTop: -12 }}
                            // titleNumberOfLines={2}
                            // titleStyle={{ fontFamily: 'Ubuntu-Bold' }}
                            // subtitleStyle={{ fontFamily: 'Montserrat-Medium' }}
                        /> */}

                        {/* {
                            type && type === 'conversation' &&
                            currentEvent &&
                                <ConversationCard 
                                    cardId={cardId}
                                />
                        }

                        {
                            type && type === 'event-tracker' &&
                            currentEvent &&
                                <EventTrackerCard 
                                    cardId={cardId}
                                />
                        } */}

                    </Card>
                </View>

            {/* </CardContext.Provider> */}
        </>
    )
}

const styles = StyleSheet.create({
    fullScreenButtonLabelStyle
})