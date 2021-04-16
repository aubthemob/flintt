const dayjs = require('dayjs')
const fetch = require('node-fetch')
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore()
const groupBy = require('lodash/groupBy')

const utc = require('dayjs/plugin/utc') 
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const pushNotifications = require('./utils/pushNotifications')
const timezones = require('./utils/timezones.json')

async function sendNotification({ notification, userId, notificationId }) {
    
    const userSnapshot = await db.collection('users').doc(userId).get()
    const expoPushToken = userSnapshot.data().expoPushToken

    let message = {
        to: expoPushToken,
        sound: 'default',
        title: notification.title ? notification.title : null,
        body: notification.body,
        data: notification.data,
    };

    try {
    
        const { status } = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
                },
            body: JSON.stringify(message)
        });

        if (status === 200) {
            updateNotificationStatus(userId, notificationId, 'sent') // should this be brought out of this function? What if the notification doesn't send?
        }

    } catch(err) {
        console.log(err)
    }
    
}

function updateNotificationStatus(userId, notificationId, status) {
    db.collection('users').doc(userId)
        .collection('notifications').doc(notificationId).update({
            status
        })
}

exports.sendIfDeliveryTimeHasPassed = functions.firestore.document('users/{userId}/notifications/{notificationId}')
    .onCreate(async (snapshot, context) => {

        const now = admin.firestore.Timestamp.now()

        const blockSend = snapshot.data().blockSend 

        if (snapshot.data().deliveryTime <= now && !blockSend) {
            
            await sendNotification({ 
                userId: context.params.userId, 
                notificationId: context.params.notificationId, 
                notification: snapshot.data().notification 
            })

        }

    })

exports.pushNotificationsTaskRunner = functions.pubsub
    .schedule('* * * * *').onRun(async context => {

        const now = admin.firestore.Timestamp.now()
        const query = db.collectionGroup('notifications').where('deliveryTime', '<=', now)
            .where('status', '==', 'pending')
            .where('blockSend', '==', false)

        const notifications = await query.get()

        const jobs = []
        notifications.docs.forEach(snapshot => {
            const { worker, notification, notifToId } = snapshot.data()
            const notificationId = snapshot.id
            const options = {
                notification,
                userId: notifToId,
                notificationId
            }
            const job = pushNotificationWorkers[worker](options)
                // .then(() => snapshot.ref.update({ status: 'sent' }))
                .catch(() => snapshot.ref.update({ status: 'error' }))
            jobs.push(job)
        })

        return await Promise.all(jobs)

    })

const pushNotificationWorkers = {
    sendNotification: ({ notification, userId, notificationId }) => sendNotification({ notification, userId, notificationId })
}

