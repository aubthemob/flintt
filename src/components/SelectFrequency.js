import React, { useState } from 'react'
import { TouchableOpacity, View, Text, ScrollView } from 'react-native'
import { Divider, RadioButton, IconButton } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { frequencyItems } from '../utils/activityFrequencyValues'
import theme from '../styles/theme'
import { processFontFamily } from 'expo-font'

export default function SelectFrequency(props) {

    const {
        frequencyItems,
        setModalState,
        formDispatch,
        formState,
        EVENT_FORM_ACTIONS
    } = props

    const handlePress = ({ key }) => {
        const currentValues = [...formState.frequency]
        const keyIsInArray = currentValues.includes(key)
        const newValues = keyIsInArray ? currentValues.filter(c => c !== key) : [...currentValues, key]

        formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_FREQUENCY, payload: newValues })
    }

    return (
        <>
            <View
                style={{
                    flex: 0,
                    borderRadius: 48,
                    paddingTop: 48,
                    paddingBottom: 24,
                    paddingHorizontal: 48,
                    backgroundColor: 'white',
                }}
            >

                <IconButton 
                    icon="arrow-left" 
                    size={24} 
                    style={{
                        backgroundColor: 'transparent', 
                        position: 'absolute',
                        left: 6,
                        top: 6,
                        zIndex: 1
                    }} 
                    color={theme.colors.text} 
                    onPress={() => setModalState(false)}
                />

                <FlatList 
                    data={frequencyItems}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handlePress(item)}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Text
                                style={
                                    [formState.frequency.includes(item.key) === true ? {
                                        color: theme.colors.primary
                                    } : {
                                        color: theme.colors.text
                                    }, {
                                        fontSize: 18,
                                        fontFamily: 'Montserrat-Regular',
                                        // marginVertical: 8,
                                        // textAlign: 'center'
                                    }]
                                }
                            >{item.title}</Text>
                            <RadioButton 
                                status={ formState.frequency.includes(item.key) === true ? 'checked' : 'unchecked' }
                                color={theme.colors.primary}
                                onPress={() => handlePress(item)}
                            />
                        </TouchableOpacity>
                    )}
                />

            </View>
        </>
    )
}
