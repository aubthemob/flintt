import React, { useEffect, useState, useRef } from 'react'
import { Alert, View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, SafeAreaView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import * as Linking from 'expo-linking';

import dayjs from 'dayjs'

// Analytics
import { addFriendButtonEvent, changePhotoButtonPressEvent } from '../utils/analyticsEvents'

// Components
import AddFriendModal from '../components/AddFriendModal'
import ThisWeekStats from '../components/ThisWeekStats'
import AllTimeStats from '../components/AllTimeStats'
import FriendsListModal from '../components/FriendsListModal'
import Successes from '../components/Successes'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Lib
import * as firebase from 'firebase'
import { db } from '../lib/firebase'
import { useRoute } from '@react-navigation/native'
import Modal from 'react-native-modal'
import { PulseIndicator } from 'react-native-indicators'
const groupBy = require('lodash.groupby')
const uniq = require('lodash.uniq')
const countBy = require('lodash.countby') 


// Services
import { setAvatarUrl } from '../services/users'
import { getFriendService } from '../services/users'
import { getSingleUser, addFriendService } from '../services/users'

// Styles
import { Button, List, TextInput, Divider, Avatar, IconButton, ActivityIndicator, Snackbar } from 'react-native-paper'
import theme from '../styles/theme'
import backgroundTheme from '../styles/backgroundTheme'

// Utils
import { windowHeight, windowWidth } from '../utils/dimensions'
import { handleShare } from '../utils/sharing'

export default function ProfileScreen({ navigation }) {
    
    const [imageUrl, setImageUrl] = useState(null)
    const [fullFriends, setFullFriends] = useState([])
    const [friendIds, setFriendIds] = useState([])
    const [addFriendModalIsVisible, setAddFriendModalIsVisible] = useState(false)
    
    const [loading, setLoading] = useState(true)
    const [loadingOne, setLoadingOne] = useState(true)
    const [loadingTwo, setLoadingTwo] = useState(true)
    const [loadingThree, setLoadingThree] = useState(true)
    const [loadingFour, setLoadingFour] = useState(true)
    const [loadingFive, setLoadingFive] = useState(true)
    const [loadingSix, setLoadingSix] = useState(true)
    
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState(false)
    
    // const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false)
    
    const [friendModalVisible, setFriendModalVisible] = useState(false)
    const [fullUser, setFullUser] = useState('')

    const [tabSelected, setTabSelected] = useState('stats')

    // all time stats state
    const [totalsData, setTotalsData] = useState({
        exercise: [],
        nutrition: [],
        mindfulness: [],
        sleep: [],
    })
    const [completionRateData, setCompletionRateData] = useState({
        exercise: [],
        nutrition: [],
        mindfulness: [],
        sleep: [],
    })

    const [upperBound, setUpperBound] = useState({
        exercise: 5,
        nutrition: 5,
        mindfulness: 5,
        sleep: 5,
    })

    // thisweekstats state
    const [weeklyCompletionRate, setWeeklyCompletionRate] = useState([])

    // success state
    const [completeEvents, setCompleteEvents] = useState([])
    const [allEvents, setAllEvents] = useState([])
    
    const { user } = useUserState()
    const route = useRoute()
    const scrollRef = useRef()
    
    const [perspective, setPerspective] = useState(route.params === undefined ? 'current-user' : 'friend')
    const [profileUserId, setProfileUserId] = useState(perspective === 'current-user' ? user.uid : route.params.userId)

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
                    handleShare('add-friend', user.uid, user.displayName)
                    addFriendButtonEvent(route.name)
                }}
                animated={true}
                mode='contained'
            />
          ),
        });
    }, [navigation])

    React.useLayoutEffect(() => {
        navigation.setOptions({
          headerLeft: () => (
            <IconButton 
                icon="cog" 
                color={theme.colors.text}
                style={{ 
                    marginHorizontal: 12,
                }}
                onPress={() => {
                    navigation.navigate('SettingsScreen')
                }}
                animated={true}
                mode='contained'
            />
          ),
        });
    }, [navigation])

    useEffect(() => {
        if (!loadingOne && !loadingTwo && !loadingThree && !loadingFour && !loadingFive && !loadingSix) {
            setLoading(false)
        }
    }, [loadingOne, loadingTwo, loadingThree, loadingFour, loadingFive, loadingSix])

    useEffect(() => {
        setLoading(true)
        getFullFriends()
        setLoadingOne(false)
    }, [friendIds])

    // realtime listener to get friends
    useEffect(() => {
        setLoading(true)
        const unsubscribe = db.collection('users').doc(profileUserId)
            .onSnapshot(snapshot => {
                const newFriends = snapshot.data().friends
                setFriendIds(newFriends)
                setLoadingTwo(false)
            })
            
        return unsubscribe

    }, [perspective])

    useEffect(() => {
        setLoading(true)
        getUser(profileUserId)
        setLoadingThree(false)
    }, [perspective])
    
    useEffect(() => {
        const photoUrl = perspective === 'current-user' ? user.photoURL : fullUser.avatarUrl
        setImageUrl(photoUrl)
    }, [fullUser])

    // thisweekstats useeffect
    useEffect(() => {

        setLoading(true)
        
        const unsubscribe = db.collection('users').doc(profileUserId)
            .collection('events')
            .where('startDateTime', '<=', startOfNextWeek)
            .where('startDateTime', '>', startOfThisWeek)
            .onSnapshot(snapshot => {
                const rawEvents = snapshot.docs.map(s => ({
                        // activity: s.data().activity,
                        habit: s.data().habit,
                        status: s.data().status
                    }))

                const totalsObj = countBy(rawEvents.map(l => l.habit))
                const completesObj = countBy(rawEvents.filter(l => l.status === 'complete').map(l => l.habit))
            
                const newWeeklyCompletionRate = {}
                // let newTotalsArr = []
                // let newCompletesArr = []
            
                for (const [key, value] of Object.entries(totalsObj)) {

                    newWeeklyCompletionRate[key] = (completesObj[key]/value)*100 || 5 // 5 is a small amount to show progress

                }

                setWeeklyCompletionRate(newWeeklyCompletionRate)

                setLoadingFour(false)
                
            })
        
        return unsubscribe

    }, [])

    // alltimestats useeffect
    const startOfNextWeekInMillis = +dayjs().subtract(1, 'd').endOf('week').add(1, 'd')
    const startOfNextWeek = new firebase.firestore.Timestamp.fromMillis(startOfNextWeekInMillis)

    const startOfThisWeekInMillis = +dayjs().subtract(1, 'd').startOf('week').add(1, 'd')
    const startOfThisWeek = new firebase.firestore.Timestamp.fromMillis(startOfThisWeekInMillis)

    useEffect(() => {

        setLoading(true)
        const unsubscribe = db.collection('users').doc(profileUserId)
            .collection('events')
            .where('startDateTime', '<', startOfNextWeek)
            .onSnapshot(snapshot => {
                const rawEvents = snapshot.docs.map(s => ({
                        habit: s.data().habit,
                        status: s.data().status,
                        startDateTime: s.data().startDateTime,
                        endDateTime: s.data().endDateTime
                    }))

                const eventsWithWeek = rawEvents.map(r => {
                    const startInDayjs = dayjs.unix(r.startDateTime.seconds)
                    const weekStart = startInDayjs.subtract(1, 'd').startOf('week').add(1, 'd').unix()
                    r.weekStart = weekStart
                    return r
                })

                const thisWeekStart = startOfThisWeekInMillis/1000
                
                const eventsGroupedByHabit = groupBy(eventsWithWeek, 'habit')

                const completionRatesByHabit = {}
                const totalsByHabit = {}

                let earliestEventDayStart
                let earliestEventWeekStart
            
                for (const [key, value] of Object.entries(eventsGroupedByHabit)) {

                    const eventsSortedByWeek = value.map(e => e.weekStart).sort()
                    earliestEventWeekStart = eventsSortedByWeek[0]

                    const oneWeekInSeconds = 60*60*24*7

                    const totalCompleted = []
                    const completionRates = []

                    const runningTotalsObj = {}

                    const daysSinceFirstEvent = dayjs().diff(dayjs.unix(earliestEventWeekStart), 'day')
                    
                    for (let weekStart = earliestEventWeekStart; weekStart <= thisWeekStart; weekStart += oneWeekInSeconds) {
                        const nextWeekStart = weekStart + oneWeekInSeconds
                        const eventsThisWeek = value.filter(v => v.startDateTime.seconds > weekStart && v.endDateTime.seconds < nextWeekStart)
                        
                        const weekName = dayjs.unix(weekStart).format('MMM D')
                        
                        const eventsCompletedThisWeek = eventsThisWeek.filter(e => e.status === 'complete')
                        const totalEventsCompletedThisWeek = eventsCompletedThisWeek.length
                        
                        const totalEventsScheduledThisWeek = eventsThisWeek.length
                        const completionRateOfEventsThisWeek = totalEventsCompletedThisWeek/totalEventsScheduledThisWeek || 0

                        const completionRateObj = { 'Completion rate': completionRateOfEventsThisWeek, 'Week': weekName }
                        completionRates.push(completionRateObj)

                        if (daysSinceFirstEvent <= 6 && totalEventsCompletedThisWeek !== 0) {

                            // loop through events completed this week and create objects for each one
                            const valueWithDayStart = value.map(v => ({
                                ...v,
                                dayStart: dayjs.unix(v.startDateTime.seconds).startOf('day').unix()
                            }))

                            const eventsSortedByDay = valueWithDayStart.map(e => e.dayStart).sort()
                            earliestEventDayStart = eventsSortedByDay[0]

                            const todayStart = dayjs().startOf('day').unix()
                            const oneDayInSeconds = 60*60*24
                            
                            // do the exact same loop as per week but per day
                            
                            for (let dayStart = earliestEventDayStart; dayStart <= todayStart; dayStart += oneDayInSeconds) {
                                const nextDayStart = dayStart + oneDayInSeconds
                                const eventsThisDay = value.filter(v => v.startDateTime.seconds > dayStart && v.endDateTime.seconds < nextDayStart)

                                const dayName = dayjs.unix(dayStart).format('ddd DD')
                                
                                const eventsCompletedThisDay = eventsThisDay.filter(e => e.status === 'complete')
                                const totalEventsCompletedThisDay = eventsCompletedThisDay.length

                                runningTotalsObj[key] = runningTotalsObj[key] + totalEventsCompletedThisDay || totalEventsCompletedThisDay
                                const cumulativeTotalObj = { 'Total': runningTotalsObj[key], 'Day': dayName }
                                totalCompleted.push(cumulativeTotalObj)

                            }

                        } else {
                            runningTotalsObj[key] = runningTotalsObj[key] + totalEventsCompletedThisWeek || totalEventsCompletedThisWeek
                            const cumulativeTotalObj = { 'Total': runningTotalsObj[key], 'Week': weekName }
                            totalCompleted.push(cumulativeTotalObj)
                        }

                    }

                    const oneDayEarlierThanFirstEventDayStartFormatted = dayjs.unix(earliestEventDayStart).subtract(1, 'd').format('ddd DD')
                    const oneWeekEarlierThanFirstEventWeekStartFormatted = dayjs.unix(earliestEventWeekStart).subtract(1, 'w').format('MMM D')
                    
                    completionRatesByHabit[key] = completionRates.length > 8 ? completionRates.slice(completionRates.length-7, completionRates.length+1) : completionRates // max 8 weeks, else the axis ticks overlap
                    totalsByHabit[key] = totalCompleted.length > 0 && totalCompleted.length <= 8 ?
                        Object.keys(totalCompleted[0]).includes('Day') ? 
                            [{ 'Day': oneDayEarlierThanFirstEventDayStartFormatted, 'Total': 0 }, ...totalCompleted] :
                            [{ 'Week': oneWeekEarlierThanFirstEventWeekStartFormatted, 'Total': 0 }, ...totalCompleted]
                            :
                            Object.keys(totalCompleted[0]).includes('Day') ? 
                            [{ 'Day': oneDayEarlierThanFirstEventDayStartFormatted, 'Total': 0 }, ...totalCompleted].slice(totalCompleted.length-7, totalCompleted.length+1) :
                            [{ 'Week': oneWeekEarlierThanFirstEventWeekStartFormatted, 'Total': 0 }, ...totalCompleted].slice(totalCompleted.length-7, totalCompleted.length+1)

                }

                const newUpperBounds = {}
                for (const [key, value] of Object.entries(totalsByHabit)) {

                    newUpperBounds[key] = value[value.length-1] ? 
                        Math.round(value[value.length-1]['Total']*1.25) > 5 ?
                        Math.round(value[value.length-1]['Total']*1.25) :
                        5 : 
                        5

                }
                
                setUpperBound(prevState => ({ ...prevState, ...newUpperBounds }))

                setTotalsData(prevState => ({ ...prevState, ...totalsByHabit }))
                setCompletionRateData(prevState => ({ ...prevState, ...completionRatesByHabit }))
                setLoadingFive(false)
                
            })
        
        return unsubscribe

    }, [])

    // success useEffect
    useEffect(() => {

        // setEventsLoading(true)
        if (perspective === 'current-user') {
            const unsubscribe = db.collection('users').doc(profileUserId)
                .collection('events')
                // .where('status', '==', 'complete')
                .orderBy("startDateTime", "desc")
                .onSnapshot(snapshot => {
                    const rawEvents = snapshot.docs.map(s => ({
                        eventId: s.id,
                        // startDateTime: dayjs(s.startDateTime.seconds),
                        // endDateTime: dayjs.unix(s.endDateTime.seconds),
                        ...s.data(),
                    }))
    
                    setAllEvents(rawEvents)

                    const newCompleteEvents = rawEvents.filter(r => r.status === 'complete')
    
                    setCompleteEvents(newCompleteEvents)
                    setLoadingSix(false)
                    
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
                        eventId: s.id,
                        // startDateTime: dayjs.unix(s.startDateTime.seconds),
                        // endDateTime: dayjs.unix(s.endDateTime.seconds),
                        ...s.data(),
                    }))
    
                    setAllEvents(rawEvents)

                    const newCompleteEvents = rawEvents.filter(r => r.status === 'complete')
    
                    setCompleteEvents(newCompleteEvents)
                    setLoadingSix(false)
                    
                })
            
            return unsubscribe
        }

    }, [])

    const getUser = async (userId) => {
        const newUser = await getSingleUser(userId)
        setFullUser(newUser)
    }

    const getFullFriends = async () => {
        const newFriends = await getFriendService(profileUserId)
        setFullFriends(newFriends)
    }

    const getPermissionAsync = async () => {
        if (Platform.OS !== 'web') {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
          }
        }
    }

    const pickImage = async () => {
        changePhotoButtonPressEvent(user.uid, friendIds)
        getPermissionAsync()
        let result = await ImagePicker.launchImageLibraryAsync()
        if (!result.cancelled) {
            const newAvatarUrl = await uploadImage(result.uri)
            setAvatarUrl(user.uid, newAvatarUrl)
            setImageUrl(newAvatarUrl)
        }
    }

    const uploadImage = async uri => {
        return new Promise(async (res, rej) => {

            const response = await fetch(uri)
            const blob = await response.blob()
            const ref = firebase.storage().ref().child(`avatars/${user.uid}/avatar`)
            
            const uploadTask = ref.put(blob)
            uploadTask.on('state_changed', snapshot => {}, () => {}, () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    res(downloadURL)
                })
            })
        })
    }

    const navigateToCalendarScreen = () => {
        navigation.navigate('Calendar')
    }

    const navigateToFriendsProfile = params => {
        navigation.navigate('FriendProfile', params)
    }

    return (
        <>
        <SafeAreaView style={{ flex: 1 }}>

                {
                    loading ? 
                        <View
                            style={{
                                flex: 1,
                                alignContent: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <PulseIndicator 
                                color={theme.colors.primary}
                                size={120}
                            /> 
                        </View>
                    :
                        <ScrollView 
                            contentContainerStyle={{ paddingHorizontal: 24, marginBottom: 12 }}
                            showsVerticalScrollIndicator={false}
                            ref={scrollRef}
                        >
                            <>
                                <View style={{ flexDirection: 'row', marginTop: 36, alignItems: 'center' }}>
                                {
                                    <>
                                        <Avatar.Image size={128} source={{ uri: imageUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} /> 
                                        {
                                            perspective === 'current-user' &&
                                                <IconButton 
                                                    icon={'pencil'} 
                                                    style={{ 
                                                        alignSelf: 'flex-end', 
                                                        marginTop: -24, 
                                                        marginLeft: -36, 
                                                        backgroundColor: 'white', 
                                                        shadowColor: "#000",
                                                        shadowOffset: {
                                                            width: 0,
                                                            height: 2,
                                                        },
                                                        shadowOpacity: 0.23,
                                                        shadowRadius: 2.62,
                                                        elevation: 4, 
                                                        borderWidth: 1,
                                                        borderColor: '#EAEAEA'
                                                    }} 
                                                    color={theme.colors.accent}
                                                    size={24}
                                                    onPress={pickImage}
                                                />
                                        }

                                    </>
                                }
                                
                                <View
                                    style={{
                                        // flex: 1, 
                                        marginLeft: 24,
                                        // backgroundColor: 'blue',
                                        justifyContent: 'center',
                                        // marginTop: '0%' // this is wrong, but justifyContent is not working so fuck it
                                    }}
                                >
                                    <View style={{ flexShrink: 1 }}>
                                        <Text style={{ 
                                            fontFamily: 'Ubuntu-Medium', 
                                            fontSize: 24, 
                                            color: theme.colors.text,
                                        }}
                                        >
                                            {fullUser.displayName}
                                        </Text> 

                                    </View>

                                    {
                                        perspective === 'current-user' &&
                                            <TouchableWithoutFeedback
                                                onPress={() => {
                                                    if (fullFriends.length > 0) {
                                                        setFriendModalVisible(true)
                                                    } else {
                                                        handleShare('add-friend', user.uid, user.displayName)
                                                    }
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        marginTop: 12
                                                    }}
                                                >
                                                    <FlatList 
                                                        data={fullFriends}
                                                        horizontal
                                                        listKey={(item, index) => `${item.id}${index}`}
                                                        keyExtractor={(item, index) => `${item.id}${index}`}
                                                        scrollEnabled={false}
                                                        contentContainerStyle={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            paddingRight: 12
                                                        }}
                                                        renderItem={({ item, index }) => {
                                                            if (index === 0) {
                                                                return (
                                                                    <Avatar.Image source={{ uri: item.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} size={32} style={{ justifyContent: 'center'}} />
                                                                )
                                                            } else if (index === 1) {
                                                                return (
                                                                    <Avatar.Image source={{ uri: item.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} size={32} style={{ justifyContent: 'center', marginLeft:-15 }} />
                                                                )
                                                            } else if (index === 2) {
                                                                return (
                                                                    <Avatar.Icon icon='dots-horizontal' size={18} style={{ marginLeft:-8, backgroundColor: '#A0A0A0', padding: 0, }} color={'white'} />
                                                                )
                                                            } else {
                                                                return (
                                                                    <>
                                                                    </>
                                                                )
                                                            }
                                                        }}
                                                        ListEmptyComponent={() => (
                                                            <IconButton 
                                                                icon='account-plus'
                                                                color={theme.colors.accent}
                                                                style={{
                                                                    marginLeft: -6,
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <Text
                                                        style={{
                                                            marginLeft: fullFriends.length === 0 ? -15 : 0,
                                                            fontFamily: 'Montserrat-Regular',
                                                            color: fullFriends.length === 0 ? theme.colors.accent : theme.colors.text,
                                                        }}
                                                    >
                                                        {
                                                            fullFriends.length === 0 && 'Add first friend' ||
                                                            fullFriends.length === 1 && `${fullFriends.length} friend` ||
                                                            `${fullFriends.length} friends`
                                                        }
                                                    
                                                    </Text>

                                                </View>
                                            </TouchableWithoutFeedback>
                                    }

                                    </View>
                            </View>
                        
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginVertical: 24
                                }}
                            >

                                <TouchableWithoutFeedback
                                    onPress={() => {
                                        scrollRef.current.scrollTo({
                                            y: 0,
                                            x: 0,
                                            animated: true
                                        })
                                        setTabSelected('stats')
                                    }}
                                >
                                    <View
                                        style={tabSelected === 'stats' ? styles.tabSelectedView : styles.tabUnselectedView}
                                    >
                                        <Text
                                            style={tabSelected === 'stats' ? styles.tabSelectedText : styles.tabUnselectedText}
                                        >
                                            Stats
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>

                                <TouchableWithoutFeedback
                                    onPress={() => {
                                        scrollRef.current.scrollTo({
                                            y: 0,
                                            x: 0,
                                            animated: true
                                        })
                                        setTabSelected('successes')

                                    }}
                                >
                                    <View
                                        style={tabSelected === 'successes' ? styles.tabSelectedView : styles.tabUnselectedView}
                                    >
                                        <Text
                                            style={tabSelected === 'successes' ? styles.tabSelectedText : styles.tabUnselectedText}
                                        >
                                            Successes
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>

                            </View>

                            {
                                tabSelected === 'stats' &&
                                    <>
                                        <ThisWeekStats 
                                            navigateToCalendarScreen={navigateToCalendarScreen}
                                            profileUserId={profileUserId}
                                            perspective={perspective}
                                            weeklyCompletionRate={weeklyCompletionRate}
                                        />

                                        <View 
                                            style={{
                                                height: 18
                                            }}
                                        />

                                        <AllTimeStats 
                                            navigateToCalendarScreen={navigateToCalendarScreen}
                                            profileUserId={profileUserId}
                                            perspective={perspective}
                                            totalsData={totalsData}
                                            upperBound={upperBound}
                                            completionRateData={completionRateData}
                                        />
                                    </>

                            }

                            {
                                tabSelected === 'successes' &&
                                    <Successes 
                                        profileUserId={profileUserId}
                                        perspective={perspective}
                                        fullUser={fullUser}
                                        completeEvents={completeEvents}
                                        allEvents={allEvents}
                                    />
                            }
                        </>
                    </ScrollView>
                }


                
                {/* REST OF PROFILE BEGINS */}
                
                {/* TABS */}



            {/* <View 
                style={{
                    height: 40
                }}
            /> */}

            {/* BOTTOM COMPONENTS */}
            

            <AddFriendModal 
                isVisible={addFriendModalIsVisible}
                close={setAddFriendModalIsVisible}
                user={user}
                type={'global'}
                screenSnackbarVisible={snackbarVisible}
                setScreenSnackbarVisible={setSnackbarVisible}
                screenSnackbarMessage={snackbarMessage}
                setScreenSnackbarMessage={setSnackbarMessage}
                // hideModalContentWhileAnimating={true}
                // getFriends={getFriends}
            />

            <Modal
                isVisible={friendModalVisible}
                onBackdropPress={() => setFriendModalVisible(false)}
            >
                <FriendsListModal 
                    fullFriends={fullFriends}
                    setFriendModalVisible={setFriendModalVisible}
                    navigateToFriendsProfile={navigateToFriendsProfile}
                    perspective={perspective}
                />
            </Modal>

            <Snackbar 
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ backgroundColor: '#404040' }}
            >
                {snackbarMessage}
            </Snackbar>
        </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    tabSelectedView: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 24,
        marginRight: 24
    },
    tabUnselectedView: {
        backgroundColor: 'transparent',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 24,
        marginRight: 24

    },
    tabSelectedText: {
        color: 'white',
        fontSize: 14
    },
    tabUnselectedText: {
        color: 'grey',
        fontSize: 14
    },

})