// Update notifications based on event edit - applies to all notifications tied to an event
exports.updateNotificationOnEventEdit = functions.firestore.document('users/{userId}/events/{eventId}')
    .onUpdate(async (change, context) => {

        // get all notifications for the given event
        const query = db.collectionGroup('notifications')
            .where('eventId', '==', context.params.eventId)

        const res = await query.get()

        const notifications = res.docs.map(n => {

            const data = n.data()
            const id = { notificationId: n.id }
            const notification = Object.assign(data, id)

            return notification

        })

        // update the time
        const newStartDateTimeUnix = dayjs.unix(change.after.data().startDateTime.seconds)
        const newEndDateTimeUnix = dayjs.unix(change.after.data().endDateTime.seconds)

        const friendTagTime = newStartDateTimeUnix.subtract(4, 'hour').toDate()
        const activityReminderTime = newStartDateTimeUnix.subtract(30, 'minute').toDate()
        const trackerReminderTime = newEndDateTimeUnix.add(5, 'minute').toDate()
        const accountabilityPartnerNudgeReminderTime = newEndDateTimeUnix.add(30, 'minute').toDate
        const activityTimeTime = newStartDateTimeUnix.toDate()

        notifications.forEach(n => {

            let deliveryTime

            if (n.type === 'friend-tag') {
                deliveryTime = friendTagTime
            } else if (n.type === 'activity-reminder') {
                deliveryTime = activityReminderTime
            } else if (n.type === 'tracking-reminder') {
                deliveryTime = trackerReminderTime
            } else if (n.type === 'accountability-partner-nudge') {
                deliveryTime = accountabilityPartnerNudgeReminderTime
            } else if(n.type === 'activity-time') {
                deliveryTime = activityTimeTime
            } else {
                deliveryTime = null
            }

            db.collection('users').doc(n.notifToId)
                .collection('notifications').doc(n.notificationId).update({
                    deliveryTime
                })
        })

        // if accountability partner is added to the event, create a new notification for that accountability parnter
        const beforeAps = change.before.data().accountabilityPartners
        const afterAps = change.after.data().accountabilityPartners

        const addedAps = afterAps.filter(a => !beforeAps.includes(a))
        const removedAps = beforeAps.filter(b => !afterAps.includes(b))

        if (addedAps.length > 0) {
            // send notif to new APs
            const options = {
                type: 'friend-tag',
                notifFromName: change.after.data().displayName,
                activity: change.after.data().activity,
                url: change.after.data().todayUrl,

            }

            const notification = pushNotifications.selectPushNotification(options)

            const deliveryTime = dayjs.unix(change.after.data().startDateTime.seconds).subtract(4, 'hour').toDate()

            addedAps.forEach(async ap => {

                db.collection('users').doc(ap)
                    .collection('notifications').add({
                        notifFromId: context.params.userId, 
                        notifFromName: change.after.data().displayName,
                        notifToId: ap,
                        eventId: context.params.eventId,
                        deliveryTime,
                        type: 'friend-tag',
                        activity: change.after.data().activity,
                        notification,
                        worker: 'sendNotification',
                        blockSend: false,
                        status: 'pending'
                    })

            })
        }

        // if accountability partner is removed from the event, delete the notification 
        if (removedAps.length > 0) {
            // delete notif for removed AP
            // find which existing notifications are for removed APs by filtering the notifications by which one has a notifToId that is in the removedAps array
            const notifsToDelete = notifications.filter(n => removedAps.includes(n.notifToId))

            // delete these notifications
            notifsToDelete.forEach(n => {
                db.collection('users').doc(n.notifToId)
                    .collection('notifications').doc(n.notificationId).delete()
            })
        }

    })

exports.deleteNotificationOnEventDelete = functions.firestore.document('users/{userId}/events/{eventId}')
    .onDelete(async (change, context) => {

        const query = db.collectionGroup('notifications')
            .where('eventId', '==', context.params.eventId)

        const res = await query.get()

        const notifications = res.docs.map(n => {
            return { userId: n.data().notifToId, notificationId: n.id }
        })

        notifications.forEach(n => {
            db.collection('users').doc(n.userId)
                .collection('notifications').doc(n.notificationId).delete()
        })

    })

// sends add first friend notification every day
exports.sendOnboardingNotification = functions.pubsub
    .schedule('15 12 * * *').onRun(async context => { 

        const noFriendsUsersQuery = db.collectionGroup('users').where('friends', '==', [])
            .where('hasEvents', '==', true)

        const noFriendsUsersRes = await noFriendsUsersQuery.get()
        
        const noFriendsUsersIds = noFriendsUsersRes.docs.map(u => u.id)

        if (noFriendsUsersIds.length > 0) {
            
            const notifQuery = db.collectionGroup('notifications').where('type', '==', 'add-first-friend')
            const notifRes = await notifQuery.get()

            const notificationsToSend = notifRes.docs.map(n => {
                const data = n.data()
                if (noFriendsUsersIds.includes(data.notifToId)) {
                    return {
                        notifToId: data.notifToId,
                        notification: data.notification,
                        worker: data.worker,
                        id: n.id
                    }
                }
            })
    
            const jobs = []
            notificationsToSend.forEach(snapshot => {
                const { worker, notification, notifToId } = snapshot
                const notificationId = snapshot.id
                const options = {
                    notification,
                    userId: notifToId,
                    notificationId
                }
                const job = pushNotificationWorkers[worker](options)
                    // .then(() => snapshot.ref.update({ status: 'sent' }))
                    .catch(() => snapshot.ref.update({ status: 'error' }))
                jobs.push(job)
            })
    
            return await Promise.all(jobs)

        }
        
    })

