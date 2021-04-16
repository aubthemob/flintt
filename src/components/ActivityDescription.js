import React, { useEffect, useState } from 'react'
import { TextInput } from 'react-native'

import { Avatar } from 'react-native-paper'
import theme from '../styles/theme'

export default function ActivityDescription({ EVENT_FORM_ACTIONS, getPlaceholders, fullUser, formDispatch, formState }) {

    const [defaultDescription, setDefaultDescription] = useState('')

    // gets the default placeholder based on the user's profile
    useEffect(() => {
        if (Object.keys(fullUser).length > 0) {
            const { description: newDefaultDescription } = getPlaceholders(fullUser)
            setDefaultDescription(newDefaultDescription)
        }
    }, [fullUser])

    return (
        <>
            <Avatar.Icon icon="text" size={48} style={{ backgroundColor: 'transparent' }} color={theme.colors.text} /> 
            {
                defaultDescription !== '' &&
                <TextInput 
                    multiline
                    placeholder={defaultDescription}
                    onChangeText={text => formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_DESCRIPTION, payload: text })}
                    value={formState.description}
                />
            }
        </>
    )
}
