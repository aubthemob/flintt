import React from 'react'
import { View, Text, KeyboardAvoidingView } from 'react-native'

// Components
import SelectFrequency from './SelectFrequency'

// styles
import { Button, IconButton } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { windowHeight, windowWidth } from '../utils/dimensions'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function PopupModal({ close, contentComponent, done, doneText, doneDisabled }) {
    return (
        <>
            <View style={{ width: windowWidth*0.9, backgroundColor: 'white', borderRadius: 48 }}>
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
                    onPress={() => close(false)}
                />

                {
                    contentComponent
                }

                {
                    // <View style={{ height: 75 }}>
                        // <Button
                        //     mode="contained"
                        //     disabled={doneDisabled}
                        //     labelStyle={{
                        //         color: 'white'
                        //     }}
                        //     style={{
                        //         alignSelf: 'center',
                        //         position: 'absolute',
                        //         bottom: 12,
                        //         backgroundColor: theme.colors.accent,
                        //     }}
                        //     onPress={ () => {
                        //         done()
                        //         close()
                        //     } }
                        // >
                        //     { doneText }
                        // </Button>
                    // </View>
                }
            </View>  
        </>
    )
}
