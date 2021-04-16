import React from 'react'
import { View, Text, KeyboardAvoidingView } from 'react-native'

// Components

// styles
import { Button, IconButton } from 'react-native-paper'
import theme from '../../styles/theme'

// Utils
import { windowHeight, windowWidth } from '../../utils/dimensions'

export default function CloseButton({ close }) {
    return (
        <>
                <IconButton 
                    icon="window-close" 
                    size={24} 
                    style={{
                        backgroundColor: 'transparent', 
                        position: 'absolute',
                        left: 6,
                        top: 6,
                        zIndex: 1
                    }} 
                    color={theme.colors.text} 
                    onPress={() => close('')}
                />
        </>
    )
}
