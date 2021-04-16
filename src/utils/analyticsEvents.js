import * as Analytics from 'expo-firebase-analytics'
import { getEventsService } from '../services/events'
import dayjs from 'dayjs'

export const signupEvent = (signupCode) => {
    Analytics.logEvent('signup', {
        signupCode
    })
}

export const addFriendButtonEvent = (screen) => {
    Analytics.logEvent('add_friend_button_pressed', {
        screen,
    })
}

export const addFriendFormSubmitEvent = (screen, friendId, flow) => {
    Analytics.logEvent('add_friend_form_submitted', {
        screen,
        friendId,
        flow
    })
}

export const calendarCellPressEvent = () => {
    Analytics.logEvent('calendar_cell_pressed', {})
}

export const calendarEventPressEvent = () => {
    Analytics.logEvent('calendar_event_pressed', {})
}

export const scheduleActivityFormSubmitEvent = (activityId, startDateTime, endDateTime, accountabilityPartners, friends, editMode) => {

    const accountabilityPartnersCount = accountabilityPartners.length
    const friendsCount = friends.length
    const mode = editMode ? 'edit' : 'create'
    const duration = endDateTime.diff(startDateTime, 'minute', false)
    const dayOfWeek = startDateTime.day()
    const hourOfDay = startDateTime.hour()
    const minuteOfDay = startDateTime.minute()
    
    Analytics.logEvent('schedule_activity_form_submitted', {
        activityId,
        accountabilityPartnersCount,
        friendsCount,
        mode,
        duration,
        dayOfWeek,
        hourOfDay,
        minuteOfDay
    })
}

export const deleteEventButtonPressEvent = (activityId) => {
    Analytics.logEvent('delete_event_button_pressed', {
        activityId
    })
}

export const doneActivityButtonPressEvent = (activity, startDateTime, endDateTime, accountabilityPartners, previousStatus) => {

    const accountabilityPartnersCount = accountabilityPartners.length
    const duration = endDateTime.diff(startDateTime, 'minute', false)
    const timeFromEndDateTime = endDateTime.diff(dayjs(), 'minute', false)
    const dayOfWeek = startDateTime.day()
    const hourOfDay = startDateTime.hour()
    const minuteOfDay = startDateTime.minute()

    Analytics.logEvent('done_activity_button_pressed', {
        activity,
        accountabilityPartnersCount,
        duration,
        timeFromEndDateTime,
        dayOfWeek,
        hourOfDay,
        minuteOfDay,
        previousStatus
    })
}

export const snoozeActivityButtonPressEvent = (activityId, startDateTime, endDateTime, accountabilityPartners, previousStatus) => {

    const accountabilityPartnersCount = accountabilityPartners.length
    const duration = endDateTime.diff(startDateTime, 'minute', false)
    const timeFromEndDateTime = endDateTime.diff(dayjs(), 'minute', false)
    const dayOfWeek = startDateTime.day()
    const hourOfDay = startDateTime.hour()
    const minuteOfDay = startDateTime.minute()

    Analytics.logEvent('snooze_activity_button_pressed', {
        activityId,
        accountabilityPartnersCount,
        duration,
        timeFromEndDateTime,
        dayOfWeek,
        hourOfDay,
        minuteOfDay,
        previousStatus
    })
}

export const chatButtonPressEvent = (cardPerspective) => {
    Analytics.logEvent('chat_button_pressed', {
        cardPerspective
    })
}

export const chatPartnerSwipeEvent = () => {
    Analytics.logEvent('chat_partner_swipe', {})
}

export const sendMessageButtonPressEvent = (message, friendId) => {

    const messageLength = message.length

    Analytics.logEvent('send_message_button_pressed', {
        message,
        messageLength,
        friendId
    })
}

export const changePhotoButtonPressEvent = (userId, friends) => {

    const events = getEventsService(userId)
    const eventsCount = events.length
    const friendsCount = friends.length

    Analytics.logEvent('change_photo_button_pressed', {
        friendsCount,
        eventsCount 
    })
}
