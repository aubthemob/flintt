import React, { useRef, useReducer, useState } from 'react'
import { Text, View, TouchableWithoutFeedback, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native'
import * as Contacts from 'expo-contacts'

import { registerForPushNotificationsAsync } from '../utils/pushNotifications'

// Libs
import auth from '@react-native-firebase/auth'
import PagerView from 'react-native-pager-view' 
import Slider from "react-native-slider"

import { Avatar, Button, IconButton, Snackbar } from 'react-native-paper'

import theme from '../styles/theme'

// Reducer
const ONBOARDING_ACTIONS = {
    CHANGE_REASON: 'change-reason',
    CHANGE_FIRST_HABIT: 'change-first-habit',
    CHANGE_NAME: 'change-name',
    CHANGE_PHONE_NUMBER: 'change-phone-number',
    CHANGE_OTP: 'change-otp'
}

const onboardingStateReducer = (state, action) => {
    switch (action.type) {
        case ONBOARDING_ACTIONS.CHANGE_REASON:
            return { ...state, reason: action.payload }
        case ONBOARDING_ACTIONS.CHANGE_FIRST_HABIT:
            return { ...state, firstHabit: action.payload }
        case ONBOARDING_ACTIONS.CHANGE_FIRST_HABIT_LEVEL:
            return { ...state, firstHabitLevel: action.payload }
        case ONBOARDING_ACTIONS.CHANGE_NAME:
            return { ...state, name: action.payload }
        case ONBOARDING_ACTIONS.CHANGE_PHONE_NUMBER:
            return { ...state, phoneNumber: action.payload }
        case ONBOARDING_ACTIONS.CHANGE_OTP:
            return { ...state, otp: action.payload }
        default:
            throw new Error("Invalid action type")
    }
}

export default function OnboardingScreens() {
    const [onboardingState, onboardingDispatch] = useReducer(onboardingStateReducer, {
        phoneNumber: '',
        otp: '',
        reason: '',
        firstHabit: '',
        firstHabitLevel: 0,
        name: '',
        imageUrl: ''
    })

    const [confirm, setConfirm] = useState(null)
    const [contacts, setContacts] = useState([])

    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarVisible, setSnackbarVisible] = useState(false)

    const pagerRef = useRef(null)

    const handlePageChange = pageNumber => {
        pagerRef.current.setPage(pageNumber);
    }

    const setReason = reason => {
        onboardingDispatch({ type: ONBOARDING_ACTIONS.CHANGE_REASON, payload: reason })
    }

    const setFirstHabit = habit => {
        onboardingDispatch({ type: ONBOARDING_ACTIONS.CHANGE_FIRST_HABIT, payload: habit })
    }

    const signInWithPhoneNumber = async (phoneNumber) => {
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        setConfirm(confirmation);
    }

    async function confirmCode() {
        try {
            await confirm.confirm(onboardingState.otp);
        } catch (error) {
            setSnackbarVisible(true)
            setSnackbarMessage('Invalid code')
        }
    }

    const getContactsAsync = async () => {
        const { status } = await Contacts.requestPermissionsAsync()
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
                sort: Contacts.SortTypes.FirstName 
            })

            if (data.length > 0) {
                const newContacts = data.map(d => ({
                    name: d.name,
                    phoneNumber: d.phoneNumbers[0].number // change in case contact has multiple numbers
                }))
                setContacts(newContacts)
            }
        }
    }

    return (
        <PagerView initialPage={0} style={{ flex: 1 }} ref={pagerRef} scrollEnabled={false}>

            <View key="1">
                <Text>Become your best self</Text>
                <Button
                    onPress={() => handlePageChange(1)}
                >
                    Get started
                </Button>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
                    <Text style={[styles.bodyText, { marginBottom: 24 }]}>
                        Already have an account? 
                    </Text>

                    <TouchableOpacity onPress={() => handlePageChange(3)}>
                        <Text style={styles.bodyTextLink}> Login.</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View key="2">
                <Text>{`Stay motivated. Stay consistent.`}</Text>
                <IconButton
                    onPress={() => handlePageChange(2)}
                    icon={'arrow-right-circle'}
                />
            </View>

            <View key="3">
                <Text>Support your loved ones</Text>
                <IconButton
                    onPress={() => handlePageChange(3)}
                    icon={'arrow-right-circle'}
                />
            </View>

            <View key="4">
                <Text>What is your phone number?</Text>
                <TextInput 
                    value={onboardingState.phoneNumber}
                    onChangeText={text => onboardingDispatch({ type: ONBOARDING_ACTIONS.CHANGE_PHONE_NUMBER, payload: text })}
                    style={styles.numberInput}
                    placeholder="1-234-567-8910"
                    keyboardType="numeric"
                />
                <Button
                    onPress={async () => {
                        await signInWithPhoneNumber(onboardingState.phoneNumber)
                        handlePageChange(4)
                    }}
                >
                    Submit
                </Button>
            </View>

            <View key="5">
                <Text>Enter the 6 digit password we just sent you.</Text>
                <TextInput 
                    value={onboardingState.otp}
                    onChangeText={text => onboardingDispatch({ type: ONBOARDING_ACTIONS.CHANGE_OTP, payload: text })}
                    style={styles.numberInput}
                    placeholder="12346"
                    keyboardType="numeric"
                />
                <Button
                    onPress={async () => {
                        await confirmCode()
                        handlePageChange(5)
                    }}
                >
                    Confirm
                </Button>
            </View>

            <View key="6">
                <Text>What are you here for?</Text>
                <TouchableWithoutFeedback
                    onPress={() => setReason('myself')}
                >
                    <View style={onboardingState.reason === 'myself' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>I want to work on myself</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={() => setReason('others')}
                >
                    <View style={onboardingState.reason === 'others' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>I want to support someone else</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={() => setReason('both')}
                >
                    <View style={onboardingState.reason === 'both' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>I want to do both!</Text>
                    </View>
                </TouchableWithoutFeedback>
                <Button
                    onPress={() => handlePageChange(6)}
                >
                    Continue
                </Button>
            </View>

            <View key="7">
                <Text>Which habit would you like to focus on first?</Text>
                <TouchableWithoutFeedback
                    onPress={() => setFirstHabit('exercise')}
                >
                    <View style={onboardingState.firstHabit === 'exercise' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>Exercise</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={() => setFirstHabit('nutrition')}
                >
                    <View style={onboardingState.firstHabit === 'nutrition' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>Nutrition</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={() => setFirstHabit('mindfulness')}
                >
                    <View style={onboardingState.firstHabit === 'mindfulness' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>Mindfulness</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={() => setFirstHabit('sleep')}
                >
                    <View style={onboardingState.firstHabit === 'sleep' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>Sleep</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={() => setFirstHabit('other')}
                >
                    <View style={onboardingState.firstHabit === 'other' ? styles.selectableViewSelected : styles.selectableViewUnselected}>
                        <Text>Something else</Text>
                    </View>
                </TouchableWithoutFeedback>
                <Button
                    onPress={() => handlePageChange(7)}
                >
                    Continue
                </Button>
            </View>

            <View key="8">
                <Text>{`How developed is your ${onboardingState.firstHabit} habit?`}</Text>
                <View
                    style={styles.sliderContainer}
                >
                    <Slider
                        value={0}
                        step={1}
                        minimumValue={0}
                        maximumValue={2}
                        onValueChange={value => onboardingDispatch({ type: ONBOARDING_ACTIONS.CHANGE_FIRST_HABIT_LEVEL, payload: value })}
                        animateTransitions={true}
                        thumbTouchSize={{
                            width: 80, 
                            height: 80
                        }}
                    />
                </View>
                <Text>
                    {
                        onboardingState.firstHabitLevel === 0 && `I want to kickstart this habit` ||
                        onboardingState.firstHabitLevel === 1 && `I want to be more consistent` ||
                        onboardingState.firstHabitLevel === 2 && `I'm already consistent`
                    }
                </Text>
                <Button
                    onPress={() => handlePageChange(8)}
                >
                    Continue
                </Button>
            </View>

            <View key="9">
                <Text>How do you want your supporters to view your profile?</Text>

                <View
                    style={{
                        flexDirection: 'row'
                    }}
                >
                    <Avatar.Image size={128} source={{ uri: onboardingState.imageUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} /> 
                    <IconButton 
                        icon={'pencil'} 
                        style={styles.editImageButton} 
                        color={theme.colors.accent}
                        size={24}
                        // onPress={pickImage}
                    />

                </View>
                <TextInput 
                    value={onboardingState.name}
                    onChangeText={text => onboardingDispatch({ type: ONBOARDING_ACTIONS.CHANGE_NAME, payload: text })}
                    style={styles.nameInput}
                    placeholder="Rocky Balboa"
                />

                <Button
                    onPress={() => handlePageChange(9)}
                >
                    Continue
                </Button>

            </View>

            <View key="10">
                <Text>Who will support you?</Text>
                <Button
                    onPress={async () => {
                        await getContactsAsync()
                        const { status } = await Contacts.getPermissionsAsync()
                        if (status === 'granted') {
                            handlePageChange(10)
                        } else {
                            handlePageChange(11) // instead, make a modal pop up and ask them to copy their friend link
                        }
                    }}
                >
                    Add supporters
                </Button>
                <Button
                    onPress={() => handlePageChange(11)}
                >
                    I don't want support
                </Button>
            </View>

            <View key="11">
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <IconButton
                        onPress={() => handlePageChange(11)}
                        icon="close-circle"
                    />
                    <Text>Choose your supporters</Text>
                    <IconButton
                        onPress={() => handlePageChange(11)}
                        icon="check-circle"
                    />
                </View>
                <FlatList 
                    data={contacts}
                    keyExtractor={(item, index) => `${index}`}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity>
                            <Text>{item.name}</Text>
                            <Text>{item.phoneNumber}</Text>
                        </TouchableOpacity>
                    )}
                />
                
            </View>

            <View key="12">
                <Text>Enable notifications</Text>
                <Button
                    onPress={async () => {
                        await registerForPushNotificationsAsync()
                        handlePageChange(12)
                    }}
                >
                    I want reminders
                </Button>
                <Button
                    onPress={() => handlePageChange(12)}
                >
                    I don't want reminders
                </Button>
            </View>

            <View key="13">
                <Text>Preparing your profile...</Text>
            </View>

        </PagerView>
    )
}

const styles = StyleSheet.create({
    selectableViewSelected: {
        backgroundColor: 'orange'
    },
    selectableViewUnselected: {
        backgroundColor: 'white'
    },
    sliderContainer: {
        flex: 1,
        marginHorizontal: 48,
        alignItems: "stretch",
        justifyContent: "center"
    },
    editImageButton: { 
        alignSelf: 'flex-end', 
        marginTop: -24, 
        marginLeft: -36, 
        backgroundColor: 'white', 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4, 
        borderWidth: 1,
        borderColor: '#EAEAEA'
    },
    nameInput: {
        height: 40,
        borderBottomColor: 'grey',
        borderBottomWidth: 0.5
    },
    numberInput: {
        height: 40,
        marginHorizontal: 48,
        borderBottomColor: 'grey',
        borderBottomWidth: 0.5
    }
})