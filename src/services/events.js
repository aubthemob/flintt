import { db, functions } from '../lib/firebase'
import * as firebase from 'firebase'
import dayjs from 'dayjs'
const shortid = require('shortid')
import { getFriendService } from './users'
import { reduceFrequencyValue } from '../utils/activityFrequencyValues'
import * as Linking from 'expo-linking'

const now = new Date()
const lastWeek = dayjs().subtract(7, 'days').toDate()
const yesterday = dayjs().subtract(1, 'days').toDate()
const tomorrow = dayjs().add(1, 'days').toDate()

const todayUrl = Linking.makeUrl('Today')
const profileUrl = Linking.makeUrl('Profile')
const calendarUrl = Linking.makeUrl('Calendar')

export async function createEvent({ userId, activity, startDateTime, endDateTime, accountabilityPartners, userName, frequency, timezone, eventId, eventGroupId, accountabilityPartnerNames, habit, icon, description }) {
    
    startDateTime = startDateTime.toDate()
    endDateTime = endDateTime.toDate()

    await db.collection(`users/${userId}/events`).doc(eventId).set({
        activity,
        habit,
        icon,
        description,
        startDateTime,
        endDateTime,
        accountabilityPartners: accountabilityPartners ? accountabilityPartners : [],
        status: 'scheduled',
        userId,
        displayName: userName,
        selfieUrl: null,
        frequency,
        eventGroupId,
        originalEvent: true,
        todayUrl,
        profileUrl,
        timezone,
        calendarUrl,
        accountabilityPartnerNames
    })

    await setHasEvents(userId)
    
}

async function setHasEvents(userId) {
    await db.collection('users').doc(userId).update({
        hasEvents: true
    })
}

export async function getEventsService(userId) {
    const snapshot = await db.collection(`users/${userId}/events`).get()
    const data = snapshot.docs.map(doc => {
        return {
            ...doc.data(),
            id: doc.id
        }
    })
    const newData = data.map(item => {
        return {
            end: item.endDateTime ? dayjs.unix(item.endDateTime.seconds) : null,
            eventId: item.id,
            accountabilityPartners: item.accountabilityPartners,
            start: item.startDateTime ? dayjs.unix(item.startDateTime.seconds) : null,
            activityId: item.activityId,
            cardVisible: item.cardVisible
            // frequency: item.frequency
        }
    })
    return newData
}

export async function updateEvent({ eventId, userId, activity, startDateTime, endDateTime, difference, accountabilityPartners, frequency, eventsType, eventGroupId, habit, icon, description }) {

    if (eventsType === 'one-event') {

        return await db.collection(`users/${userId}/events`).doc(eventId).update({
            activity,
            habit,
            icon,
            description,
            startDateTime: startDateTime.toDate(),
            endDateTime: endDateTime.toDate(),
            accountabilityPartners: accountabilityPartners ? accountabilityPartners : [],
            frequency
        })

    } else if (eventsType === 'all-events') {

        // query all events with the eventGroupId
        const allEventsQuery = db.collection('users').doc(userId)
            .collection('events').where('eventGroupId', '==', eventGroupId)

        const allEvents = await allEventsQuery.get()

        let promises = []
        allEvents.docs.map(a => {

            const currentStartDateTime = dayjs.unix(a.data().startDateTime.seconds)

            const newStartHour = dayjs(startDateTime).hour()
            const newStartMinute = dayjs(startDateTime).minute()

            const newStartDateTime = currentStartDateTime.set('hour', newStartHour).set('minute', newStartMinute)
            const newEndDateTime = newStartDateTime.add(difference, 'minute')
            
            db.collection('users').doc(userId)
                .collection('events').doc(a.id).update({
                    activity,
                    startDateTime: newStartDateTime.toDate(),
                    endDateTime: newEndDateTime.toDate(),
                    accountabilityPartners: accountabilityPartners ? accountabilityPartners : [],
                    frequency
                })
        })

        await Promise.all(promises)
    }
}

