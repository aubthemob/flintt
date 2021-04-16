import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native'

// Components
import CardChat from './CardChat'
import EventTrackerCard from './EventTrackerCard'
import AccountabilityPartnerChatSwiper from './AccountabilityPartnerChatSwiper'

// Contexts 
import { useUserState } from '../contexts/UserAuthContext'
import { useNavigation } from '@react-navigation/native'

import Modal from 'react-native-modal'
import dayjs from 'dayjs'
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)

// Services
import { getCertainUsers } from '../services/users'

// Styles
import { Card, Divider, Button, Avatar, IconButton, Snackbar } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'

export default function FeedCard(props) {

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

    const { user } = useUserState()
    const [now] = useState(dayjs())
    const [eventTime, setEventTime] = useState('')

    const [cardPerspective, setCardPerspective] = useState('')
    const [cardContentType, setCardContentType] = useState('chat')

    const [fullAccountabilityPartners, setFullAccountabilityPartners] = useState([])
    const [fullEventOrganizer, setFullEventOrganizer] = useState({})
    const [currentChatPartner, setCurrentChatPartner] = useState( accountabilityPartners.length > 0 ? (eventOrganizerId === user.uid ? accountabilityPartners[0] : eventOrganizerId) : '' )
    // const [fullUser, setFullUser] = useState(null)
    
    const navigation = useNavigation()
    
    useEffect(() => {
        if (now < startDateTime) {
            setEventTime('future')
        } else if (startDateTime < now && now < endDateTime) {
            setEventTime('ongoing')
        } else if (endDateTime < now || status === 'complete' || status === 'failed') {
            setEventTime('past')
        }
    }, [startDateTime, endDateTime, now])

    useEffect(() => {
        if (eventOrganizerId === user.uid) {
            setCardPerspective('event-organizer')
        } else {
            setCardPerspective('accountability-partner')
        }
        mergeUserData()
    }, [])

    const mergeUserData = async () => {
        const data = await getCertainUsers([...accountabilityPartners, eventOrganizerId])

        const newEventOrganizer = data.find(d => d.id === eventOrganizerId)
        setFullEventOrganizer(newEventOrganizer)
        
        const newAccountabilityPartners = data.filter(d => d.id !== eventOrganizerId)
        setFullAccountabilityPartners(newAccountabilityPartners)
    }
    
    return (
        <>
            <View style={{ flex: 1, alignContent: 'center', alignItems: 'center', marginVertical: 12 }}>
                    <Card 
                        style={{ width: windowWidth*0.96 }}
                        elevation={2}
                    >
                        <Card.Title 
                            title={
                                eventTime === 'future' &&
                                `${displayName}'s upcoming activity` ||
                                eventTime === 'ongoing' &&
                                `${displayName}'s ongoing activity` ||
                                eventTime === 'past' &&
                                `${displayName}'s recent activity`
                            }
                            subtitle={
                                `${simple} ${dayjs(startDateTime).calendar().toLowerCase()}`
                            }
                            left={props => <Avatar.Image size={36} source={{ uri: eventOrganizerId.avatarUrl }} />}
                        />

                        <Divider />
                        
                        <Card.Content style={{ marginVertical: 12 }}>

                            {
                                eventTime === 'past' &&
                                    <Image /> // success image
                            }

                            {
                                ( eventTime === 'ongoing' && cardPerspective === 'event-organizer' ) ||
                                // ( eventTime === 'past' && cardPerspective === 'event-organizer' && status === 'postponed' ) ||
                                ( eventTime === 'past' && cardPerspective === 'event-organizer' && status === 'scheduled' ) &&
                                    <>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#CBCBCB', marginHorizontal: 56, borderRadius: 48, marginBottom: 12 }}>

                                            <TouchableOpacity onPress={() => setCardContentType('tracking')}>
                                                <View style={cardContentType === 'tracking' ? styles.trackerButtonSelectedContainer : styles.trackerButtonContainer}>
                                                    <Text style={cardContentType === 'tracking' ? styles.trackerButtonSelected : styles.trackerButton}>Status</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => setCardContentType('chat')}>
                                                <View style={cardContentType === 'chat' ? styles.trackerButtonSelectedContainer : styles.trackerButtonContainer}>
                                                    <Text style={cardContentType === 'chat' ? styles.trackerButtonSelected : styles.trackerButton}>Chat</Text>
                                                </View>
                                            </TouchableOpacity>

                                        </View>
                                    </>
                            }

                            {
                                cardContentType === 'chat' && cardPerspective === 'event-organizer' && fullAccountabilityPartners.length > 0 &&
                                    <AccountabilityPartnerChatSwiper 
                                        fullAccountabilityPartners={fullAccountabilityPartners}
                                        setCurrentChatPartner={setCurrentChatPartner}
                                        currentChatPartner={currentChatPartner}
                                        eventOrganizerId={eventOrganizerId}
                                        eventId={eventId}
                                    />
                            }
                            
                            {
                                cardContentType === 'chat' && cardPerspective === 'accountability-partner' &&
                                    <CardChat 
                                        cardPerspective={cardPerspective}
                                        currentChatPartner={currentChatPartner}
                                        eventOrganizerId={eventOrganizerId}
                                        eventId={eventId}
                                    />
                            }

                            {
                                cardContentType === 'tracking' &&
                                    <EventTrackerCard {...props} />
                            }

                        </Card.Content>
                        
                        {
                            cardContentType === 'chat' &&
                            <Divider />
                            
                        }

                        <Card.Actions style={{ justifyContent: 'center' }}>
                            {
                                cardContentType === 'chat' &&
                                    <TouchableOpacity 
                                        style={{ 
                                            flexDirection: 'row', 
                                            alignItems: 'center' 
                                        }} 
                                        onPress={() => navigation.navigate('Chat', { 
                                            cardPerspective, 
                                            currentChatPartner, 
                                            eventId, 
                                            eventOrganizerId, 
                                            simple, 
                                            startDateTime: startDateTime.toJSON(), 
                                            fullAccountabilityPartners, 
                                            fullEventOrganizer 
                                        })}
                                    >
                                        <Avatar.Icon size={36} icon='comment' style={{ backgroundColor: 'transparent' }} color={theme.colors.text} />
                                        <Text style={styles.textButton}>Comment</Text>
                                    </TouchableOpacity>
                            }
                        </Card.Actions>
                    </Card>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    textButton: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: theme.colors.text
    },
    trackerButton: {
        color: theme.colors.text
    },
    trackerButtonSelected: {
        color: 'white'
    },
    trackerButtonSelectedContainer: { 
        backgroundColor: '#6BA8AF', 
        borderRadius: 48, 
        paddingVertical: 12, 
        paddingHorizontal: 48 
    },
    trackerButtonContainer: { 
        paddingVertical: 12, 
        paddingHorizontal: 42
    },
})