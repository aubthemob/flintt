import React, { useState, useContext } from 'react'
import { Alert, View, Text, StyleSheet, TextInput, ScrollView } from 'react-native'

// Components 
import ReasonForSkipping from '../components/ReasonForSkipping'

// Contexts
import { CardContext } from './FeedCardOLD'

// Styles
import { Chip } from 'react-native-paper'

// Utils
import REASONS from '../utils/reasons'

export default function NopeEventTracker({ eventTrackerForm, setEventTrackerForm }) {
    const [componentFocused, setComponentFocused] = useState(null)
    // const [reasons, setReasons] = useState(REASONS)

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

    return (
        <>
            {/* <View style={ componentFocused === 'ReasonForSkipping' ? { flex: 4 } : { flex: 1 } }>
                <ReasonForSkipping 
                    handleReasonPress={handleReasonPress}
                    componentFocused={componentFocused}
                    setComponentFocused={setComponentFocused}
                    reasons={reasons}
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
