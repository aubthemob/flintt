import React, { useEffect, useState, useRef } from 'react'
import { Alert, View, Text, StyleSheet, RefreshControl, LayoutAnimation, UIManager, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import { useLinkTo } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { ScrollView, FlatList } from 'react-native-gesture-handler'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRoute } from '@react-navigation/native'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Analytics
import { addFriendButtonEvent, chatButtonPressEvent } from '../utils/analyticsEvents'

// Components
import AddFriendModal from '../components/AddFriendModal'
import FeedCard from '../components/FeedCard'
import ChatActionButton from '../components/ChatActionButton'
import MyActivities from '../components/MyActivities'
import SupportersActivities from '../components/SupportersActivities'
import Learn from '../components/Learn'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Libs
import Swiper from 'react-native-deck-swiper';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import firestore from '@react-native-firebase/firestore'
import groupBy from 'lodash/groupBy'
import dayjs from 'dayjs'
import * as firebase from 'firebase'
import { db } from '../lib/firebase'
import Modal from 'react-native-modal'
// import ContentLoader, { FacebookLoader, InstagramLoader } from 'react-native-easy-content-loader'
import { PulseIndicator } from 'react-native-indicators'


// Services
import { getUsersEventsService, setCardVisibleFalse, getApEventsService } from '../services/cards'
import { getSingleUser, getFriendService } from '../services/users'

// Styles
import { Button, Snackbar, Avatar, IconButton, ActivityIndicator, Badge } from 'react-native-paper'
import theme from '../styles/theme'
import { bodyText, fullScreenButtonLabelStyle, subtitleText, timePickerText } from '../styles/styles'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'
import { POPULAR_ACTIVITIES } from '../utils/activities'
import UxGuidePopup from '../components/UxGuidePopup'
import { handleShare } from '../utils/sharing'
import { handleWeirdUrl } from '../utils/links'

// --- End of imports ---

export const FeedContext = React.createContext()

