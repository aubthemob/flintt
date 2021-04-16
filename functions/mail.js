const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore()
const sgMail = require('@sendgrid/mail')
const cors = require("cors")({
    origin: true
})

const API_KEY = functions.config().sendgrid.key
const WELCOME_EMAIL_TEMPLATE_ID = functions.config().sendgrid.welcometemplate
const FIRST_ACTIVITY_SCHEDULE_REMINDER_TEMPLATE_ID = functions.config().sendgrid.firstactivitytemplate

sgMail.setApiKey(API_KEY)

exports.sendWelcomeMail = functions.auth.user().onCreate(user => {

        const msg = {
            to: user.email,
            from: 'aubrey@flintt.co',
            templateId: WELCOME_EMAIL_TEMPLATE_ID
        }
    
        return sgMail.send(msg)

})

exports.sendFirstEventReminder = functions.pubsub
    .schedule('0 13 * * 3').onRun(async context => { 

        const noEventsUsersQuery = db.collectionGroup('users').where('hasEvents', '==', false)

        const noEventsUsersRes = await noEventsUsersQuery.get()
        
        const noEventsUsers = noEventsUsersRes.docs.map(u => {

            const id = { id: u.id }
            const data = u.data()

            const returnObj = Object.assign(id, data)
            return returnObj

        })

        if (noEventsUsers.length > 0) {
    
            try {
                const emails = noEventsUsers.map(user => user.email)
                
                const msg = {
                    to: emails,
                    from: 'aubrey@flintt.co',
                    templateId: FIRST_ACTIVITY_SCHEDULE_REMINDER_TEMPLATE_ID
                }

                sgMail.sendMultiple(msg)
                
            } catch(err) {
                console.log(err)
                if (err.response) {
                    console.error(error.response.body)
                }
            }
    
        }
        
    })