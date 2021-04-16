import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/functions'
import Constants from 'expo-constants'

export default !firebase.apps.length ? firebase.initializeApp(Constants.manifest.web.config.firebase) : firebase.app()

export const db = firebase.firestore()
export const storage = firebase.storage()
export const functions = firebase.functions()