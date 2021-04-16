import dayjs from 'dayjs'
const orderBy = require('lodash.orderby')
const uniq = require('lodash.uniq')

import { ACHIEVEMENTS } from './achievements'

export const isEarliestEventToday = (itemId, events) => {
    const todayStart = dayjs().startOf('day')
    const yesterdayStart = dayjs().subtract(1, 'd').startOf('day')

    const earliestEventTodayId = events.find(f => f.startDateTime >= todayStart) && events.find(f => f.startDateTime >= todayStart).eventId 
    const earliestEventYesterdayId = events.find(f => f.startDateTime >= yesterdayStart).eventId
    
    if (itemId === earliestEventTodayId) {
        return 'today'
    } else if (itemId === earliestEventYesterdayId) {
        return 'yesterday'
    } 
}

export const checkAndSetFire = (allEvents, activity, eventId) => {
    const allEventsOfThisActivity = allEvents.filter(a => a.activity === activity)
    const sortedEvents = orderBy(allEventsOfThisActivity, ['startDateTime'], ['asc'])
    const indexOfCurrentActivity = sortedEvents.findIndex(e => e.id === eventId)
    const eventsUpToThisActivity = sortedEvents.slice(0, indexOfCurrentActivity)
    const lastTwoEvents = orderBy(eventsUpToThisActivity, ['startDateTime'], ['desc']).map(i => i.status).slice(0, 2)
    const newIsOnFire = lastTwoEvents.length === 2 && uniq(lastTwoEvents).length === 1 && uniq(lastTwoEvents)[0] === 'complete'
    return newIsOnFire
}

export const checkAndSetAchievement = (allEvents, habit, startDateTime) => {
    const eventsOfThisHabit = allEvents.filter(a => a.habit === habit && a.status === 'complete' && a.startDateTime < startDateTime.endOf('day'))
    const totalCompletedOfThisHabit = eventsOfThisHabit.length
    const currentAchievement = ACHIEVEMENTS.find(a => a.qty === totalCompletedOfThisHabit)
    const newAchievement = currentAchievement ? currentAchievement.symbol : ''

    return newAchievement
}

export const willBeAchievement = (allEvents, habit) => {
    const eventsOfThisHabit = allEvents.filter(a => a.habit === habit && a.status === 'complete' && a.startDateTime < dayjs().endOf('day'))
    const totalNewCompletedOfThisHabit = eventsOfThisHabit.length + 1
    const currentAchievement = ACHIEVEMENTS.find(a => a.qty === totalNewCompletedOfThisHabit)
    const newAchievement = currentAchievement ? currentAchievement.symbol : ''

    return newAchievement
}

export const willBeOnFire = (allEvents, activity, eventId) => {
    const allEventsOfThisActivity = allEvents.filter(a => a.activity === activity)
    const indexOfCurrentActivity = allEventsOfThisActivity.findIndex(e => e.eventId === eventId)
    const eventsUpToThisActivity = orderBy(allEventsOfThisActivity, ['startDateTime'], ['asc']).slice(0, indexOfCurrentActivity)
    const lastTwoEvents = orderBy(eventsUpToThisActivity, ['startDateTime'], ['desc']).map(i => i.status).slice(0, 2)
    const newIsOnFire = lastTwoEvents.length === 2 && uniq(lastTwoEvents).length === 1 && uniq(lastTwoEvents)[0] === 'complete'
    return newIsOnFire
}