// creates notifications for new events created 
exports.createAssociatedNotificationsOnEventCreate = functions.firestore.document('users/{userId}/events/{eventId}')
    .onCreate(async (snapshot, context) => {

        const typesForAllEvents = ['activity-reminder', 'activity-time', 'tracking-reminder']

        const allEventsPromises = typesForAllEvents.map(t => {

            const options = {
                type: t,
                notifFromName: snapshot.data().displayName,
                activity: snapshot.data().activity,
                url: snapshot.data().todayUrl,
                accountabilityPartnerNames: snapshot.data().accountabilityPartnerNames.length > 0 ? snapshot.data().accountabilityPartnerNames : []
            }

            const notification = pushNotifications.selectPushNotification(options)

            let deliveryTime
            if (t === 'activity-reminder') {
                deliveryTime = dayjs.unix(snapshot.data().startDateTime.seconds).subtract(30, 'minute').toDate()
            } else if (t === 'tracking-reminder') {
                deliveryTime = dayjs.unix(snapshot.data().endDateTime.seconds).add(5, 'minute').toDate()
            } else if (t === 'activity-time') {
                deliveryTime = dayjs.unix(snapshot.data().startDateTime.seconds).toDate()
            }

            return db.collection('users').doc(context.params.userId)
                .collection('notifications').add({
                    notifToId: context.params.userId,
                    type: t,
                    status: 'pending',
                    deliveryTime,
                    activity: snapshot.data().activity,
                    worker: 'sendNotification',
                    eventId: context.params.eventId,
                    eventGroupId: snapshot.data().eventGroupId,
                    notification,
                    blockSend: false
                })

        })

        let addFriendPromises

        // if originalEvent, create a friend tag notification
        if (snapshot.data().originalEvent === true) {

            const options = {
                type: 'friend-tag',
                notifFromName: snapshot.data().displayName,
                activity: snapshot.data().activity,
                url: snapshot.data().todayUrl
            }

            const notification = pushNotifications.selectPushNotification(options)

            const deliveryTime = dayjs.unix(snapshot.data().startDateTime.seconds).subtract(4, 'hour').toDate()

            const accountabilityPartners = snapshot.data().accountabilityPartners

            addFriendPromises = accountabilityPartners.map(async ap => {

                return db.collection('users').doc(ap)
                    .collection('notifications').add({
                        notifFromId: context.params.userId, 
                        notifFromName: snapshot.data().displayName,
                        notifToId: ap,
                        eventId: context.params.eventId,
                        deliveryTime,
                        type: 'friend-tag',
                        status: 'pending',
                        activity: snapshot.data().activity,
                        notification,
                        worker: 'sendNotification',
                        blockSend: false
                    })

            })

        }

        // merge all promises and return
        const notificationsPromises = allEventsPromises.concat(addFriendPromises)

        return await Promise.all(notificationsPromises)

    })

// add first friend notification on create user
exports.createFirstFriendNotificationOnUserCreate = functions.firestore.document('users/{userId}')
    .onCreate(async (snapshot, context) => {

        const options = {
            type: 'add-first-friend',
            notifFromName: null,
            activity: null,
            url: snapshot.data().todayUrl
        }

        const notification = pushNotifications.selectPushNotification(options)

        db.collection('users').doc(context.params.userId)
            .collection('notifications').add({
                notifToId: context.params.userId, 
                type: options.type,
                notification,
                worker: 'sendNotification',
                status: 'pending',
                blockSend: false
            })

    })

