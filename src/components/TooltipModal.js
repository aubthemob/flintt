import React from 'react'
import { View, Text } from 'react-native'

import { IconButton } from 'react-native-paper'

export default function Tooltip({ text, setVisible }) {


    return (
        <>
            <View style={{ 
                padding: 12, 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: '#404040', 
                marginBottom: 120, 
                borderTopLeftRadius: 15, 
                borderTopRightRadius: 15,
                borderBottomLeftRadius: 15, 
                borderBottomRightRadius: 15 
            }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ alignSelf: 'flex-start' }}>
                        <IconButton 
                            icon="window-close" 
                            color="white"
                            size={18} 
                            style={{ backgroundColor: 'transparent', marginTop: -6, marginLeft: -6 }} 
                            // color={theme.colors.text} 
                            onPress={() => setVisible(false)}
                        />
                    </View>
                    <Text 
                        style={{ color: 'white', fontFamily: 'Montserrat-Medium' }}
                    >
                        {text}
                    </Text>
                </View>
            </View>
        </>
    )
}
