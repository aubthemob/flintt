import { db } from '../lib/firebase'
import dayjs from 'dayjs'
import { selectPushNotification } from '../utils/pushNotifications'
import { returnActivitySimple } from '../utils/activities'
import { Alert } from 'react-native'

// main function
// async function setNotificationService({ notifFromId, notifFromName, notifToId, type, deliveryTime, activity, eventId, eventGroupId }) {

//     const notification = selectPushNotification({ type, notifFromName, activity })

    // db.collection('users').doc(notifToId)
    //     .collection('notifications').add({
    //         notifFromId: notifFromId ? notifFromId : null,
    //         notifFromName,
    //         notifToId,
    //         type,
    //         status: 'pending',
    //         deliveryTime,
    //         activity: activity ? activity : null,
    //         notification,
    //         worker: 'sendNotification',
    //         eventId,
    //         eventGroupId
    //     })
// }

// // wrapper for friend tags
// export async function setFriendTagNotification({ userId, eventId, startDateTime, accountabilityPartners, activity, userName }) {

//     const deliveryTime = dayjs(startDateTime).subtract(4, 'hour').toDate()

//     const promises = accountabilityPartners.map(ap => {
//         setNotificationService({
//             notifFromId: userId, 
//             notifFromName: userName,
//             notifToId: ap,
//             eventId,
//             deliveryTime,
//             type: 'friend-tag',
//             activity,
//         })
//     })

//     await Promise.all(promises)
// }

// // wrapper for new messages
// export function setNewMessageNotification({ eventOrganizerId, accountabilityPartnerId, eventId, dateTimeSent, senderId, senderName }) {

//     try {
//         setNotificationService({
//             notifFromId: senderId,
//             notifFromName: senderName,
//             notifToId: eventOrganizerId === senderId ? accountabilityPartnerId : eventOrganizerId,
//             eventId,
//             deliveryTime: dateTimeSent,
//             type: 'new-message'
//         })
//     } catch (err) {
//         Alert.alert(err.message)
//         console.log(err)
//     }

// }

// // wrapper for activity reminders
// export function setActivityReminderNotification({ userId, startDateTime, eventId, activity, userName, eventGroupId }) {
    
//     const deliveryTime = dayjs(startDateTime).subtract(5, 'minute').toDate()
    
//     setNotificationService({
//         notifToId: userId,
//         deliveryTime,
//         type: 'activity-reminder',
//         activity,
//         notifFromName: userName,
//         eventId,
//         eventGroupId
//     })

// }

// // wrapper for tracking reminders
// export function setTrackingReminderNotification({ userId, endDateTime, eventId, activity, userName, eventGroupId }) {
    
//     const deliveryTime = dayjs(endDateTime).add(5, 'minute').toDate()
    
//     setNotificationService({
//         notifToId: userId,
//         deliveryTime,
//         type: 'tracking-reminder',
//         activity,
//         notifFromName: userName,
//         eventId,
//         eventGroupId
//     })

// }

// export function setAddFirstFriendNotification(userId) {

//     setNotificationService({ 
//         notifFromId: null,
//         notifFromName: null,
//         notifToId: userId,
//         type: 'add-first-friend', 
//         deliveryTime: null, 
//         activity: null 
//     })
// }

// export function updateNotificationStatus(userId, notificationId, status) {
//     db.collection('users').doc(userId)
//         .collection('notifications').doc(notificationId).update({
//             status
//         })
// }
