import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, Button } from 'react-native'

import StartOfDay from './StartOfDay'

import ActivityInCard from './ActivityInCard'

import theme from '../styles/theme'
import { IconButton } from 'react-native-paper'

import { isEarliestEventToday } from '../utils/eventsHelpers'
import { windowWidth } from '../utils/dimensions'
import { handleShare } from '../utils/sharing'
import dayjs from 'dayjs'
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)

import { calendarConfig } from '../utils/calendar'


export default function MyActivities({ allUserEvents, feedUserEvents, fullCurrentUser, fullFriends, navigateToCalendarScreen, showScheduleActivityCard, setShowScheduleActivityCard }) {

    const [scheduleActivityText, setScheduleActivityText] = useState()
    const [scheduleActivityButton, setScheduleActivityButton] = useState()

    useEffect(() => {
            const { text, button } = selectCardContent(allUserEvents)
            setScheduleActivityText(text)
            setScheduleActivityButton(button)

    }, [allUserEvents])

    const selectCardContent = (allUserEvents) => {

        const eventsToday = allUserEvents.filter(a => a.startDateTime >= dayjs().startOf('day') && a.startDateTime < dayjs().endOf('day'))
        const nextActivity = allUserEvents.find(a => dayjs.unix(a.startDateTime) > dayjs().endOf('day'))
        const eventsInFuture = allUserEvents.filter(a => a.startDateTime > dayjs().endOf('day'))
        
        if (allUserEvents.length === 0) {
            const returnObj = {
                text: 'Are you ready to become your best self?',
                button: true
            }
            return returnObj
        } else if (eventsToday.length === 0 && eventsInFuture.length !== 0) {
            const returnObj = {
                text: `Nothing scheduled today. You're back in action ${nextActivity.startDateTime.calendar(null, calendarConfig)}.`,
                button: false
            }
            return returnObj
        } else if (eventsInFuture.length === 0) {
            const returnObj = {
                text: "Your calendar is empty. Get back on track by committing to a small recurring activity!",
                button: true
            }
            return returnObj
        } else {
            const returnObj = {
                text: "",
                button: false
            }
            return returnObj
        }

    }

    return (
        <>
            <FlatList 
                data={feedUserEvents}
                renderItem={({ item }) => {

                    const startOfDay = isEarliestEventToday(item.eventId, feedUserEvents)

                    return (
                        <>
                            <StartOfDay day={startOfDay} />
                            <ActivityInCard 
                                {...item}
                                cardPerspective={'event-organizer'}
                                fullAccountabilityPartners={fullFriends}
                                allEvents={allUserEvents}
                                fullCurrentUser={fullCurrentUser}
                            />
                        </>
                    )
                }}
            />

            {
                showScheduleActivityCard &&
                    <View
                        style={{
                            backgroundColor: 'white',
                            width: windowWidth*0.95,
                            borderRadius: 24,
                            paddingHorizontal: 36,
                            paddingTop: 24,
                            paddingBottom: 24,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            marginVertical: 12
                        }}
                    >

                    <IconButton 
                        icon="window-close" 
                        size={18} 
                        style={{
                            backgroundColor: 'transparent', 
                            position: 'absolute',
                            left: 6,
                            top: 6,
                            zIndex: 1
                        }} 
                        color={theme.colors.text} 
                        onPress={() => setShowScheduleActivityCard(false)}
                    />
                        
                        <Text>
                            {
                                feedUserEvents.length === 0 &&
                                    scheduleActivityText
                            }
                        </Text>

                        {
                            scheduleActivityButton &&
                                <Button
                                    onPress={() => navigateToCalendarScreen()}
                                    title="Schedule an activity"
                                    color={theme.colors.accent}
                                />
                        }


                    </View>
            }
        </>
    )
}