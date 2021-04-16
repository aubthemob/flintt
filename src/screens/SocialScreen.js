import React, { useEffect, useState, useRef } from 'react'
import { Alert, View, Text, StyleSheet, RefreshControl, LayoutAnimation, UIManager, FlatList, TouchableOpacity } from 'react-native'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Components
import EventMessage from '../components/EventMessage'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Lib
import dayjs from 'dayjs' 
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
import * as firebase from 'firebase'
// import { GIPHY_API_KEY } from 'react-native-dotenv'

// Services
import { getUpcomingFriendsEventsService, getRecentFriendsEventsService, getFriendsEventsService } from '../services/events'
import { getFriendService } from '../services/users'

// Styles
import { Button, List, TextInput, Divider, Avatar, TouchableRipple, Snackbar } from 'react-native-paper'
import theme from '../styles/theme'
import { subtitleText, fullScreenFormField } from '../styles/styles'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'

// Utils
import { ACTIVITIES } from '../utils/activities'
import { windowHeight } from '../utils/dimensions'

export default function SocialScreen({ type }) {

    const [events, setEvents] = useState([])
    const [now, setNow] = useState(dayjs())
    const [loading, setLoading] = useState(true)
    const [snackbarVisible, setSnackbarVisible] = useState(false)

    const { user } = useUserState()

    useEffect(() => {
        getFriendsEvents()
    }, [])

    const getFriendsEvents = async () => {
        try {
            const eventData = await getFriendsEventsService(user.uid, type)
            const friendData = await getFriendService(user.uid)
            const friendsEvents = eventData.map(d => {
                return ({
                    title: friendData.find(f => f.id === d.userId).displayName,
                    eventOrganizerId: friendData.find(f => f.id === d.userId).id,
                    key: d.id,
                    selected: false,
                    start: dayjs.unix(d.startDateTime.seconds),
                    activity: ACTIVITIES.find(a => a.key === d.activityId).title,
                    activityIcon: ACTIVITIES.find(a => a.key === d.activityId).icon,
                    avatar: friendData.find(f => f.id === d.userId).avatarUrl || null,
                    status: d.status
                })
            })
            setEvents(friendsEvents)
            setLoading(false)
        } catch(err) {
            Alert.alert(err.message)
            console.log(err)
        }
    }

    const handleEventPress = item => {
        LayoutAnimation.easeInEaseOut()
        setEvents(prevState => prevState.map(p => item === p ? { ...p, selected: !p.selected } : { ...p, selected: false } ))
    }

    const flatlistRef = useRef()

    return (
        <>
            <View style={{ flex: 1 }}>

                <KeyboardAwareFlatList 
                    enableOnAndroid={true}
                    data={events}
                    refreshControl={
                        <RefreshControl 
                            refreshing={loading} 
                            onRefresh={getFriendsEvents} 
                        />
                    }
                    ref={flatlistRef}
                    contentContainerStyle={{ overflow: 'visible' }}
                    ItemSeparatorComponent={() => <Divider />}
                    ListFooterComponent={() => events.length !== 0 && <Divider />}
                    keyboardShouldPersistTaps='always'
                    keyExtractor={item => item.key}
                    enableOnAndroid={true}
                    // ListEmptyComponent={<Text style={{ marginTop: 300, textAlign: 'center', fontFamily: 'Montserrat-Regular', color: theme.colors.text }}>Go bug your friends to do something healthy!</Text>}
                    renderItem={({ item }) => (
                        <>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => handleEventPress(item)}
                                >
                                    <List.Item
                                        title={item.title}
                                        titleStyle={{ fontFamily: 'Montserrat-Regular' }}
                                        descriptionStyle={{ fontFamily: 'Montserrat-Regular' }}
                                        description={item.activity}
                                        key={item.key}
                                        // onPress={handleEventPress}
                                        left={props => item.avatar && (
                                            <View style={{ alignSelf: 'center' }}>
                                                <Avatar.Image source={{ uri: item.avatar }} size={42}/>
                                            </View>
                                        )}
                                        right={props => (
                                            <>
                                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>

                                                    {
                                                        type === 'recent' &&
                                                        item.status === 'complete' &&
                                                        <Avatar.Icon icon={'check-circle'} color='green' size={42} style={{ backgroundColor: 'transparent' }}/> ||
                                                        item.status === 'failed' &&
                                                        <Avatar.Icon icon={'close-circle'} color='red' size={42} style={{ backgroundColor: 'transparent' }}/>
                                                    }

                                                    {item.activityIcon}

                                                    <Text
                                                        style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text }}
                                                    >{now.to(item.start)}</Text>

                                                    {
                                                        item.selected ?
                                                        <List.Icon icon="chevron-up"/> :
                                                        <List.Icon icon="chevron-down"/>
                                                    }
                                                    
                                                </View>
                                            </>
                                        )}
                                    />
                                </TouchableOpacity>
                            </View>
                            {
                                item.selected &&
                                <View style={{ backgroundColor: '#FAFAFA' }}>
                                    <Divider />
                                    <EventMessage 
                                        eventId={item.key}
                                        eventOrganizerId={item.eventOrganizerId}
                                        setSnackbarVisible={setSnackbarVisible}
                                        accountabilityPartnerId={user.uid}
                                    />
                                </View>
                            }
                        </>
                    )}
                />

                {
                    events.length === 0 &&
                    <Text style={{ flex: 1, paddingHorizontal: 36, textAlign: 'center', fontFamily: 'Montserrat-Regular', color: theme.colors.text }}>No activities here... bug your friends to go do something healthy! 😀</Text>
                }
                
                <Snackbar 
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={2000}
                    style={{ backgroundColor: '#404040' }}
                >
                    Your message must be between 1 & 60 characters.
                </Snackbar>

            </View>
        </>
    )
}

const styles = StyleSheet.create({
    subtitleText,
    fullScreenFormField
})