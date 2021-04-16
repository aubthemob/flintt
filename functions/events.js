const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore()
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc') // dependent on utc plugin
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)


exports.handleDeleteEvent = functions.firestore.document('/users/{userId}/events/{eventId}')
    .onDelete(async (snapshot, context) => {

        // delete all related tracking cards
        db.collection('users').doc(context.params.userId)
        .collection('cards').doc(context.params.eventId).delete()

        // add a system message to all related conversation cards saying the event was deleted
    })

// exports.createConversationSubcollections = functions.firestore.document('users/{eventOrganizerId}/events/{eventId}')
//     .onCreate(async (snapshot, context) => {

//     const accountabilityPartners = snapshot.data().accountabilityPartners
//     const query = await db.collection('users').doc(context.params.eventOrganizerId).get()
//     const eventOrganizerName = query.data().displayName

//     accountabilityPartners.forEach(ap => {
//         // create a conversation subcollection with the accountability partner as the document ids
//         db.collection('users').doc(context.params.eventOrganizerId)
//             .collection('events').doc(context.params.eventId)
//             .collection('conversations').doc(ap).set({ accountabilityPartnerId: ap })

//         db.collection('users').doc(context.params.eventOrganizerId)
//             .collection('events').doc(context.params.eventId)
//             .collection('conversations').doc(ap)
//             .collection('messages').add({
//                 messageContent: `${eventOrganizerName} committed to an activity`,
//                 dateTimeSent: new Date(),
//                 system: true
//             })
        
//     })

// })

// RECURRING ACTIVITIES

exports.createRecurringEventsOnCreate = functions.firestore.document('users/{eventOrganizerId}/events/{eventId}')
    .onCreate(async (snapshot, context) => {
        
        const frequency = snapshot.data().frequency
        const originalEvent = snapshot.data().originalEvent

        if (frequency.length > 0 && originalEvent === true) {

            const startDateTime = dayjs.unix(snapshot.data().startDateTime.seconds)
            const endDateTime = dayjs.unix(snapshot.data().endDateTime.seconds)
            const startDay = dayjs(startDateTime).tz(snapshot.data().timezone).day()

                const recurringDateTimesArr = frequency.map(i => {
                    const day = Number(i)

                    if (day < startDay) {
                        const diff = startDay - day
                        const numberToAdd = 7 - diff
                        const newStartDateTime = startDateTime.add(numberToAdd, 'day')
                        const newEndDateTime = endDateTime.add(numberToAdd, 'day')
                        return { startDateTime: newStartDateTime.toDate(), endDateTime: newEndDateTime.toDate() }
                    } else if (day > startDay) {
                        const numberToAdd = day - startDay
                        const newStartDateTime = startDateTime.add(numberToAdd, 'day')
                        const newEndDateTime = endDateTime.add(numberToAdd, 'day')
                        return { startDateTime: newStartDateTime.toDate(), endDateTime: newEndDateTime.toDate() }
                    } else if (day === startDay) {
                        const newStartDateTime = startDateTime.add(7, 'day')
                        const newEndDateTime = endDateTime.add(7, 'day')
                        return { startDateTime: newStartDateTime.toDate(), endDateTime: newEndDateTime.toDate() }
                    }
                })
        
                const recurringEventsArr = recurringDateTimesArr.map(i => {

                    const dataToAdd = {
                        startDateTime: i.startDateTime,
                        endDateTime: i.endDateTime,
                        originalEvent: false
                    }

                    const newEvent = Object.assign(snapshot.data(), dataToAdd)
                    return db.collection('users').doc(context.params.eventOrganizerId)
                        .collection('events').add(newEvent)
                })

                return await Promise.all(recurringEventsArr)

        }

    })

// schedule new recurring events every day (in a week from today)
exports.createRecurringEventInAWeek = functions.pubsub
    .schedule('0 0 * * *').onRun(async context => { // make this midnight every night

        const currentDay = String(dayjs().day())
        
        const currentTimestampDate = dayjs().toDate()

        const inTwentyFourHoursTimestamp = dayjs().add(24, 'h')
        const inTwentyFourHoursTimestampDate = inTwentyFourHoursTimestamp.toDate()

        // query for recurring events occurring today
        const query = db.collectionGroup('events').where('frequency', 'array-contains', currentDay)
            .where('startDateTime', '>=', currentTimestampDate)
            .where('startDateTime', '<=', inTwentyFourHoursTimestampDate)

        const res = await query.get()

        const eventsOccuringAWeekFromToday = res.docs.map(i => {

            const currentStartDateTime = dayjs.unix(i.data().startDateTime.seconds) 
            const currentEndDateTime = dayjs.unix(i.data().endDateTime.seconds)

            const newStartDateTime = currentStartDateTime.add(7, 'day').toDate()
            const newEndDateTime = currentEndDateTime.add(7, 'day').toDate()

            const dataToModifyInEvent = {
                startDateTime: newStartDateTime,
                endDateTime: newEndDateTime,
                originalEvent: false
            }

            const newEvent = Object.assign(i.data(), dataToModifyInEvent)

            return db.collection('users').doc(i.data().userId)
                .collection('events').add(newEvent)

        })

        return await Promise.all(eventsOccuringAWeekFromToday)
        
    })