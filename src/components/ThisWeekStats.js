import React, { useEffect, useState } from 'react'
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Lib
import * as firebase from 'firebase'
import { db } from '../lib/firebase'
import dayjs from 'dayjs'
const countBy = require('lodash.countby') 

import { AnimatedCircularProgress } from 'react-native-circular-progress'

// Style
import { ActivityIndicator, Avatar } from 'react-native-paper'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'
import { HABITS } from '../utils/activities'
import theme from '../styles/theme'

export default function ThisWeekStats({ navigateToCalendarScreen, profileUserId, perspective, weeklyCompletionRate }) {

    // const [weeklyCompletionRate, setWeeklyCompletionRate] = useState([])

    const { user } = useUserState()

    const startOfThisWeekInMillis = +dayjs().subtract(1, 'd').startOf('week').add(1, 'd')
    const startOfThisWeek = new firebase.firestore.Timestamp.fromMillis(startOfThisWeekInMillis)

    const endOfThisWeekInMillis = +dayjs().subtract(1, 'd').endOf('week').add(1, 'd')
    const endOfThisWeek = new firebase.firestore.Timestamp.fromMillis(endOfThisWeekInMillis)

    // useEffect(() => {

    //     setLoading(true)
        
    //     const unsubscribe = db.collection('users').doc(profileUserId)
    //         .collection('events')
    //         .where('startDateTime', '<=', endOfThisWeek)
    //         .where('startDateTime', '>', startOfThisWeek)
    //         .onSnapshot(snapshot => {
    //             const rawEvents = snapshot.docs.map(s => ({
    //                     // activity: s.data().activity,
    //                     habit: s.data().habit,
    //                     status: s.data().status
    //                 }))

    //             const totalsObj = countBy(rawEvents.map(l => l.habit))
    //             const completesObj = countBy(rawEvents.filter(l => l.status === 'complete').map(l => l.habit))
            
    //             const newWeeklyCompletionRate = {}
    //             // let newTotalsArr = []
    //             // let newCompletesArr = []
            
    //             for (const [key, value] of Object.entries(totalsObj)) {

    //                 newWeeklyCompletionRate[key] = (completesObj[key]/value)*100 || 5 // 5 is a small amount to show progress

    //             }

    //             setWeeklyCompletionRate(newWeeklyCompletionRate)

    //             setLoadingFour(false)
                
    //         })
        
    //     return unsubscribe

    // }, [])

    return (
        <>
            {/* COMPLETION RATE PER HABIT FOR THE WEEK */}

            <Text>
                This week
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around'
                }}
            >
                {
                    HABITS.map((h, i) => (
                        <View
                            key={i}
                        >
                            {
                                <View>
                                    
                                    {
                                        weeklyCompletionRate[h.habit] ?
                                            <AnimatedCircularProgress
                                                size={60}
                                                width={4}
                                                fill={weeklyCompletionRate[h.habit]}
                                                tintColor={theme.colors.primary}
                                                lineCap='round'
                                                backgroundColor="transparent" 
                                                rotation={0}
                                                duration={750}
                                                renderCap={({ center }) => <Avatar.Icon icon={h.icon} style={styles.weeklyCompletionIcon} size={56} color={theme.colors.text} />}
                                            />
                                            :
                                            <Avatar.Icon icon={h.icon} style={styles.weeklyCompletionIcon} size={56} color={'#D5D5D5'}  />
                                    }
                                </View>
                            }
                        </View>
                    ))
                }
            </View>
                
        </>
    )

    }

const styles = StyleSheet.create({
    weeklyCompletionIcon: {
        backgroundColor: 'transparent',
        marginTop: 2,
        marginLeft: 2
    }
})