export async function deleteEvent({ userId, eventId, eventGroupId, eventsType }) {
    
    if (eventsType === 'one-event') {
        await db.collection(`users/${userId}/events`).doc(eventId).delete()

    }

    if (eventsType === 'all-events') {

        // query all events with the eventGroupId
        const allEventsQuery = db.collection('users').doc(userId)
            .collection('events')
            .where('eventGroupId', '==', eventGroupId)
            .where('startDateTime', '>=', new firebase.firestore.Timestamp.now())

        const allEvents = await allEventsQuery.get()

        let promises = []
        allEvents.docs.map(a => {
            db.collection('users').doc(userId)
                .collection('events').doc(a.id).delete()
        })

        await Promise.all(promises)

    }
}

export async function getFriendsEventsService(userId, type) {
    const snapshot = await db.collection('users').doc(userId).get()
    const friendIds = snapshot && snapshot.data().friends

    const promises = type === 'recent' ? (
        friendIds.map(fId => {
            return db.collection('users').doc(fId).collection('events')
                .where('accountabilityPartners', 'array-contains', userId)
                .where('startDateTime', '<=', now)
                .where('startDateTime', '>=', yesterday) 
                .orderBy('startDateTime', 'desc')
                .get()
        })
    ) : (
        friendIds.map(fId => {
            return db.collection('users').doc(fId).collection('events')
                .where('accountabilityPartners', 'array-contains', userId)
                .where('startDateTime', '>=', now)
                .where('startDateTime', '<=', tomorrow)
                .orderBy('startDateTime', 'asc')
                .get()
        })
    )

    const data = await Promise.all(promises)

    let friendsEvents = data.map((d, i) => (
        d.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }))
    ))

    const flatten = arr => {
        return Array.prototype.concat(...arr)
    }

    friendsEvents = flatten(friendsEvents)

    return friendsEvents
}

export async function updateEventAfterResult(userId, eventId, status) {

    db.collection('users').doc(userId)
        .collection('events').doc(eventId)
        .update({
            status
        })

    if (status === 'complete') {

        try {
            const setBlockSendToTrue = functions.httpsCallable('setBlockSendToTrue')
            await setBlockSendToTrue({ eventId })
        } catch(err) {
            console.log(err.message)
        }   

    }
    
}

export async function setSelfieUrl(userId, eventId, selfieUrl) {

    db.collection('users').doc(userId)
        .collection('events').doc(eventId)
        .update({
            selfieUrl
        })

}

export async function addNewFriendAsAccountabilityPartner({ userId, referrerId, eventId, eventGroupId }) {
    try {
        if (eventGroupId) {
    
            const multipleEventsQuery = db.collection('users').doc(referrerId).collection('events')
                .where('eventGroupId', '==', eventGroupId)
    
            const multipleEventsRes = await multipleEventsQuery.get()
    
            const modifyApsPromises = multipleEventsRes.docs.map(m => {
    
                return db.collection('users').doc(referrerId)
                    .collection('events').doc(m.id).update({
                        accountabilityPartners: firebase.firestore.FieldValue.arrayUnion(userId)
                    })
            })
    
            await Promise.all(modifyApsPromises)
    
        } else {
    
            db.collection('users').doc(referrerId)
                .collection('events').doc(eventId).update({
                    accountabilityPartners: firebase.firestore.FieldValue.arrayUnion(userId)
                })
    
        }

    } catch(err) {

        console.log(err)

    }
}

export async function updateAps(userId, eventId, accountabilityPartners) {

    db.collection('users').doc(userId).collection('events').doc(eventId).update({
        accountabilityPartners
    })

}

export async function getActivityNames(userId) {

    const query = db.collection('users').doc(userId).collection('events')
    const snapshot = await query.get()

    const activities = snapshot.docs.map(doc => {

        const returnData = {
            activity: doc.data().activity,
            habit: doc.data().habit,
            icon: doc.data().icon
        }
        
        return returnData

    })

    return activities

}

export async function getSingleActivity(userId, eventId) {
    const query = db.collection('users').doc(userId)
        .collection('events').doc(eventId)

    const snapshot = await query.get()

    const data = {
        ...snapshot.data(),
        eventId: snapshot.id
    }

    return data
}