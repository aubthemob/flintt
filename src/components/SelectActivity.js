import React, { useState, useEffect, useRef, useReducer } from 'react'
import { Alert, StyleSheet, FlatList, TouchableOpacity, View, TextInput, LayoutAnimation, UIManager, Text, TouchableWithoutFeedback } from 'react-native'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Libs
import Modal from 'react-native-modal'
import SearchInput, { createFilter } from 'react-native-search-filter'
const uniqBy = require('lodash.uniqby')

// Services
import { getActivityNames } from '../services/events'

// Styles
import { Button, Avatar, List, Divider, IconButton, RadioButton, Snackbar } from 'react-native-paper';
import theme from '../styles/theme'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'
import { POPULAR_ACTIVITIES } from '../utils/activities'

export default function SelectActivity({ formState, formDispatch, EVENT_FORM_ACTIONS, getPlaceholders, fullUser }) { 

    const [activityText, setActivityText] = useState('')
    const [selectActivityModalVisible, setSelectActivityModalVisible] = useState(false)

    const [customActivities, setCustomActivities] = useState([])

    const [errorSnackbarVisible, setErrorSnackbarVisible] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [defaultActivity, setDefaultActivity] = useState('Walk')

    const { user } = useUserState()

    // console.log(formState)

    // gets the default placeholder based on the user's profile
    useEffect(() => {
        if (Object.keys(fullUser).length > 0) {
            const { activity: newDefaultActivity } = getPlaceholders(fullUser)
            setDefaultActivity(newDefaultActivity)
        }
    }, [fullUser])

    useEffect(() => {

        const getNewCustomActivities = async () => {
            const newActivities = await getActivityNames(user.uid)
            const dedupedActivities = uniqBy(newActivities, 'activity')
            const popularActivitiesNames = POPULAR_ACTIVITIES.map(p => p.activity)
            const filteredDedupedActivities = dedupedActivities.filter(d => !popularActivitiesNames.includes(d.activity))
            setCustomActivities(filteredDedupedActivities)
        }
        getNewCustomActivities()

    }, [])

    // when the user enters a new activity and changes the habit, it modifies the currentActivities state to reflect the new icon
    useEffect(() => {
        const currentCustomActivities = [...customActivities]
        const activityToModifyIndex = currentCustomActivities.findIndex(c => c.activity === formState.activity)
        currentCustomActivities[activityToModifyIndex] = { activity: formState.activity, icon: formState.icon, habit: formState.habit }
        setCustomActivities(currentCustomActivities)
    }, [formState])

    const filteredPopularActivities = POPULAR_ACTIVITIES.filter(createFilter(activityText, ['activity']))
    const filteredPreviousActivities = customActivities.filter(createFilter(activityText, ['activity']))

    const handleAddActivityButton = newActivityText => {

        if (newActivityText.length >= 3 && newActivityText.length < 60) {
            const customActivitiesText = customActivities.map(c => c.activity)
            if (!customActivitiesText.includes(newActivityText)) {
                const currentCustomActivities = customActivities
                const itemToAdd = {
                    activity: newActivityText,
                    habit: formState.habit && formState.habit,
                    icon: formState.habit !== '' ? formState.icon : 'run'
                }
                const newCustomActivities = [itemToAdd, ...currentCustomActivities]
                setCustomActivities(newCustomActivities)
                formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_ACTIVITY_TITLE, payload: itemToAdd })
                setSelectActivityModalVisible(false)
                setActivityText('')
            } else {
                setErrorSnackbarVisible(true)
                setErrorMessage('This activity is already in the list.')
            }

        } else {
            setErrorSnackbarVisible(true)
            setErrorMessage('The activity name must be between 4 & 60 characters long.')
        }

    }

    const renderItem = ({ item, index }) => (
        <TouchableOpacity 
            onPress={() => {
                const payload = {
                    activity: item.activity,
                    habit: item.habit,
                    icon: item.icon
                }
                formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_ACTIVITY_TITLE, payload })
                setSelectActivityModalVisible(false)
            }}
        >
            <List.Item 
                title={item.activity}
                titleStyle={{
                    fontSize: 18,
                    fontFamily: 'Montserrat-Regular',
                    marginLeft: 8,
                    color: formState.activity === item.activity ? theme.colors.primary : theme.colors.text
                    // textAlign: 'center'
                }}
                right={() => (
                    <RadioButton 
                        status={formState.activity === item.activity ? 'checked' : 'unchecked'}
                        color={theme.colors.primary}
                        onPress={() => {
                            const payload = {
                                activity: item.activity,
                                habit: item.habit,
                                icon: item.icon
                            }
                            formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_ACTIVITY_TITLE, payload })
                            setSelectActivityModalVisible(false)
                        }}
                    />
                )}
                left={() => (
                    item.icon && 
                        <Avatar.Icon 
                            icon={item.icon} 
                            style={{ backgroundColor: 'transparent' }} 
                            color={formState.activity === item.activity ? theme.colors.primary : theme.colors.text} 
                            size={48} 
                        />
                )}
            /> 
        </TouchableOpacity>
    )

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    }

    return (
        <> 
            <TouchableWithoutFeedback
                onPress={() => {
                    setSelectActivityModalVisible(true)
                    // focusTextInput()
                }}
            >
                <Text
                    style={ formState.activity ?  { color: theme.colors.text, fontSize: 18, fontFamily: 'Montserrat-Regular' } :  { color: '#b7b7b7', fontSize: 18, fontFamily: 'Montserrat-Regular' }}
                >
                    {
                        formState.activity === '' ?
                        defaultActivity :
                        formState.activity
                    }
                </Text>
            </TouchableWithoutFeedback>
            
            <Modal
                isVisible={selectActivityModalVisible}
                onBackdropPress={() => setSelectActivityModalVisible(false)}
                avoidKeyboard
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        padding: 24,
                        borderRadius: 48,
                        minHeight: windowHeight/2
                    }}
                >

                    <IconButton 
                        icon={'arrow-left'}
                        size={24} 
                        style={{
                            backgroundColor: 'transparent', 
                            position: 'absolute',
                            left: 6,
                            top: 6,
                            zIndex: 1
                        }} 
                        color={theme.colors.text} 
                        onPress={() => {
                            setSelectActivityModalVisible(false)
                            setActivityText('')
                        }}
                    />

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <SearchInput 
                            placeholder={'E.g. Walk'}
                            onChangeText={text => setActivityText(text)}
                            style={{ 
                                marginLeft: 24, 
                                marginBottom: 6, 
                                marginTop: 18, 
                                color: theme.colors.text, 
                                fontSize: 18, 
                                fontFamily: 'Montserrat-Regular',
                                borderBottomWidth: 0.5,
                                borderBottomColor: '#ADADAD',
                                paddingBottom: 6,
                                minWidth: '75%'
                            }}
                            selectionColor={theme.colors.primary}
                            // value={activityText}
                            // autoFocus={true}
                        />

                        <IconButton 
                            icon='plus-circle'
                            disabled={ activityText.length < 3 }
                            size={24}
                            color={theme.colors.accent}
                            onPress={() => {
                                handleAddActivityButton(activityText)
                            }}
                        />

                    </View>
                    
                    {/* {
                        activitiesNames.length === 0 &&
                            <View
                                style={{
                                    alignItems: 'flex-start',
                                    // marginVertical: 12,
                                    marginLeft: 24
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 12, 
                                        color: '#b7b7b7',
                                        fontFamily: 'Montserrat-Regular',
                                        fontStyle: 'italic'
                                    }}
                                >
                                    E.g. Meditation, Biking, etc.
                                </Text>

                            </View>

                    } */}


                    <Text>Popular activities</Text>

                    <FlatList 
                        data={shuffle(filteredPopularActivities)}
                        keyExtractor={item => `${item.activity}`}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <Text>No activity by that name</Text>
                        }
                        renderItem={({ item, index }) => {
                            if (formState.activity === '') {
                                return (
                                    index < 3 &&
                                    renderItem({item, index})
                                )
                            } else {
                                return (
                                    item.activity === formState.activity &&
                                    renderItem({item, index}) ||
                                    index < 2 &&
                                    renderItem({item, index})
                                )

                            }
                        }}
                    />

                    <Text>Custom activities</Text>

                    <FlatList 
                        data={shuffle(filteredPreviousActivities)}
                        keyExtractor={(item) => `${item.activity}`}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <Text>No activity by that name</Text>
                        }
                        renderItem={({ item, index }) => {
                            if (formState.activity === '') {
                                return (
                                    index < 3 &&
                                    renderItem({item, index})
                                )
                            } else {
                                return (
                                    item.activity === formState.activity &&
                                    renderItem({item, index}) ||
                                    index < 2 &&
                                    renderItem({item, index})
                                )

                            }
                        }}
                    />

                    <View
                        style={{
                            justifyContent: 'center'
                        }}
                    >
                        <Snackbar
                            visible={errorSnackbarVisible}
                            onDismiss={() => setErrorSnackbarVisible(false)}
                            style={{ backgroundColor: '#404040' }}
                            duration={3000}
                        >
                            {errorMessage}
                        </Snackbar>

                    </View>
                </View>
                
            </Modal>
        </>
    )
}
