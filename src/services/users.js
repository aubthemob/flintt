import { db } from '../lib/firebase'
import * as firebase from 'firebase'
import { Alert, ActivityIndicatorComponent } from 'react-native'
const uniq = require('lodash.uniq')

export async function getCertainUsers(userIds) {
    try {
        const reads = userIds.map(i => db.collection('users').doc(i).get())
        let users = await Promise.all(reads)
        users = users.map(u => ({
            ...u.data(),
            id: u.id
        }))
        return users
    } catch(err) {
        Alert.alert(err.message)
        console.log(err)
    }
}

export async function getSingleUser(userId) {
    // console.log(userId)
    try {
        const snapshot = await db.collection('users').doc(userId).get()
        const data = {
            ...snapshot.data(),
            id: snapshot.id
        }
        return data
    } catch (err) {
        Alert.alert(err.message)
        console.log(err)
    }
}

export async function getFriendService(userId) {
    try {
        const snapshot = await db.collection('users').doc(userId).get()
        const friendIds = snapshot && snapshot.data() && snapshot.data().friends
        
        if (friendIds) {
            const friendReads = friendIds.map(fId => db.collection('users').doc(fId).get())
            let friends = await Promise.all(friendReads)
            friends = friends.map(f => ({
                ...f.data(),
                id: f.id
            }))
            return friends
        } else {
            return []
        }
    } catch(err) {
        Alert.alert(err.message)
        console.log(err)
    }   
}

export async function setAvatarUrl(userId, avatarUrl) {
    db.collection('users').doc(userId).update({
        avatarUrl
    })
    const user = firebase.auth().currentUser
    user.updateProfile({
        photoURL: avatarUrl
    })
}

export async function addFriendService(userId, friendId) {
    if (friendId && userId !== friendId) {
        await db.collection('users').doc(userId).update({
            friends: firebase.firestore.FieldValue.arrayUnion(friendId),
            hasFriends: true
        })
        await db.collection('users').doc(friendId).update({
            friends: firebase.firestore.FieldValue.arrayUnion(userId),
            hasFriends: true
        })
        await addNewFriendToEventsVisibleToEveryone(userId, friendId)
        const doc = await db.collection('users').doc(friendId).get()
        return doc
    } else {
        return
    }
}

const addNewFriendToEventsVisibleToEveryone = async (userId, friendId) => {
    try {
        [userId, friendId].forEach(async u => {
            const userDoc = await db.collection('users').doc(u).get()
            console.log(userDoc.data())
            const friends = userDoc.data().friends
            const eventsDocs = await db.collection('users').doc(u).collection('events').get()
            const events = eventsDocs.docs.map(e => ({
                ...e.data(),
                eventId: e.id
            }))
            events.forEach(e => {
                if (friends.length === e.accountabilityPartners.length + 1) {
                    const userToAdd = u === userId ? friendId : userId
                    e.accountabilityPartners.push(userToAdd)
                }
            })
            const updateEvents = events.map(async e => {
                await db.collection('users').doc(u).collection('events').doc(e.eventId).update({
                    accountabilityPartners: e.accountabilityPartners
                })
            })
            await Promise.all(updateEvents)
        })
    } catch(err) {
        Alert.alert(err.message)
        console.log(err)
    }
}

export async function checkIfFriendExists(friendId) {
    const doc = await db.collection('users').doc(friendId).get()
    if(doc.exists) {
        return true
    } else {
        return false
    }
}

export function deleteFriend(userId, friendId) {

    db.collection('users').doc(userId).update({
        friends: firebase.firestore.FieldValue.arrayRemove(friendId)
    })

    db.collection('users').doc(friendId).update({
        friends: firebase.firestore.FieldValue.arrayRemove(userId)
    })

}