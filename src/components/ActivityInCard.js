import React, { useState, useEffect, useContext, useReducer } from 'react'
import { View, Text, StyleSheet, Image, FlatList, Alert, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'

// import { createIconSetFromFontello } from '@expo/vector-icons'
// import fontelloConfig from '../../assets/fonts/config.json'

// Analytics
import { doneActivityButtonPressEvent, snoozeActivityButtonPressEvent } from '../utils/analyticsEvents'

// Components
import DoneSelfieModal from './DoneSelfieModal'
import FullScreenImage from './FullScreenImage'
import AddApToEventModal from './AddApToEventModal'
import Icon from './Icon'
import CameraComponent from './CameraComponent'

// Contexts 
import { useUserState } from '../contexts/UserAuthContext'
import { FeedContext } from '../screens/FeedScreen'
import { useNavigation } from '@react-navigation/native'

// Lib
import { db } from '../lib/firebase'
import * as firebase from 'firebase'
import dayjs from 'dayjs'
import Modal from 'react-native-modal'
import Tooltip from 'react-native-walkthrough-tooltip'
const orderBy = require('lodash.orderby')
const uniq = require('lodash.uniq')
const omit = require('lodash.omit')

// Services
import { getFriendService } from '../services/users'
import { getEventsService, updateEventAfterResult, setSelfieUrl } from '../services/events'
import { setSystemMessageService, setImageMessageService } from '../services/messages'

// Styles
import { Surface, IconButton, Avatar } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { windowHeight, windowWidth } from '../utils/dimensions'
import { handleShare } from '../utils/sharing'
import { ACHIEVEMENTS } from '../utils/achievements'

import { checkAndSetFire, checkAndSetAchievement, willBeAchievement } from '../utils/eventsHelpers'

const TRACKER_FORM_ACTIONS = {
    COMPLETE: 'complete',
    POSTPONE: 'postpone',
    FAIL: 'fail'
}

const trackerFormReducer = (state, action) => {
    switch (action.type) {
        case TRACKER_FORM_ACTIONS.COMPLETE:
            return { ...state, status: 'complete' }
        // case TRACKER_FORM_ACTIONS.POSTPONE:
        //     return { 
        //         ...state, 
        //         status: 'postponed', 
        //         startDateTime: state.startDateTime.add(10, 'minute'),
        //         endDateTime: state.endDateTime.add(10, 'minute') 
        //     }
        // case TRACKER_FORM_ACTIONS.FAIL:
        //     return { ...state, status: 'failed' }
        case TRACKER_FORM_ACTIONS.SCHEDULED:
            return { ...state, status: 'scheduled' }
        default:
            throw new Error("Invalid action type")
    }
}

export default function ActivityInCard(props) {

    const {
        activity,
        startDateTime,
        endDateTime,
        activityId,
        displayName,
        simple,
        userId: eventOrganizerId,
        fullAccountabilityPartners,
        accountabilityPartners,
        cardPerspective,
        status,
        eventId,
        selfieUrl,
        eventGroupId,
        allEvents,
        habit,
        fullCurrentUser,
        isSelectedActivity,
        handlePressActivity
    } = props 

    const { user } = useUserState()

    const [eventTime, setEventTime] = useState('')
    const [activityAps, setActivityAps] = useState([])
    const [doneSelfieModalVisible, setDoneSelfieModalVisible] = useState(false)

    const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false)

    const [trackerFormState, trackerFormDispatch] = useReducer(trackerFormReducer, {
        status,
        startDateTime,
        endDateTime,
    })

    const [noFriendsTooltipVisible, setNoFriendsTooltipVisible] = useState(false)
    const [cameraTooltipVisible, setCameraTooltipVisible] = useState(false)

    const [friends, setFriends] = useState([])
    const [fullFriends, setFullFriends] = useState([])
    const [addAccountabilityPartnerModalVisible, setAddAccountabilityPartnerModalVisible] = useState(false)
    const [updatedAps, setUpdatedAps] = useState([])

    const [cameraVisible, setCameraVisible] = useState(false)

    const [isOnFire, setIsOnFire] = useState(false)
    const [achievement, setAchievement] = useState('')

    const { setSnackbarMessage, setSnackbarVisible } = useContext(FeedContext)

    // get full friends and set state
    useEffect(() => {
        db.collection('users').doc(eventOrganizerId).onSnapshot(snapshot => {
            const newFriends = snapshot.data().friends
            setFriends(newFriends)
        })
    }, [])

    useEffect(() => {
        if (friends.length > 0) {
            db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', friends).onSnapshot(snapshot => { // this will break at 10 friends
                
                const newFullFriends = snapshot.docs.map(s => {
                    const data = s.data()
                    const id = s.id
                    return { id, ...data }
                })
                setFullFriends(newFullFriends)
    
            })
        } 
    }, [friends])

    useEffect(() => {
        const newActivityAps = fullAccountabilityPartners.filter(i => accountabilityPartners.includes(i.id))
        setActivityAps(newActivityAps)
    }, [accountabilityPartners, fullAccountabilityPartners])

    // check if the user is on fire
    useEffect(() => {

        const newIsOnFire = checkAndSetFire(allEvents, activity, eventId)
        setIsOnFire(newIsOnFire)

    }, [allEvents, trackerFormState])

    useEffect(() => {

        const newAchievement = checkAndSetAchievement(allEvents, habit, startDateTime, eventId)
        setAchievement(newAchievement)

    }, [allEvents, status])

    const handleEventTrackerFormSubmit = async (status) => {

        try {
            await updateEventAfterResult(user.uid, eventId, status)
            await setSystemMessageService(user.uid, accountabilityPartners, status, user.displayName, activity, eventId)
            if (status === 'complete') {
                setSnackbarVisible(true)
                const symbol = willBeAchievement(allEvents, habit, eventId)
                setCameraTooltipVisible(true)
                
                if (isOnFire && !symbol) {
                    setSnackbarMessage(`You're on fire!🔥 Your tagged supporters will see that you completed your activity.`)
                } else if (!isOnFire && symbol) {
                    setSnackbarMessage(`You leveled up!${symbol} Your tagged supporters will see that you completed your activity.`)
                } else if (isOnFire && symbol) {
                    setSnackbarMessage(`You're on fire 🔥 and you leveled up ${symbol}! Your tagged supporters will see that you completed your activity.`)
                } else {
                    setSnackbarMessage(`Your tagged supporters will see that you completed your activity!`)
                }
            }
        } catch(err) {
            Alert.alert(err)
            console.log(err)
        }
    }

    const NoFriendsTooltipContent = () => {
        return (
            <TouchableWithoutFeedback
                onPress={() => handlePressTagFriend()}
            >
                <View>
                    <Text
                        style={{
                            fontFamily: 'Montserrat-Regular',
                            color: 'white'
                        }}
                    >
                        No friends tagged.
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'Montserrat-Regular',
                            color: 'white',
                            textDecorationLine: 'underline'
                        }}
                    >
                    Press here to tag one!
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    const CameraTooltipContent = () => {
        return (
            <Text
                style={{
                    fontFamily: 'Montserrat-Regular',
                    color: 'white'
                }}
            >
                Save the moment!
            </Text>
        )
    }

    // adding friends
    const handlePressTagFriend = () => {

        if (friends.length === 0) {
            handleShare('add-accountability-partner', eventOrganizerId, displayName, eventId, eventGroupId)
        } else {
            setNoFriendsTooltipVisible(false)
            setAddAccountabilityPartnerModalVisible(true)
        }

    }

    return (
        <>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginVertical: 6,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#DBDBDB',
                        width: '95%',
                        alignSelf: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelectedActivity ? theme.colors.primary : 'white',
                    }}
                >

                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                        {
                            cardPerspective === 'event-organizer' &&
                                <View>
                                    <IconButton 
                                        onPress={async () => {
                                            doneActivityButtonPressEvent(activity, trackerFormState.startDateTime, trackerFormState.endDateTime, activityAps, trackerFormState.status)
                                            if (trackerFormState.status !== 'complete') {
                                                handleEventTrackerFormSubmit('complete')
                                                Haptics.impactAsync('light')
                                                trackerFormDispatch({ type: TRACKER_FORM_ACTIONS.COMPLETE })

                                            } else {
                                                handleEventTrackerFormSubmit('scheduled')
                                                trackerFormDispatch({ type: TRACKER_FORM_ACTIONS.SCHEDULED })
                                                setSelfieUrl(user.uid, eventId, null)

                                            }
                                        }}
                                        icon='checkbox-blank-outline'
                                        style={{
                                            marginLeft: -4,
                                            zIndex: 0
                                        }}
                                        color={'#9a9a9a'}
                                    />
                                    {
                                        status === 'complete' &&
                                            <IconButton 
                                                onPress={() => {
                                                    // doneActivityButtonPressEvent(activity, trackerFormState.startDateTime, trackerFormState.endDateTime, activityAps, trackerFormState.status)
                                                    if (trackerFormState.status !== 'complete') {
                                                        handleEventTrackerFormSubmit('complete')
                                                        trackerFormDispatch({ type: TRACKER_FORM_ACTIONS.COMPLETE })
                                                    } else {
                                                        handleEventTrackerFormSubmit('scheduled')
                                                        trackerFormDispatch({ type: TRACKER_FORM_ACTIONS.SCHEDULED })
                                                        setSelfieUrl(user.uid, eventId, null)
                                                        setSnackbarVisible(true)
                                                        setSnackbarMessage(`Your activity status was reset`)
                                                    }
                                                }}
                                                icon='check'
                                                style={{
                                                    position: 'absolute',
                                                    marginLeft: -4,
                                                    zIndex: 1,
                                                    left: -2,
                                                    top: -9
                                                }}
                                                size={32}
                                                color='#6AB178'
                                            />
                                    }
                                </View>

                        }

                        {
                            cardPerspective === 'accountability-partner' && status === 'complete' &&
                                <Avatar.Icon 
                                    icon='check'
                                    size={48}
                                    color={isSelectedActivity ? 'white' : '#6AB178'}
                                    style={[styles.icons, { marginLeft: -5 }]}
                                />
                        }
                        <View
                            style={{
                                justifyContent: 'center',
                                marginVertical: cardPerspective === 'accountability-partner' ? 5 : 0
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row'
                                }}
                            >

                                <Text style={{ fontFamily: 'Ubuntu-Medium', color: isSelectedActivity ? 'white' : theme.colors.text, fontSize: 18 }}>
                                    { activity }
                                </Text>

                                <Text>{isOnFire === true ? '🔥' : ''}</Text>
                                <Text>{status === 'complete' && achievement}</Text>
                            </View>

                            <Text style={ trackerFormState.status === 'postponed' ? { fontFamily: 'Montserrat-Regular', color: '#FFBA38', fontSize: 12 } : { fontFamily: 'Montserrat-Regular', color: isSelectedActivity ? 'white' : theme.colors.text, fontSize: 13 }}>
                                { `${trackerFormState.startDateTime.format('h:mma')} - ${trackerFormState.endDateTime.format('h:mma')}` }
                            </Text>
                        </View>
                    </View>

                    {
                        activityAps.length === 0 && cardPerspective === 'event-organizer' &&
                            <View>
                                <Tooltip
                                    isVisible={noFriendsTooltipVisible}
                                    content={<NoFriendsTooltipContent />}
                                    placement="top"
                                    onClose={() => setNoFriendsTooltipVisible(false)}
                                    disableShadow={true}
                                    backgroundColor='transparent'
                                    closeOnContentInteraction={false}
                                    contentStyle={{
                                        backgroundColor: '#404040',
                                        borderRadius: 48,
                                        paddingHorizontal: 18,
                                    }}
                                    displayInsets={{
                                        left: 6,
                                        right: 6
                                    }}
                                >
                                    <TouchableWithoutFeedback
                                        onPress={() => setNoFriendsTooltipVisible(true)}
                                        hitSlop={{top: 20, bottom: 20, left: 50, right: 50}}
                                        
                                    >
                                        <Icon 
                                            name="no_friends_icon_red"
                                            color='#C32A2A'
                                            size={24}
                                        />

                                    </TouchableWithoutFeedback>

                                </Tooltip>
                            
                            </View>
                    }

                    {
                        cardPerspective === 'event-organizer' && activityAps.length > 0 && activityAps.length === !fullCurrentUser.friends.length &&
                        <View
                            style={{
                                alignSelf: 'center'
                            }}
                        >
                            <FlatList 
                                data={activityAps}
                                contentContainerStyle={{
                                    alignSelf: 'center'
                                }}
                                scrollEnabled={false}
                                horizontal
                                listKey={(item, index) => `${item.id}${index}`}
                                keyExtractor={(item, index) => `${item.id}${index}`}
                                renderItem={({ item, index }) => {
                                    if (index === 0) {
                                        return (
                                            <Avatar.Image source={{ uri: item.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} size={32} style={{ justifyContent: 'center' }} />
                                        )
                                    } else if (index === 1) {
                                        return (
                                            <Avatar.Image source={{ uri: item.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} size={32} style={{ justifyContent: 'center', marginLeft: -10 }} />
                                        )
                                    } else if (index === 2) {
                                        return (
                                            <Avatar.Icon icon='dots-horizontal' size={18} style={{ marginLeft:-10, backgroundColor: '#A0A0A0', padding: 0, alignSelf: 'center', marginRight: 2 }} color={'white'} />
                                        )
                                    } else {
                                        return (
                                            <>
                                            </>
                                        )
                                    }
                                }}
                            />
                        </View>
                    }

                    {
                        cardPerspective === 'event-organizer' && activityAps.length > 0 && activityAps.length === fullCurrentUser.friends.length &&
                            <Avatar.Icon 
                                icon='account-group'
                                size={36}
                                style={{
                                    backgroundColor: 'transparent'
                                }}
                                color='#9a9a9a'
                            />
                    }


                    {
                        selfieUrl !== null && cardPerspective === 'event-organizer' &&
                            <TouchableWithoutFeedback
                                onPress={() => setFullScreenImageVisible(true)}
                                style={{
                                    zIndex: 5000
                                }}
                            >
                                <Avatar.Image 
                                    source={{ uri: selfieUrl }}
                                    size={42}
                                    style={{
                                        marginHorizontal: 6,
                                        transform: [
                                            {scaleX: -1},
                                        ],
                                    }}
                                />
                            </TouchableWithoutFeedback>
                    }

                    {
                        selfieUrl === null && cardPerspective === 'event-organizer' && status === 'scheduled' &&
                            <Avatar.Icon 
                                icon='circle'
                                color='transparent'
                                style={{
                                    backgroundColor: 'transparent'
                                }}
                                size={48}
                            />
                            ||
                        selfieUrl === null && cardPerspective === 'event-organizer' && status === 'complete' &&

                        <Tooltip
                            isVisible={cameraTooltipVisible}
                            content={<CameraTooltipContent />}
                            placement="top"
                            onClose={() => setCameraTooltipVisible(false)}
                            disableShadow={true}
                            backgroundColor='transparent'
                            closeOnContentInteraction={false}
                            contentStyle={{
                                backgroundColor: '#404040',
                                borderRadius: 48,
                                paddingHorizontal: 18,
                            }}
                            displayInsets={{
                                left: 6,
                                right: 6
                            }}
                        >
                            <IconButton 
                                icon='camera'
                                onPress={() => setCameraVisible(true)}
                                color='#9a9a9a'
                            />
                        </Tooltip>

                    }

                    {
                        cardPerspective === 'accountability-partner' && status === 'complete' &&
                            <>
                                {
                                    selfieUrl &&
                                        <TouchableOpacity
                                            onPress={() => setFullScreenImageVisible(true)}
                                        >
                                            <Avatar.Image 
                                                source={{ uri: selfieUrl }}
                                                size={42}
                                                style={{
                                                    transform: [
                                                        {scaleX: -1},
                                                    ],
                                                }}
                                            />

                                        </TouchableOpacity>
                                }
                            </>
                    }

                    {
                        cardPerspective === 'accountability-partner' &&
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    const options = omit(props, ['cardPerspective', 'fullAccountabilityPartners', 'allEvents', 'isSelectedActivity', 'handlePressActivity'])
                                    handlePressActivity(options)
                                }}
                            >
                                <View 
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 25,
                                        height: 25,
                                        backgroundColor: 'white',
                                        borderRadius: 48,
                                        borderWidth: 0.5,
                                        borderColor: isSelectedActivity ? theme.colors.primary : theme.colors.text
                                    }}
                                >
                                    <View 
                                        style={{
                                            width: 16,
                                            height: 16,
                                            backgroundColor: isSelectedActivity ? theme.colors.primary : 'transparent',
                                            borderRadius: 48,
                                        }}
                                    />
                                </View>

                            </TouchableWithoutFeedback>
                    }
                    

                </View>

            <Modal 
                isVisible={doneSelfieModalVisible}
                onBackdropPress={() => setDoneSelfieModalVisible(false)}
            >
                <View
                    style={{ 
                        flex: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        // height: windowHeight/2,
                        // width: windowWidth*0.9,
                        borderRadius: 24,
                        paddingBottom: 24,
                        paddingTop: 48,
                        paddingHorizontal: 24
                    }}
                >
                    <IconButton 
                        icon="window-close" 
                        size={24} 
                        style={{
                            backgroundColor: 'transparent', 
                            position: 'absolute',
                            left: 6,
                            top: 6,
                            zIndex: 1
                        }} 
                        color={theme.colors.text} 
                        onPress={() => setDoneSelfieModalVisible(false)}
                    />
                    <DoneSelfieModal 
                        doneSelfieModalVisible={doneSelfieModalVisible}
                        setDoneSelfieModalVisible={setDoneSelfieModalVisible}
                        eventId={eventId}
                        trackerFormDispatch={trackerFormDispatch}
                        TRACKER_FORM_ACTIONS={TRACKER_FORM_ACTIONS}
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarVisible={setSnackbarVisible}
                    />
                </View>
            </Modal>

            <Modal
                isVisible={fullScreenImageVisible}
                animationIn="zoomInDown"
                animationOut="zoomOutUp"
                style={{
                    margin: 0
                }}
                swipeDirection={['down']}
                onSwipeComplete={() => setFullScreenImageVisible(false)}
            >
                <FullScreenImage 
                    uri={selfieUrl}
                    setFullScreenImageVisible={setFullScreenImageVisible}
                    eventId={eventId}
                    perspective={cardPerspective}
                />

            </Modal>

            {/* modify accountability partners on event */}
            <Modal
                isVisible={addAccountabilityPartnerModalVisible}
                onBackdropPress={() => setAddAccountabilityPartnerModalVisible(false)}
            >
                <AddApToEventModal 
                    friends={fullFriends}
                    accountabilityPartners={activityAps.map(a => a.id)}
                    setAddApModalVisible={setAddAccountabilityPartnerModalVisible}
                    eventId={eventId}
                    eventGroupId={eventGroupId}
                    type={'inside-card'}
                />
            </Modal>

            <Modal
                isVisible={cameraVisible}
                onBackdropPress={() => setCameraVisible(false)}
                style={{margin: 0}}
            >
                <CameraComponent 
                    setCameraVisible={setCameraVisible}
                    eventId={eventId}
                    setDoneSelfieModalVisible={setDoneSelfieModalVisible}
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarVisible={setSnackbarVisible}
                    trackerFormDispatch={trackerFormDispatch}
                    TRACKER_FORM_ACTIONS={TRACKER_FORM_ACTIONS}
                />
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    icons: {
        backgroundColor: 'transparent'
    },
})