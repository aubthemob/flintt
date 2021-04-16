import { db, storage } from '../lib/firebase'
import dayjs from 'dayjs'
import * as Linking from 'expo-linking'

import { getSingleActivity } from '../services/events'

// import { setNewMessageNotification } from './pushNotifications'

export async function setMessageService({ userId, chatPartnerId, messageContent, dateTimeSent, senderId, senderName, image, selectedActivity }) {
    
    const sortedIds = [userId, chatPartnerId].sort()
    
    const ApDocRef = db.collection('conversations').doc(`${sortedIds[0]}_${sortedIds[1]}`)
    
    const doc = await ApDocRef.get()
    
    if (!doc.exists) {
        await ApDocRef.set({ participants: sortedIds })
    }

    // const messageUrl = Linking.makeUrl(`Today`)
    // console.log(messageUrl)
    // const messageUrl = Linking.makeUrl('chat', {
    //     chatPartnerId: userId
    // })
    const messageUrl = Linking.makeUrl('Chat/', {
        actionType: 'new-message',
        chatPartnerId: userId // userId is the chatPartnerId on the receiver's end
    })

    const activityData = selectedActivity !== '' && selectedActivity !== null &&  {
        ...selectedActivity,
        startDateTime: selectedActivity.startDateTime.toDate(),
        endDateTime: selectedActivity.endDateTime.toDate(),
    }
    
    await ApDocRef.collection('messages').add({
        messageContent,
        dateTimeSent,
        senderId,
        senderName,
        receiverId: senderId === userId ? chatPartnerId : userId,
        system: false,
        messageUrl,
        participants: sortedIds,
        image: image || null,
        activityData
    })

}

export async function setSystemMessageService(eventOrganizerId, accountabilityPartners, status, userName, activity, eventId) {

    accountabilityPartners.forEach(async ap => {

        const sortedIds = [ap, eventOrganizerId].sort()

        const ApDocRef = db.collection('conversations').doc(`${sortedIds[0]}_${sortedIds[1]}`)

        const doc = await ApDocRef.get()
    
        if (!doc.exists) {
            await ApDocRef.set({ participants: sortedIds })
        }

        if (status === 'complete') {
        
            await ApDocRef.collection('messages').add({
                dateTimeSent: new Date(),
                messageContent: `${userName} completed their activity '${activity}'`,
                system: true,
                senderId: eventOrganizerId,
                receiverId: ap,
                eventId
            })

        } 
    })
}

// export async function setImageMessageService({ accountabilityPartnerIds, eventOrganizerId, eventId, image, senderId }) {
    
//     accountabilityPartnerIds.forEach(async aId => {
//         const ApDocRef = db.collection('users').doc(eventOrganizerId)
//             .collection('events').doc(eventId)
//             .collection('conversations').doc(aId)

//         if (!ApDocRef.exists) {
//             await ApDocRef.set({ aId })
//         }
        
//         await ApDocRef.collection('messages').add({
//             image,
//             dateTimeSent: new Date(),
//             senderId,
//             system: false
//         })
//     })
    
// }

export async function updateMostRecentEvent(userId, chatPartnerId) {

    const sortedIds = [userId, chatPartnerId].sort()

    const ApDocRef = db.collection('conversations').doc(`${sortedIds[0]}_${sortedIds[1]}`)

    const doc = await ApDocRef.get()

    if (!doc.exists) {
        await ApDocRef.set({ participants: sortedIds })
    }

    db.collection('conversations').doc(`${sortedIds[0]}_${sortedIds[1]}`).update({
        [userId]: new Date(),
        participants: sortedIds
    })  

}