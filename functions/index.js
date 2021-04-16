const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const firebase = require('firebase')
admin.initializeApp();

// const cards = require('./cards')
const images = require('./images')
const events = require('./events')
const pushNotifications = require('./pushNotifications')
const mail = require('./mail')

exports.resizeAvatar = images.resizeAvatar

// events
exports.handleDeleteEvent = events.handleDeleteEvent
// exports.createConversationSubcollections = events.createConversationSubcollections
exports.createRecurringEventsOnCreate = events.createRecurringEventsOnCreate
exports.createRecurringEventInAWeek = events.createRecurringEventInAWeek

// push notifications
exports.sendIfDeliveryTimeHasPassed = pushNotifications.sendIfDeliveryTimeHasPassed
exports.pushNotificationsTaskRunner = pushNotifications.pushNotificationsTaskRunner
exports.updateNotificationOnEventEdit = pushNotifications.updateNotificationOnEventEdit
exports.deleteNotificationOnEventDelete = pushNotifications.deleteNotificationOnEventDelete
exports.sendOnboardingNotification = pushNotifications.sendOnboardingNotification
exports.createAssociatedNotificationsOnEventCreate = pushNotifications.createAssociatedNotificationsOnEventCreate
exports.createFirstFriendNotificationOnUserCreate = pushNotifications.createFirstFriendNotificationOnUserCreate
exports.createNewMessageNotificationOnMessageCreate = pushNotifications.createNewMessageNotificationOnMessageCreate
exports.createAccountabilityPartnerNudgeNotificationOnCreateEvent = pushNotifications.createAccountabilityPartnerNudgeNotificationOnCreateEvent
exports.setBlockSendToTrue = pushNotifications.setBlockSendToTrue
exports.sendDailyActivitiesOverviewNotification = pushNotifications.sendDailyActivitiesOverviewNotification
exports.createNewFriendAddedNotification = pushNotifications.createNewFriendAddedNotification

exports.sendWelcomeMail = mail.sendWelcomeMail
exports.sendFirstEventReminder = mail.sendFirstEventReminder