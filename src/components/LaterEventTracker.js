import React, { useState, useRef } from 'react'
import { Alert, View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, LayoutAnimation, UIManager } from 'react-native'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Components
import ReasonForSkipping from '../components/ReasonForSkipping'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'
import { CardContext } from './FeedCardOLD'

// Libs
import Slider from '@react-native-community/slider'
import dayjs from 'dayjs'
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

// Styles
import { Chip, Avatar, Divider } from 'react-native-paper'
import theme from '../styles/theme'
import { bodyText, fullScreenButtonLabelStyle, subtitleText, timePickerText } from '../styles/styles'

// Utils
import { timeFormatter } from '../utils/helperFunctions'
import { windowHeight, windowWidth } from '../utils/dimensions'

export default function LaterEventTracker({ eventTrackerForm, setEventTrackerForm }) {
    // const [reasons, setReasons] = useState(REASONS)
    const [componentFocused, setComponentFocused] = useState(null)
    const [timeComponentFocused, setTimeComponentFocused] = useState(null)

    // const handleReasonPress = ({ key }) => {
    //     let newReasons = [...reasons]
    //     const currentReason = newReasons.find(r => r.key === key)
    //     const currentReasonIndex = newReasons.findIndex(r => r.key === key)
    //     newReasons[currentReasonIndex] = { ...currentReason, selected: !currentReason.selected }
    //     setReasons(newReasons)

    //     if (eventTrackerForm.reasonsForSkipping.includes(key)) {
    //         const currentReasonsForSkipping = [...eventTrackerForm.reasonsForSkipping]
    //         const newReasonsForSkipping = currentReasonsForSkipping.filter(r => r !== key)
    //         setEventTrackerForm(prevState => ({ ...prevState, reasonsForSkipping: newReasonsForSkipping }))
    //     } else {
    //         setEventTrackerForm(prevState => ({ ...prevState, reasonsForSkipping: [...eventTrackerForm.reasonsForSkipping, key] }))
    //     }
    // }

    // const handleTimePress = (value) => {
    //     if (timeComponentFocused === value) {
    //         LayoutAnimation.easeInEaseOut()
    //         setTimeComponentFocused(null)
    //         setComponentFocused(null)
    //     } else {
    //         LayoutAnimation.spring()
    //         setTimeComponentFocused(value)
    //         setComponentFocused('Time')
    //     }
    // }

    // const changeTimeDifference = value => {
    //     const currentStartTime = eventTrackerForm.startDateTime
    //     setEventTrackerForm(prevState => ({
    //         ...prevState, 
    //         difference: value,
    //         endDateTime: dayjs(currentStartTime).add(value, 'minute')
    //     }))
    // }

    const changeStartTime = value => {
        const newStartTime = dayjs(eventTrackerForm.startDateTime.add(value, 'minute'))
        const newEndTime = dayjs(eventTrackerForm.endDateTime.add(value, 'minute'))
        setEventTrackerForm(prevState => ({
            ...prevState,
            newStartDateTime: newStartTime,
            newEndDateTime: newEndTime,
        }))
    }

    const sliderRef = useRef()

    // console.log(eventTrackerForm)

    return (
        <>

            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>

                <Avatar.Icon icon="clock" size={42} style={{ backgroundColor: 'transparent' }} color={theme.colors.text} />

                <Text 
                    style={{
                        color: theme.colors.text,
                        fontFamily: 'Montserrat-Regular',
                        fontSize: 16,
                    }}>I'll get to this at </Text>

                {/* <TouchableOpacity
                    onPress={() => handleTimePress('startDateTime')}
                > */}
                    <Text 
                        style={{
                            color: theme.colors.primary,
                            fontFamily: 'Montserrat-Regular',
                            fontSize: 18,
                        }}
                        
                    >
                        { eventTrackerForm.newStartDateTime !== null ? dayjs(eventTrackerForm.newStartDateTime).format('LT') : dayjs(eventTrackerForm.startDateTime).format('LT') }
                    </Text>
                {/* </TouchableOpacity> */}

                {/* <Text style={ styles.timePickerText }> for </Text> */}

                {/* <TouchableOpacity
                    onPress={() => handleTimePress('duration')}
                >
                    <Text 
                        style={ 
                            timeComponentFocused === 'duration' && {
                                color: theme.colors.primary,
                                fontFamily: 'Montserrat-Regular',
                                fontSize: 18,
                            } || {
                                color: theme.colors.text,
                                fontFamily: 'Montserrat-Regular',
                                fontSize: 16,
                            }
                        }
                    >   
                        {timeFormatter(eventTrackerForm.difference)}
                    </Text>
                </TouchableOpacity> */}

            </View>

            {
             
                <Slider 
                    style={{ width: windowWidth*0.7, alignSelf: 'center', marginBottom: 12 }}
                    minimumValue={0}
                    maximumValue={60}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={'#D3D3D3'}
                    value={Number(dayjs(eventTrackerForm.startDateTime).format('m'))}
                    onValueChange={value => changeStartTime(value)}
                    ref={sliderRef}
                    step={5}
                    thumbTintColor={theme.colors.primary}
                /> 

            // timeComponentFocused === 'duration' &&
            //     <Slider 
            //         style={{ width: windowWidth*0.7, alignSelf: 'center', marginBottom: 12 }}
            //         minimumValue={0}
            //         maximumValue={120}
            //         minimumTrackTintColor={theme.colors.primary}
            //         maximumTrackTintColor={'#D3D3D3'}
            //         value={eventTrackerForm.difference}
            //         onValueChange={value => changeTimeDifference(value)}
            //         ref={sliderRef}
            //         step={5}
            //         thumbTintColor={Platform.OS === 'ios' ? 'white' : theme.colors.primary}
            //     />
            }

            {/* <Divider style={{ marginHorizontal: 12 }} /> */}
            
            {/* <View style={ componentFocused === 'ReasonForSkipping' ? { flex: 4 } : { flex: 1 } }>
                <ReasonForSkipping 
                    handleReasonPress={handleReasonPress}
                    componentFocused={componentFocused}
                    setComponentFocused={setComponentFocused}
                    reasons={reasons}
                    setTimeComponentFocused={setTimeComponentFocused}
                />
            </View> */}

            {/* <ScrollView contentContainerStyle={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }} keyboardShouldPersistTaps='always'>
                {
                    reasons.length > 0 && reasons.map(r => r.selected === true && (
                        <View key={r.key} style={{ margin: 6 }}>
                            <Chip
                                onClose={() => handleReasonPress(r)}
                                mode='outlined'
                                style={{ width: 'auto' }}
                                textStyle={{ fontFamily: 'Montserrat-Regular' }}
                                // avatar={ ap.avatar && <Avatar.Image source={{ uri: ap.avatar }} size={24}/>}
                            >
                                {r.title}
                            </Chip>
                        </View>
                    ))
                }
            </ScrollView>  */}
        </>
    )
}

const styles = StyleSheet.create({
    bodyText,
    fullScreenButtonLabelStyle,
    subtitleText,
    timePickerText
})