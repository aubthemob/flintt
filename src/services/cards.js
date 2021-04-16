import { db } from '../lib/firebase'
import dayjs from 'dayjs'
import { Alert } from 'react-native'

const startOfToday = dayjs().startOf('day').toDate()
const startOfTomorrow = dayjs().add(1, 'day').startOf('day').toDate()

export async function getUsersEventsService(userId) {
    const snapshot = await db.collection(`users/${userId}/events`)
        .where('startDateTime', '>=', startOfToday)
        .where('startDateTime', '<=', startOfTomorrow)
        .get()
    const data = snapshot.docs.map(d => ({
        ...d.data(),
        startDateTime: dayjs.unix(d.data().startDateTime.seconds),
        endDateTime: dayjs.unix(d.data().endDateTime.seconds),
        eventId: d.id
    }))
    return data
}

export async function getApEventsService(userId) {
    const snapshot = await db.collectionGroup(`events`)
        .where('accountabilityPartners', 'array-contains', userId)
        .where('startDateTime', '>=', startOfToday)
        .where('startDateTime', '<=', startOfTomorrow)
        .get()
        const data = snapshot.docs.map(d => ({
            ...d.data(),
            startDateTime: dayjs.unix(d.data().startDateTime.seconds),
            endDateTime: dayjs.unix(d.data().endDateTime.seconds),
            eventId: d.id
        }))
    return data
}

export async function setCardVisibleFalse(userId, cardId) {
    return await db.collection('users').doc(userId)
    .collection('cards').doc(cardId)
    .update({ visible: false })
}

export async function setCardVisibleTrue(accountabilityPartnerId, eventOrganizerId, eventId) {
    
    [accountabilityPartnerId, eventOrganizerId].forEach(async i => {

        try {
            const snapshot = await db.collection('users').doc(i)
                .collection('cards').where('eventId', '==', eventId)
                .where('accountabilityPartnerId', '==', accountabilityPartnerId).get()
            
            const data = snapshot.docs.map(d => ({
                // ...d.data(),
                cardId: d.id
            }))
    
            const cardId = data[0].cardId
    
    
            db.collection('users').doc(i)
                .collection('cards').doc(cardId)
                .update({ visible: true })
        } catch(err) {
            console.log(err)
            Alert.alert(err.message)
        }


    })

}

// export async function setConversationCardsVisible(userId, eventId, accountabilityPartnerIds) {

//     // set each AP conversation card to visible
//     const ApPromises = accountabilityPartnerIds.map(aId => {
//         return db.collection('users').doc(aId).collection('cards')
//             .where('eventId', '==', eventId).get()
//     })

//     const ApCards = await Promise.all(ApPromises)
//     let ApCardIds = ApCards.map(c => c.docs.map(i => i.id))
//     ApCardIds = ApCardIds.flat()

//     // below seems sketchy: will the card always line up with the AP index?
//     ApCardIds.forEach((c, i) => {
//         db.collection('users').doc(accountabilityPartnerIds[i])
//             .collection('cards').doc(c)
//             .update({ visible: true })
//     })

//     // set the user's conversation cards with each AP to visible
//     const userCards = await db.collection('users').doc(userId).collection('cards')
//         .where('type', '==', 'conversation')
//         .where('eventId', '==', eventId).get()

//     const userCardIds = userCards.docs.map(c => c.id)
    
//     userCardIds.forEach(c => {
//         db.collection('users').doc(userId)
//             .collection('cards').doc(c)
//             .update({ visible: true })
//     })
        
// }