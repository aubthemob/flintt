import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { IconButton, Avatar } from 'react-native-paper'

import theme from '../styles/theme'

export default function EventModalRow({ placeholder, value, onPress }) {

    // console.log(value)

    return (
        <>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginVertical: 12, marginRight: 6 }}>

                <Avatar.Icon icon="refresh" size={48} style={{ backgroundColor: 'white' }} />
                
                <TouchableWithoutFeedback onPress={() => onPress(true)} style={{ flex: 1, justifyContent: 'center', flexShrink: 1 }}>
                    <Text style={ value ? { fontFamily: 'Montserrat-Regular', fontSize: 18, color: theme.colors.text, flexShrink: 1 } : { fontFamily: 'Montserrat-Regular', fontSize: 18, color: '#b7b7b7' }}>
                        {
                            value ?
                            value :
                            placeholder
                        }
                    </Text>
                </TouchableWithoutFeedback>

            </View>
        </>
    )
}
