import { Alert } from 'react-native'
import axios from 'axios'
import { db } from '../lib/firebase'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import AsyncStorage from '@react-native-async-storage/async-storage'


// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Lib
import firebase, { functions } from '../lib/firebase'

// Services
import { getFriendService, addFriendService } from '../services/users'
import { addNewFriendAsAccountabilityPartner } from '../services/events'

export const createLink = async (actionType, referrerId, referrerName, eventId, eventGroupId) => {

    // const releaseChannel = Constants.manifest.releaseChannel
    // const linkName = releaseChannel === undefined ? 'get-flintt' : 'download'
    // const linkName = 'download'

    const linkDomain = 'flintt.page.link'
    // const linkDomain = 'flintt.co/links/download'
    
    // const apiKey = Constants.manifest.web.config.firebase.apiKey 
    const apiKey = Constants.manifest.web.config.firebase.apiKey 
    const url = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`
    
    const params = {
        actionType,
        referrerId,
        referrerName,
        eventId,
        eventGroupId
    }

    const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')

    // const link = encodeURI(`https://${linkDomain}/${linkName}?${queryString}`)
    const link = encodeURI(`https://${linkDomain}?${queryString}`)

    const info = {
        dynamicLinkInfo: {
            // domainUriPrefix: 'getflintt.page.link',
            domainUriPrefix: 'flintt.page.link',
            link,
            androidInfo: {
                androidPackageName: 'com.flintt.android'
            },
            iosInfo: {
                iosBundleId: 'com.flintt.ios'
            },
            navigationInfo: {
                enableForcedRedirect: true
            }
        }
    }

    try {
        const { data } = await axios.post(url, info)
        return data
    } catch(err) {
        Alert.alert(err.message)
        console.log(err)
    }
}

export const handleIncomingUrl = async (incomingUrl) => {
    
    const user = firebase.auth().currentUser 

    const weirdUrl = Linking.parse(incomingUrl).queryParams['deep_link_id']
    const queryParams = weirdUrl ? Linking.parse(weirdUrl).queryParams : Linking.parse(incomingUrl).queryParams

    // queryParams = ADD_ACCOUNTABILITY_PARTNER_QUERY_PARAMS // for testing

    if (queryParams && queryParams.actionType === 'add-accountability-partner' || queryParams && queryParams.actionType === 'add-friend') {
        try {
            if (user) {
                const friends = await getFriendService(user.uid)
                const friendIds = friends.map(f => f.id)
                
                if (!friendIds.includes(queryParams.referrerId)) {

                    await addNewFriendFromLink(queryParams)

                }
                
            } else {
                try {
                    const onboardingObj = JSON.stringify(queryParams)
                    await AsyncStorage.setItem('@onboardingObj', onboardingObj)
                } catch(err) {
                    Alert.alert(err.message)
                    console.log(err)
                }

            }

        } catch(err) {
            Alert.alert(err.message)
            console.log(err)
        }


    }
    
}

export const addNewFriendFromLink = async (queryParams) => {

    const user = firebase.auth().currentUser 
    await addFriendService(user.uid, queryParams.referrerId)

    if (queryParams.actionType === 'add-accountability-partner' && queryParams.referrerId !== user.uid) {
        const options = {
            referrerId: queryParams.referrerId,
            userId: user.uid,
            eventId: queryParams.eventId,
            eventGroupId: queryParams.eventGroupId
        }
        await addNewFriendAsAccountabilityPartner(options)
    }

    const todayUrl = Linking.makeUrl('Today')
    const addFriendNotification = functions.httpsCallable('createNewFriendAddedNotification')
    await addFriendNotification({ displayName: user.displayName, referrerId: queryParams.referrerId, todayUrl: todayUrl })

    db.collection('users').doc(user.uid).update({ referredBy: queryParams.referrerId })
}

const ADD_ACCOUNTABILITY_PARTNER_QUERY_PARAMS = {
    actionType: 'add-friend',
    referrerId: 'mu9t4nTntvdcCsx2aufUc3XuHWQ2',
    referrerName: 'John',
    // eventId: '46_RcxYoV',
    // eventGroupId: 'NLq2eYrG2'
}