// new message notification on create message
exports.createNewMessageNotificationOnMessageCreate = functions.firestore.document('conversations/{conversationId}/messages/{messageId}')
    .onCreate(async (snapshot, context) => {

        const options = {
            type: 'new-message',
            notifFromName: snapshot.data().senderName,
            activity: snapshot.data().activity,
            url: snapshot.data().messageUrl
        }

        const notifToId = snapshot.data().receiverId

        const notification = pushNotifications.selectPushNotification(options)

        db.collection('users').doc(notifToId)
            .collection('notifications').add({
                notifToId,
                type: options.type,
                notification,
                deliveryTime: snapshot.data().dateTimeSent,
                worker: 'sendNotification',
            })

    })

// create accountability-partner-nudge notification
exports.createAccountabilityPartnerNudgeNotificationOnCreateEvent = functions.firestore.document('users/{userId}/events/{eventId}')
    .onCreate(async (snapshot, context) => {

        const options = {
            type: 'accountability-partner-nudge',
            notifFromName: snapshot.data().displayName,
            activity: snapshot.data().activity,
            url: snapshot.data().todayUrl
        }

        const notification = pushNotifications.selectPushNotification(options)

        const deliveryTime = dayjs.unix(snapshot.data().endDateTime.seconds).add(30, 'minute').toDate()

        const accountabilityPartners = snapshot.data().accountabilityPartners

        const notifsToSend = accountabilityPartners.map(a => {
            return db.collection('users').doc(a)
                .collection('notifications').add({
                    notifToId: a,
                    type: options.type,
                    notification,
                    eventId: context.params.eventId,
                    eventGroupId: snapshot.data().eventGroupId || null,
                    blockSend: false,
                    deliveryTime,
                    status: 'pending',
                    worker: 'sendNotification',
                })
        })

        await Promise.all(notifsToSend)

    })

exports.setBlockSendToTrue = functions.https.onCall(async (data, context) => {

    const eventId = data.eventId

    const notifQuery = db.collectionGroup('notifications').where('eventId', '==', eventId)
    const notifRes = await notifQuery.get()

    const types = ['tracking-reminder', 'accountability-partner-nudge', 'activity-reminder', 'activity-time']
    
    const allNotifs = notifRes.docs.map(n => {

        const id = { notificationId: n.id }
        const data = n.data()

        const returnObj = Object.assign(data, id)
        return returnObj

    })
    
    const notifsToModify = allNotifs.filter(n => types.includes(n.type))

    const promises = notifsToModify.map(n => {
        return db.collection('users').doc(n.notifToId)
            .collection('notifications').doc(n.notificationId).update({
                blockSend: true
            })
    })

    await Promise.all(promises)
})

exports.createNewFriendAddedNotification = functions.https.onCall(async (data, context) => { 

    const referrerId = data.referrerId
    
    const options = {
        type: 'new-friend-added',
        notifFromName: data.displayName,
        url: data.todayUrl
    }

    const notification = pushNotifications.selectPushNotification(options)
    const deliveryTime = dayjs().toDate()

    db.collection('users').doc(referrerId)
        .collection('notifications').add({
            notifToId: referrerId,
            type: options.type,
            notification,
            // eventId: context.params.eventId,
            // eventGroupId: snapshot.data().eventGroupId || null,
            blockSend: false,
            deliveryTime,
            status: 'pending',
            worker: 'sendNotification',
        })

})

