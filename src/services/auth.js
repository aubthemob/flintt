import firebase from '../lib/firebase'
import { db, functions } from '../lib/firebase'
import * as Facebook from 'expo-facebook'
import * as Linking from 'expo-linking'
import Constants from 'expo-constants'
import { Alert } from 'react-native'
import dayjs from 'dayjs'
import * as Localization from 'expo-localization'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { checkIfFriendExists, addFriendService } from './users'
import { addNewFriendAsAccountabilityPartner } from './events'
// import { setAddFirstFriendNotification } from './pushNotifications'

// Analytics
import { signupEvent } from '../utils/analyticsEvents'

// Utils
import { addNewFriendFromLink } from '../utils/links'

// Note that all try/catch statements for these async calls are only included in the in the screen logic

const todayUrl = Linking.makeUrl('Today')

export async function signInWithFacebook(navigation) {
  const appId = Constants.manifest.extra.facebookAppId
  await Facebook.initializeAsync(appId)
  const permissions = ['public_profile', 'email']

  const {
    type,
    token,
  } = await Facebook.logInWithReadPermissionsAsync(
    { permissions }
  );

  switch (type) {
    case 'success': {
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      const facebookProfileData = await firebase.auth().signInWithCredential(credential);  // Sign in with Facebook credential
      
      return Promise.resolve({ type: 'success' });
    }
    case 'cancel': {
      return Promise.reject({ type: 'cancel' });
    }
  }
}

export async function signUpWithEmail(email, password, name) {
  const cred = await firebase.auth().createUserWithEmailAndPassword(email, password)
  // const expoPushToken = await registerForPushNotificationsAsync()

  const displayName = setDisplayName(name)

  const now = dayjs().toDate()

  await db.collection('users').doc(cred.user.uid).set({
    email,
    displayName,
    friends: [],
    hasEvents: false,
    todayUrl,
    timezone: Localization.timezone,
    createdAt: now
    // expoPushToken
  })

  cred.user.updateProfile({
    displayName,
  })

  const onboardingObj = getOnboardingObj()
  if (onboardingObj) {
    await addNewFriendFromLink(onboardingObj)
    if (onboardingObj.eventId) {
      try {
        const setBlockSendToTrue = functions.httpsCallable('setBlockSendToTrue')
        await setBlockSendToTrue({ eventId: onboardingObj.eventId })
      } catch(err) {
        console.log(err.message)
      } 
    }
    await AsyncStorage.removeItem('@onboardingObj')
  }

  return cred.user.uid

}

export async function setExpoToken(userId, expoPushToken) {
  try {
    await db.collection('users').doc(userId).update({
      expoPushToken
    })
  } catch (err) {
    alert('You will need to enable push notifications in your settings.')
  }
}

export async function signInWithEmail(email, password) {
  await firebase.auth().signInWithEmailAndPassword(email, password)
}

export async function logout() {
  await firebase.auth().signOut()
}

const setDisplayName = name => {
  const nameSplit = name.split(' ')

  if (nameSplit.length === 1) {
    return name
  } else {
    const firstName = nameSplit[0]
    const lastNameFirstLetter = nameSplit[1][0].toUpperCase()
    const displayName = firstName.concat(' ', lastNameFirstLetter)
    return displayName
  }

}

const getOnboardingObj = async () => {

  try {
    const onboardingObj = await AsyncStorage.getItem('@onboardingObj')
    if (onboardingObj !== null) {

      const desOnboardingObj = JSON.parse(onboardingObj)
      return desOnboardingObj

    } else {
      return null
    }
  } catch(err) {
    console.log(err)
  }

}