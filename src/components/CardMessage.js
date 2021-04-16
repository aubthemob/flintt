import React from 'react'
import { Text, View } from 'react-native'

// Contexts 
import { useUserState } from '../contexts/UserAuthContext'

// Styles
import theme from '../styles/theme'

export default function CardMessage({ text, user: messageUser, system }) {

    const { user } = useUserState()

    return (
        <>
            {
                messageUser && messageUser._id === user.uid &&
                    <View style={{ backgroundColor: theme.colors.primary, flexShrink: 1, margin: 1, padding: 10, maxWidth: '45%', borderRadius: 20, alignSelf: 'flex-end' }}>
                        <Text style={{ textAlign: 'right', color: 'white' }}>{text}</Text>
                    </View>
            }

            {
                messageUser && messageUser._id !== user.uid &&
                    <View style={{ backgroundColor: '#EAEAEA', flexShrink: 1, margin: 1, padding: 10, maxWidth: '45%', borderRadius: 20, alignSelf: 'flex-start' }}>
                        <Text style={{ textAlign: 'left', color: theme.colors.text }}>{text}</Text>
                    </View>
            }

            {
                system === true &&
                    <View>
                        <Text style={{ textAlign: 'center', fontSize: 14, marginVertical: 6, color: theme.colors.text }}>{text}</Text>
                    </View>
            }
        </>
    )
}
