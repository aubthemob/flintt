const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore()

// exports.createConversationCard = functions.firestore.document('users/{eventOrganizerId}/events/{eventId}/conversations/{conversationId}')
//     .onCreate(async (snapshot, context) => {

//         // create a card for the eventOrganizer
//         db.collection('users').doc(context.params.eventOrganizerId)
//         .collection('cards').add({
//             eventId: context.params.eventId,
//             eventOrganizerId: context.params.eventOrganizerId,
//             accountabilityPartnerId: context.params.conversationId,
//             conversationId: context.params.conversationId,
//             visible: false,
//             type: 'conversation'
//         })

//         // create a card for the accountabilityPartner
//         db.collection('users').doc(context.params.conversationId)
//         .collection('cards').add({
//             eventId: context.params.eventId,
//             eventOrganizerId: context.params.eventOrganizerId,
//             accountabilityPartnerId: context.params.conversationId,
//             conversationId: context.params.conversationId,
//             visible: false,
//             type: 'conversation'
//         })

    // })

// exports.createCard = functions.firestore.document('users/{eventOrganizerId}/events/{eventId}')
//     .onCreate(async (snapshot, context) => {

//         const accountabilityPartnerIds = snapshot.data().accountabilityPartners
//         // create a card for the eventOrganizer

//         db.collection('users').doc(context.params.eventOrganizerId)
//         .collection('cards').doc(context.params.eventId).set({
//             eventId: context.params.eventId,
//             eventOrganizerId: context.params.eventOrganizerId,
//             accountabilityPartnerIds,
//             visible: false,
//             type: 'conversation'
//         })

//         // create a card for EACH accountabilityPartner
//         accountabilityPartnerIds.map(i => {
//             db.collection('users').doc(i)
//             .collection('cards').doc(context.params.eventId).set({
//                 eventId: context.params.eventId,
//                 eventOrganizerId: context.params.eventOrganizerId,
//                 accountabilityPartnerId: context.params.conversationId,
//                 visible: false,
//                 type: 'conversation'
//             })

//         })

//     })

    // Create a notification


// NOT NECESSARY ANYMORE
// exports.cardTaskRunner = functions.pubsub
//     .schedule('* * * * *').onRun(async context => {
//         const now = admin.firestore.Timestamp.now()
//         const inTwelveHoursInSeconds = now + ( 60*60*12 )
//         const inTwelveHoursInMillis = inTwelveHoursInSeconds * 1000
//         const query = db.collectionGroup('events')
//             .where('startDateTime', '<=', admin.firestore.Timestamp.fromMillis(inTwelveHoursInMillis))
//             .where('cardVisible', '==', false)
        
//         const events = await query.get()

//         const jobs = []
//         events.docs.forEach(snapshot => {
//             const { worker, options } = snapshot.data()
//             const job = cardWorkers[worker](options)
//                 // .then(() => snapshot.ref.update({ status: 'complete' }))
//                 .catch(() => snapshot.ref.update({ status: 'error' }))
//             jobs.push(job)
//         })
//         return await Promise.all(jobs)
//     })

// const cardWorkers = {
//     createCard: ({ eventOrganizerId, eventId }) => (
//         db.collection('users').doc(eventOrganizerId)
//         .collection('events').doc(eventId).update({
//             cardVisible: true
//         })
//     )
// }

// exports.userCompletedActivity = functions.storage.object().onFinalize(async (object) => {
//     const pathArr = object.name.split('/')
//     if(pathArr[0] === 'event-selfies') {
//         const userId = pathArr[1]
//         const eventId = pathArr[2]

//         const eventRef = db.collection('users').doc(userId)
//             .collection('events').doc(eventId)
//         const event = await eventRef.get()

//         const userSnapshot = await db.collection('users').doc(userId).get()
//         const userName = userSnapshot.data().displayName
//         accountabilityPartnerIds = event.accountabilityPartners

//         // send system message congratulating user + image to each AP conversation
//         accountabilityPartnerIds.forEach(aId => (
//             eventRef.collection('conversations').doc(aId).collection('messages').add({
//                 messageContent: `${userName} did it!`,
//                 image: object.name,
//                 dateTimeSent: new Date(),
//                 system: true
//             })
//         ))
//     }

// })