export default function FeedScreen({ navigation }) {
    const [loading, setLoading] = useState(true)
    
    const [fullAllUsers, setFullAllUsers] = useState([])
    const [fullCurrentUser, setFullCurrentUser] = useState({})
    const [fullFriends, setFullFriends] = useState([])

    const [cards, setCards] = useState([])

    const [allUserEvents, setAllUserEvents] = useState(null)
    const [feedUserEvents, setFeedUserEvents] = useState(null)

    const [allApEvents, setAllApEvents] = useState(null)
    const [feedApEvents, setFeedApEvents] = useState(null)

    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    const [loaderOne, setLoaderOne] = useState(true)
    const [loaderTwo, setLoaderTwo] = useState(true)
    const [loaderThree, setLoaderThree] = useState(true)
    const [loaderFour, setLoaderFour] = useState(true)
    
    const { user } = useUserState()
    const route = useRoute()
    
    const [popupIsVisible, setPopupIsVisible] = useState(false)

    const [showScheduleActivityCard, setShowScheduleActivityCard] = useState(false)
    const [showAddSupportersCard, setShowAddSupportersCard] = useState(false)

    const now = new firebase.firestore.Timestamp.now().toDate()
    const startOfToday = dayjs(now).startOf('day').toDate()
    const lastNightAtEight = dayjs(now).startOf('day').subtract(4, 'h').toDate()
    const startOfTomorrow = dayjs(now).add(1, 'day').startOf('day').toDate()

    // Add friend button in header bar
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
                    // addFriendButtonEvent(route.name)
                    handleShare('add-friend', user.uid, user.displayName)
                }}
                animated={true}
                mode='contained'
            />
          ),
        });
    }, [navigation])

    useEffect(() => {
        if (!loaderOne && !loaderTwo && !loaderThree && !loaderFour) {
            setLoading(false)
        }
    }, [loaderOne, loaderTwo, loaderThree, loaderFour])

    useEffect(() => {
        if (feedUserEvents && feedUserEvents.length === 0) {
            setShowScheduleActivityCard(true)
        } else if (feedUserEvents && feedUserEvents.length !== 0) {
            setShowScheduleActivityCard(false)
        }
        if (fullFriends.length === 0) {
            setShowAddSupportersCard(true)
        } else if (fullFriends.length !== 0) {
            setShowAddSupportersCard(false)
        }
    }, [feedUserEvents, fullFriends])

    // get full current user and put into state
    useEffect(() => {

        const unsubscribeUser = db.collection('users').doc(user.uid).onSnapshot(snapshot => {

            const data = snapshot.data()
            const id = snapshot.id

            const newFullUser = { id, ...data }
            setFullCurrentUser(newFullUser)
            setLoaderOne(false)
        })

        return unsubscribeUser

    }, [])

    useEffect(() => {
        mergeUserData()
    }, [fullCurrentUser])

    const mergeUserData = async () => {
        setLoading(true)
        const newFullFriends = await getFriendService(user.uid) || []

        setFullFriends(newFullFriends)
        setLoaderTwo(false)
    }
    

    useEffect(() => {

        setLoading(true)

        const unsubscribeUsers = db.collection(`users`).doc(user.uid).collection('events')
            .orderBy('startDateTime')
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(d => ({
                    ...d.data(),
                    startDateTime: dayjs.unix(d.data().startDateTime.seconds),
                    endDateTime: dayjs.unix(d.data().endDateTime.seconds),
                    eventId: d.id
                }))

                setAllUserEvents(data)
                const newFeedUserEvents = data.filter(d => d.startDateTime < startOfTomorrow && d.startDateTime >= lastNightAtEight)
                setFeedUserEvents(newFeedUserEvents)
                setLoaderThree(false)
            })


        return unsubscribeUsers
    }, [])

    useEffect(() => {

        setLoading(true)

        if (Object.keys(fullCurrentUser).length > 0) {
            const unsubscribeAps = db.collectionGroup(`events`)
                .where('accountabilityPartners', 'array-contains', user.uid)
                .orderBy('startDateTime')
                .onSnapshot(snapshot => {
                    const data = snapshot.docs.map(d => ({
                        ...d.data(),
                        startDateTime: dayjs.unix(d.data().startDateTime.seconds),
                        endDateTime: dayjs.unix(d.data().endDateTime.seconds),
                        eventId: d.id
                    }))
    
                    const groupedData = groupBy(data, 'userId')
    
                    const friendsWithEvents = Object.keys(groupedData)

                    const allFriends = fullCurrentUser.friends
                    
                    const friendsWithNoEvents = allFriends.filter(a => !friendsWithEvents.includes(a))

                    friendsWithNoEvents.forEach(f => {
                        groupedData[f] = []
                    })
    
                    setAllApEvents(groupedData)
    
                    const newFeedApEvents = {}
    
                    for (const [key, value] of Object.entries(groupedData)) {
                        const filteredValue = value.filter(v => v.startDateTime < startOfTomorrow && v.startDateTime >= lastNightAtEight)
                        newFeedApEvents[key] = filteredValue
    
                    }
    
                    setFeedApEvents(newFeedApEvents)
                    setLoaderFour(false)
                })
            

            return unsubscribeAps
        }

    }, [fullCurrentUser])

    const navigateToCalendarScreen = () => {
        navigation.navigate('Calendar')
    }

    const navigateToFriendsProfile = params => {
        navigation.navigate('FriendProfile', params)
    }

    const navigateToChat = (friendId, allUserEvents, allApEvents, selectedActivity, setSelectedActivity) => {
        navigation.navigate('Chat', { 
            chatPartnerId: friendId,
            allUserEvents,
            allApEvents,
            selectedActivity,
            setSelectedActivity
        })
    }

    const feedContextValue = {
        setSnackbarMessage,
        setSnackbarVisible,
    }
        
    return (
            <>
            
            <SafeAreaView style={{ flex: 1 }}>
                <FeedContext.Provider value={feedContextValue}>

                    {
                        loading ? 
                            <PulseIndicator 
                                color={theme.colors.primary}
                                size={120}
                            />
                            :
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    // refreshControl={
                                    //     <RefreshControl 
                                    //         refreshing={loading}
                                    //         onRefresh={() => {
                                    //             setTimeout(() => {
                                    //                 setCards([])
                                    //                 setSwipedAll(false)
                                    //                 getCards()
                                    //             }, 300)
                                    //         }} 
                                    //     />
                                    // }
                                >
                                    <View>
                                        {
                                            Object.keys(fullCurrentUser).length > 0 && allUserEvents && allApEvents && feedApEvents && feedUserEvents &&
                                                <Text>
                                                    Me
                                                </Text>
                                        }
                                        {
                                            Object.keys(fullCurrentUser).length > 0 && allUserEvents && allApEvents && feedApEvents && feedUserEvents &&
                                                <MyActivities 
                                                    allUserEvents={allUserEvents}
                                                    feedUserEvents={feedUserEvents}
                                                    fullCurrentUser={fullCurrentUser}
                                                    fullFriends={fullFriends}
                                                    navigateToCalendarScreen={navigateToCalendarScreen}
                                                    showScheduleActivityCard={showScheduleActivityCard}
                                                    setShowScheduleActivityCard={setShowScheduleActivityCard}
                                                />
                                        }
                                        {
                                            Object.keys(fullCurrentUser).length > 0 && allUserEvents && allApEvents && feedApEvents && feedUserEvents &&
                                                <Text>
                                                    My supporters
                                                </Text>
                                        }
                                        {
                                            Object.keys(fullCurrentUser).length > 0 && allUserEvents && allApEvents && feedApEvents && feedUserEvents && fullFriends &&
                                                <SupportersActivities 
                                                    allApEvents={allApEvents}
                                                    feedApEvents={feedApEvents}
                                                    navigateToFriendsProfile={navigateToFriendsProfile}
                                                    fullFriends={fullFriends}
                                                    fullCurrentUser={fullCurrentUser}
                                                    showAddSupportersCard={showAddSupportersCard}
                                                    setShowAddSupportersCard={setShowAddSupportersCard}
                                                    navigateToChat={navigateToChat}
                                                    allUserEvents={allUserEvents}
                                                />
                                        }
                                        {
                                            Object.keys(fullCurrentUser).length > 0 && fullCurrentUser.friends.length === 0 &&
                                                feedUserEvents && feedUserEvents.length === 0 && !showScheduleActivityCard &&
                                                    <View
                                                        style={{
                                                            justifyContent: 'center',
                                                            flex: 0
                                                        }}
                                                    >
                                                        <Image 
                                                            source={require('./images/undraw_Celebrating_re_fsbq_mod.png')}
                                                            resizeMode='center'
                                                            style={{ maxHeight: windowHeight/4, maxWidth: windowWidth/2, alignSelf: 'center', marginBottom: 0 }}
                                                        />
                
                                                        <Text style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text, fontSize: 16, alignSelf: 'center', padding: 12, textAlign: 'center' }}>This is where you and your supporters will track and share each others' activities!</Text>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                            <Text style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text, fontSize: 16 }}>Start by</Text>
                                                            <TouchableOpacity onPress={() => navigateToCalendarScreen()}>
                                                                <Text style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.accent, fontSize: 16 }}> scheduling an activity.</Text>
                                                            </TouchableOpacity>
                                                        </View> 
                                                    </View>
                                        }
                                        {/* <Text>
                                            Learn
                                        </Text>
                                        <Learn /> */}
                                    </View>
                                </ScrollView>

                    }

                    <AddFriendModal 
                        isVisible={popupIsVisible}
                        close={setPopupIsVisible}
                        user={user}
                        type={'global'}
                        screenSnackbarVisible={snackbarVisible}
                        setScreenSnackbarVisible={setSnackbarVisible}
                        screenSnackbarMessage={snackbarMessage}
                        setScreenSnackbarMessage={setSnackbarMessage}
                        // hideModalContentWhileAnimating={true}
                        // getFriends={getFriends}
                    />
    
                    {/* {
                        cards.length !== 0 && !fullCurrentUser.hasEvents &&
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 60,
                                    zIndex: 1,
                                    // left: 100,
                                    alignSelf: 'flex-end', 
                                    maxWidth: windowWidth/1.25
                                }}
                            >
                                <UxGuidePopup 
                                    type='schedule-activity-to-get-started'
                                    navigateToCalendarScreen={navigateToCalendarScreen}
                                />
    
                            </View>
                    } */}
    
                    <ChatActionButton 
                        fullFriends={fullFriends}
                        navigation={navigation}
                        fullCurrentUser={fullCurrentUser}
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarVisible={setSnackbarVisible}
                        allUserEvents={allUserEvents}
                        allApEvents={allApEvents}
                    />
    
                    <Snackbar 
                        visible={snackbarVisible}
                        onDismiss={() => setSnackbarVisible(false)}
                        duration={3000}
                        style={{ backgroundColor: '#404040' }}
                    >
                        {snackbarMessage}
                    </Snackbar>
                    
                </FeedContext.Provider>
            </SafeAreaView>
            </>
        )

    }
// }

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    card: {
        flex: 1,
        width: windowWidth,
    },
    fullScreenButtonLabelStyle
})