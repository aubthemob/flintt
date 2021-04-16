import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native'

// Lib
import * as firebase from 'firebase'
import { db } from '../lib/firebase'
import dayjs from 'dayjs'
const groupBy = require('lodash.groupby')
const uniq = require('lodash.uniq')

import { VictoryChart, VictoryGroup, VictoryLine, VictoryScatter, VictoryBar, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory-native'

import { ActivityIndicator, Avatar, IconButton } from 'react-native-paper'
import theme from '../styles/theme'

import { HABITS } from '../utils/activities'
import { windowWidth } from '../utils/dimensions'
import { ACHIEVEMENTS } from '../utils/achievements'

export default function AllTimeStats({ profileUserId, navigateToCalendarScreen, perspective, totalsData, upperBound, completionRateData }) {

    // const [totalsData, setTotalsData] = useState({
    //     exercise: [],
    //     nutrition: [],
    //     mindfulness: [],
    //     sleep: [],
    // })
    // const [completionRateData, setCompletionRateData] = useState({
    //     exercise: [],
    //     nutrition: [],
    //     mindfulness: [],
    //     sleep: [],
    // })

    const [selectedHabit, setSelectedHabit] = useState('exercise')
    const [graphType, setGraphType] = useState('totals')

    // const [upperBound, setUpperBound] = useState({
    //     exercise: 5,
    //     nutrition: 5,
    //     mindfulness: 5,
    //     sleep: 5,
    // })

    // const startOfNextWeekInMillis = +dayjs().subtract(1, 'd').endOf('week').add(1, 'd')
    // const startOfNextWeek = new firebase.firestore.Timestamp.fromMillis(startOfNextWeekInMillis)

    // const startOfThisWeekInMillis = +dayjs().subtract(1, 'd').startOf('week').add(1, 'd')
    // const startOfThisWeek = new firebase.firestore.Timestamp.fromMillis(startOfThisWeekInMillis)

    // useEffect(() => {

    //     setLoading(true)
    //     const unsubscribe = db.collection('users').doc(profileUserId)
    //         .collection('events')
    //         .where('startDateTime', '<', startOfNextWeek)
    //         .onSnapshot(snapshot => {
    //             setEventsLoading(true)
    //             const rawEvents = snapshot.docs.map(s => ({
    //                     habit: s.data().habit,
    //                     status: s.data().status,
    //                     startDateTime: s.data().startDateTime,
    //                     endDateTime: s.data().endDateTime
    //                 }))

    //             const eventsWithWeek = rawEvents.map(r => {
    //                 const startInDayjs = dayjs.unix(r.startDateTime.seconds)
    //                 const weekStart = startInDayjs.subtract(1, 'd').startOf('week').add(1, 'd').unix()
    //                 r.weekStart = weekStart
    //                 return r
    //             })

    //             const thisWeekStart = startOfThisWeekInMillis/1000
                
    //             const eventsGroupedByHabit = groupBy(eventsWithWeek, 'habit')

    //             const completionRatesByHabit = {}
    //             const totalsByHabit = {}

    //             let earliestEventDayStart
    //             let earliestEventWeekStart
            
    //             for (const [key, value] of Object.entries(eventsGroupedByHabit)) {

    //                 const eventsSortedByWeek = value.map(e => e.weekStart).sort()
    //                 earliestEventWeekStart = eventsSortedByWeek[0]

    //                 const oneWeekInSeconds = 60*60*24*7

    //                 const totalCompleted = []
    //                 const completionRates = []

    //                 const runningTotalsObj = {}

    //                 const daysSinceFirstEvent = dayjs().diff(dayjs.unix(earliestEventWeekStart), 'day')
                    
    //                 for (let weekStart = earliestEventWeekStart; weekStart <= thisWeekStart; weekStart += oneWeekInSeconds) {
    //                     const nextWeekStart = weekStart + oneWeekInSeconds
    //                     const eventsThisWeek = value.filter(v => v.startDateTime.seconds > weekStart && v.endDateTime.seconds < nextWeekStart)
                        
    //                     const weekName = dayjs.unix(weekStart).format('MMM D')
                        
    //                     const eventsCompletedThisWeek = eventsThisWeek.filter(e => e.status === 'complete')
    //                     const totalEventsCompletedThisWeek = eventsCompletedThisWeek.length
                        
    //                     const totalEventsScheduledThisWeek = eventsThisWeek.length
    //                     const completionRateOfEventsThisWeek = totalEventsCompletedThisWeek/totalEventsScheduledThisWeek || 0

    //                     const completionRateObj = { 'Completion rate': completionRateOfEventsThisWeek, 'Week': weekName }
    //                     completionRates.push(completionRateObj)

    //                     if (daysSinceFirstEvent <= 6 && totalEventsCompletedThisWeek !== 0) {

    //                         // loop through events completed this week and create objects for each one
    //                         const valueWithDayStart = value.map(v => ({
    //                             ...v,
    //                             dayStart: dayjs.unix(v.startDateTime.seconds).startOf('day').unix()
    //                         }))

    //                         const eventsSortedByDay = valueWithDayStart.map(e => e.dayStart).sort()
    //                         earliestEventDayStart = eventsSortedByDay[0]

    //                         const todayStart = dayjs().startOf('day').unix()
    //                         const oneDayInSeconds = 60*60*24
                            
    //                         // do the exact same loop as per week but per day
                            
    //                         for (let dayStart = earliestEventDayStart; dayStart <= todayStart; dayStart += oneDayInSeconds) {
    //                             const nextDayStart = dayStart + oneDayInSeconds
    //                             const eventsThisDay = value.filter(v => v.startDateTime.seconds > dayStart && v.endDateTime.seconds < nextDayStart)

    //                             const dayName = dayjs.unix(dayStart).format('ddd DD')
                                
    //                             const eventsCompletedThisDay = eventsThisDay.filter(e => e.status === 'complete')
    //                             const totalEventsCompletedThisDay = eventsCompletedThisDay.length

    //                             runningTotalsObj[key] = runningTotalsObj[key] + totalEventsCompletedThisDay || totalEventsCompletedThisDay
    //                             const cumulativeTotalObj = { 'Total': runningTotalsObj[key], 'Day': dayName }
    //                             totalCompleted.push(cumulativeTotalObj)

    //                         }

    //                     } else {
    //                         runningTotalsObj[key] = runningTotalsObj[key] + totalEventsCompletedThisWeek || totalEventsCompletedThisWeek
    //                         const cumulativeTotalObj = { 'Total': runningTotalsObj[key], 'Week': weekName }
    //                         totalCompleted.push(cumulativeTotalObj)
    //                     }

    //                 }

    //                 const oneDayEarlierThanFirstEventDayStartFormatted = dayjs.unix(earliestEventDayStart).subtract(1, 'd').format('ddd DD')
    //                 const oneWeekEarlierThanFirstEventWeekStartFormatted = dayjs.unix(earliestEventWeekStart).subtract(1, 'w').format('MMM D')
                    
    //                 completionRatesByHabit[key] = completionRates.length > 8 ? completionRates.slice(completionRates.length-7, completionRates.length+1) : completionRates // max 8 weeks, else the axis ticks overlap
    //                 totalsByHabit[key] = totalCompleted.length > 0 && totalCompleted.length <= 8 ?
    //                     Object.keys(totalCompleted[0]).includes('Day') ? 
    //                         [{ 'Day': oneDayEarlierThanFirstEventDayStartFormatted, 'Total': 0 }, ...totalCompleted] :
    //                         [{ 'Week': oneWeekEarlierThanFirstEventWeekStartFormatted, 'Total': 0 }, ...totalCompleted]
    //                         :
    //                         Object.keys(totalCompleted[0]).includes('Day') ? 
    //                         [{ 'Day': oneDayEarlierThanFirstEventDayStartFormatted, 'Total': 0 }, ...totalCompleted].slice(totalCompleted.length-7, totalCompleted.length+1) :
    //                         [{ 'Week': oneWeekEarlierThanFirstEventWeekStartFormatted, 'Total': 0 }, ...totalCompleted].slice(totalCompleted.length-7, totalCompleted.length+1)

    //             }

    //             const newUpperBounds = {}
    //             for (const [key, value] of Object.entries(totalsByHabit)) {

    //                 newUpperBounds[key] = value[value.length-1] ? 
    //                     Math.round(value[value.length-1]['Total']*1.25) > 5 ?
    //                     Math.round(value[value.length-1]['Total']*1.25) :
    //                     5 : 
    //                     5

    //             }
                
    //             setUpperBound(prevState => ({ ...prevState, ...newUpperBounds }))

    //             setTotalsData(prevState => ({ ...prevState, ...totalsByHabit }))
    //             setCompletionRateData(prevState => ({ ...prevState, ...completionRatesByHabit }))
    //             setLoadingFive(false)
                
    //         })
        
    //     return unsubscribe

    // }, [])

    const getLabel = datum => {

        const yVal = datum._y
        const xVal = datum._x

        const prevAchArr = ACHIEVEMENTS.filter(a => a.qty <= yVal).map(a => a.symbol)
        const symbol = prevAchArr[prevAchArr.length-1]
        
        const prevAchQtyArr = ACHIEVEMENTS.filter(a => a.qty <= yVal).map(a => a.qty)
        const prevAchQty = prevAchQtyArr[prevAchQtyArr.length-1]

        const weekInd = totalsData[selectedHabit].map(t => t['Total']).findIndex(t => t >= prevAchQty)+1

        const showSymbol = xVal === weekInd ? symbol : ''
        return showSymbol
    }

    return (
        <View
            style={{
                flex: 1
            }}
        >

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <View>
                    <Text>All time</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            // borderRadius: 24,
                            // borderWidth: 1
                            // borderWidth: 1,
                        }}  
                    >
                        {
                            HABITS.map((h, i) => (
                                <View
                                    key={i}
                                    style={ selectedHabit === h.habit ? styles.toggleSelected : styles.toggleUnselected }
                                >
                                    <IconButton 
                                        icon={h.icon} 
                                        // style={selectedHabit === h.habit ? styles.toggleSelected : styles.toggleUnselected} 
                                        size={24} 
                                        color={selectedHabit === h.habit ? 'white' : '#D5D5D5'} 
                                        onPress={() => setSelectedHabit(h.habit)}
                                    />
                                </View>
                            ))
                        }
                    </View>

                </View>
                <View
                    style={{
                        flexDirection: 'row'
                    }}
                >
                    <IconButton 
                        icon='percent'
                        onPress={() => setGraphType('completion-rate')}
                        style={graphType === 'completion-rate' ? styles.toggleSelected : styles.toggleUnselected}
                        color={graphType === 'completion-rate' ? 'white' : theme.colors.text}
                    />
                    <IconButton 
                        icon='check-all'
                        onPress={() => setGraphType('totals')}
                        style={graphType === 'totals' ? styles.toggleSelected : styles.toggleUnselected}
                        color={graphType === 'totals' ? 'white' : theme.colors.text}
                    />

                </View>

            </View>

            {
                Object.keys(completionRateData[selectedHabit]).length === 0 &&
                    <TouchableWithoutFeedback
                        onPress={() => perspective === 'current-user' && navigateToCalendarScreen()}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                alignSelf: 'center',
                                alignItems: 'center',
                                top: 150,
                                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                padding: 40,
                                zIndex: 5,
                                borderRadius: 36,
                                width: windowWidth*0.8
                            }}
                        >
                            <Text>NOT ENOUGH DATA YET</Text>
                            {
                                perspective === 'current-user' &&
                                    <Text>Press here to schedule something...</Text>
                            }

                        </View>
                    </TouchableWithoutFeedback>
            }

            {
                graphType === 'completion-rate' ? 
                    completionRateData[selectedHabit] && 
                        <VictoryChart
                            domainPadding={{ x: 15 }}
                            domain={{ y: [0, 1] }}
                            // width={windowWidth}
                            // padding={{ left: 100, right: 100 }}
                            animate={{
                                duration: 750,
                                easing: 'cubic'
                            }}
                            padding={55}
                        >
                            {
                                Object.keys(completionRateData[selectedHabit]).length !== 0 &&
                                    <VictoryBar 
                                        data={completionRateData[selectedHabit]}
                                        style={{ data: { fill: "#c43a31" } }}
                                        y="Completion rate"
                                        x="Week"
                                        barWidth={18}
                                        // animate={{
                                        //     duration: 500,
                                        // }}
                                        // cornerRadius={{ topLeft: 8, topRight: 8 }}
                                        // barRatio={0.8}
                                        // animate={{ duration: 500, easing: 'cubic' }}
                                    />
                            }
                            <VictoryAxis
                                label="Week"
                                tickFormat={(t, i) => Object.keys(totalsData[selectedHabit]).length !== 0 ? t : `Week ${i+1}`}
                                style={{
                                    axisLabel: { padding: 30 }
                                }}
                            />
                            <VictoryAxis dependentAxis
                                label="Completion rate"
                                tickFormat={(t) => `${t*100}%`}
                                style={{
                                    axisLabel: { padding: 40 }
                                }}
                            />
                        </VictoryChart> 
                    :
                    totalsData[selectedHabit] && 
                        <VictoryChart
                            domainPadding={{ x: 15 }}
                            domain={{ y: [0, upperBound[selectedHabit]] }}
                            padding={55}
                            animate={{ duration: 750, easing: 'cubic' }}
                        >
                            {
                                Object.keys(totalsData[selectedHabit]).length !== 0 &&
                                    <VictoryLine 
                                        data={totalsData[selectedHabit]}
                                        y="Total"
                                        x={totalsData[selectedHabit].length > 0 ? 
                                            Object.keys(totalsData[selectedHabit][0]).includes('Day') ? 'Day' : "Week"
                                            : 'Week'
                                        }
                                        labels={({ datum }) => getLabel(datum)}
                                        // labelComponent={
                                        //     Platform.OS === 'ios' &&
                                        //     <VictoryLabel 
                                        //         dy={12} 
                                        //         style={{ fontSize: 24 }} 
                                        //         // textAnchor="middle"
                                        //     />
                                        // }
                                        // animate={{ duration: 500, easing: 'cubic' }}
                                        // interpolation="linear"
                                    />
                            }
                            <VictoryAxis
                                label={totalsData[selectedHabit].length > 0 ? 
                                    Object.keys(totalsData[selectedHabit][0]).includes('Day') ? 'Day' : "Week"
                                    : 'Week'
                                }
                                tickFormat={(t, i) => Object.keys(totalsData[selectedHabit]).length !== 0 ? t : `Week ${i+1}`}
                                style={{
                                    axisLabel: { padding: 30 }
                                }}
                            />
                            <VictoryAxis dependentAxis
                                label="Total"
                                tickFormat={(t) => `${Math.round(t)}`}
                                style={{
                                    axisLabel: { padding: 40 }
                                }}
                            />
                            </VictoryChart>
            }

        </View>
    )

    }

const styles = StyleSheet.create({
    toggleSelected: {
        backgroundColor: theme.colors.primary
    },
    toggleUnselected: {
        backgroundColor: '#EAEAEA'
    }
})