exports.sendDailyActivitiesOverviewNotification = functions.pubsub
    .schedule('0 * * * *').onRun(async context => { 

        // create array of promises of notifications to send to users who HAVE events tomorrow
        const usersRes = await db.collection('users').get()

        const allTimezones = usersRes.docs.filter(u => u.data().timezone)
            .map(u => u.data().timezone)

        const dedupTimezones = removeDuplicates(allTimezones)
        const sameZones = removeDuplicateTimezones(dedupTimezones)

        let usersWhoHaveEventsTomorrow = []
        let eventTomorrowNotifications = []
        let todayUrl

        sameZones.forEach(async d => {

            const now = dayjs().tz(d)
            const nowIsNinePm = now.get('hour') === 21 // change

            if (nowIsNinePm === true) {
                const tomorrowStart = now.add(1, 'day').set('hour', 0).set('minute', 0).set('second', 0).toDate()
                const tomorrowEnd = now.add(1, 'day').set('hour', 23).set('minute', 59).set('second', 59).toDate()
                
                const eventsTomorrowQuery = db.collectionGroup('events')
                    .where('startDateTime', '>=', tomorrowStart)
                    .where('startDateTime', '<=', tomorrowEnd)
                
                const eventsTomorrowRes = await eventsTomorrowQuery.get()
                
                const eventsTomorrow = eventsTomorrowRes.docs.map(d => {

                    const data = d.data()
                    const id = { eventId: d.id }

                    const returnObj = Object.assign(data, id)
                    return returnObj

                })

                const eventsByUserId = groupBy(eventsTomorrow, e => {
                    return e.userId
                })

                for (const userId in eventsByUserId) {

                    const events = eventsByUserId[userId].map(e => e.activity)
                    todayUrl = eventsByUserId[userId][0].todayUrl

                    const options = {
                        type: 'list-activities-tomorrow',
                        events,
                        url: todayUrl
                    }

                    const notification = pushNotifications.selectPushNotification(options)

                    const notif = db.collection('users').doc(userId)
                        .collection('notifications').add({
                            blockSend: false,
                            notifToId: userId,
                            type: options.type,
                            notification,
                            deliveryTime: now.toDate(),
                            worker: 'sendNotification',
                            status: 'pending'
                        })

                    eventTomorrowNotifications.push(notif)
                    usersWhoHaveEventsTomorrow.push(userId)

                }

                // create array of promises of notifications to send to users who have NO events tomorrow
                const fullUsers = usersRes.docs.map(u => {
        
                    const data = u.data()
                    const id = { userId: u.id }
        
                    const returnObj = Object.assign(data, id)
                    return returnObj
        
                })
        
                const usersWithNoEventsTomorrow = fullUsers.filter(u => !usersWhoHaveEventsTomorrow.includes(u.userId))
        
                const noEventTomorrowNotifications = usersWithNoEventsTomorrow.map(u => {
        
                    const options = {
                        type: 'schedule-activity-tomorrow-prompt',
                        url: todayUrl // must change to calendarUrl
                    }
        
                    const notification = pushNotifications.selectPushNotification(options)
        
                    return db.collection('users').doc(u.userId)
                        .collection('notifications').add({
                            blockSend: false,
                            notifToId: u.userId,
                            type: options.type,
                            notification,
                            deliveryTime: now.toDate(),
                            worker: 'sendNotification',
                            status: 'pending'
                        })
        
                })
        
                const allNotificationsToSend = eventTomorrowNotifications.concat(noEventTomorrowNotifications)
        
                return Promise.all(allNotificationsToSend)
            }

        })

    })

// removes all duplicates from an array
const removeDuplicates = (arr) => {
    let unique = []
    arr.forEach(a => {
        if (!unique.includes(a)) {
            unique.push(a)
        }
    })
    return unique
}

// checks if two utc's are in fact the same timezone and returns the deduplicated utc list
const removeDuplicateTimezones = (userZones) => {

    // const parsedTimezones = timezones.map(t => JSON.parse(t))
    // console.log(parsedTimezones)
    const utcArrs = timezones.map(p => p.utc)
    const sameZones = []
    userZones.forEach(u => {
        utcArrs.map(arr => {
            if (arr.includes(u)) {
                sameZones.push(arr[0])
            }
        })
    })
    
    const dedupedZones = removeDuplicates(sameZones)
    return dedupedZones

} 