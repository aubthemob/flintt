import React from 'react'
import { Image } from 'react-native'
import { Avatar } from 'react-native-paper';

import theme from '../styles/theme'

export const POPULAR_ACTIVITIES = [
    
    {
        icon: 'emoticon-happy',
        activity: 'Meditate' ,
        habit: 'mindfulness',
        // simple: 'meditate',
        // progressive: 'meditating',
        // key: 'meditate',
        // past: 'meditated',
        // session: 'meditation session'
    },
    {
        icon: 'emoticon-happy',
        activity: 'Journal' ,
        habit: 'mindfulness',
        // simple: 'meditate',
        // progressive: 'meditating',
        // key: 'meditate',
        // past: 'meditated',
        // session: 'meditation session'
    },
    {
        icon: 'food-apple',
        activity: 'Eat fruit' ,
        habit: 'nutrition',
        // simple: 'eat a healthy meal',
        // progressive: 'eating a healthy meal',
        // key: 'eat-healthy',
        // past: 'ate a healthy meal',
        // session: 'healthy meal'
    },
    {
        icon: 'food-apple',
        activity: 'Eat a salad' ,
        habit: 'nutrition',
        // simple: 'eat a healthy snack',
        // progressive: 'eating a healthy snack',
        // key: 'fruit',
        // past: 'ate a healthy snack',
        // session: 'healthy snack'
    },
    {
        icon: 'food-apple',
        activity: 'Meal prep' ,
        habit: 'nutrition',
        // simple: 'meal prep',
        // progressive: 'meal prepping',
        // key: 'meal-prep',
        // past: 'meal prepped',
        // session: 'meal prep'
    },
    {
        icon: 'food-apple',
        activity: 'Grocery shop' ,
        habit: 'nutrition',
        // simple: 'meal prep',
        // progressive: 'meal prepping',
        // key: 'meal-prep',
        // past: 'meal prepped',
        // session: 'meal prep'
    },
    {
        icon: 'run',
        activity: 'Bike',
        habit: 'exercise',
        // simple: 'go biking',
        // progressive: 'going biking',
        // key: 'bike',
        // past: 'went biking',
        // session: 'bike ride'
    },
    {
        icon: 'run',
        activity: 'Do yoga' ,
        habit: 'exercise',
        // habit: 'exercise',
        // progressive: 'doing yoga',
        // key: 'yoga',
        // past: 'did yoga',
        // session: 'yoga session'
    },
    {
        icon: 'run',
        activity: 'Home workout' ,
        habit: 'exercise',
        // simple: 'do a home workout',
        // progressive: 'doing a home workout',
        // key: 'home-workout',
        // past: 'did a home workout',
        // session: 'home workout session'
    },
    {
        icon: 'run',
        activity: 'Stretch' ,
        habit: 'exercise',
        // simple: 'stretch',
        // progressive: 'stretching',
        // key: 'stretch',
        // past: 'stretched',
        // session: 'stretching session'
    },
    {
        icon: 'run',
        activity: 'Run' ,
        habit: 'exercise',
        // simple: 'stretch',
        // progressive: 'stretching',
        // key: 'stretch',
        // past: 'stretched',
        // session: 'stretching session'
    },
    {
        icon: 'run',
        activity: 'HIIT training' ,
        habit: 'exercise',
        // simple: 'do a HIIT training',
        // progressive: 'doing a HIIT training',
        // key: 'HIIT',
        // past: 'did a HIIT training',
        // session: 'HIIT training session'
    },
    {
        icon: 'power-sleep',
        activity: 'Go to bed' ,
        habit: 'sleep',
        // simple: 'go to bed',
        // progressive: 'going to bed',
        // key: 'go-to-bed',
        // past: 'went to bed',
        // session: 'bedtime'
    },
    {
        icon: 'power-sleep',
        activity: 'Wake up' ,
        habit: 'sleep',
        // simple: 'go to bed',
        // progressive: 'going to bed',
        // key: 'go-to-bed',
        // past: 'went to bed',
        // session: 'bedtime'
    },
    {
        icon: 'emoticon-happy',
        activity: 'Read' ,
        habit: 'mindfulness',
        // simple: 'go to bed',
        // progressive: 'going to bed',
        // key: 'go-to-bed',
        // past: 'went to bed',
        // session: 'bedtime'
    },
]

export const HABITS = [
    {
        habit: 'exercise',
        icon: 'run'
    },
    {
        habit: 'nutrition',
        icon: 'food-apple'
    },
    {
        habit: 'mindfulness',
        icon: 'emoticon-happy'
    },
    {
        habit: 'sleep',
        icon: 'power-sleep'
    },

]

export const returnActivitySimple = key => {
    const activitySimple = ACTIVITIES.find(a => a.key === key).simple
    return activitySimple
}