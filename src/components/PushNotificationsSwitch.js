import React, { useState } from 'react'
import { View, Text } from 'react-native'

import { registerForPushNotificationsAsync } from '../utils/pushNotifications'
import { setExpoToken } from '../services/auth'

import { Switch, Avatar } from 'react-native-paper'
import theme from '../styles/theme'

export default function PushNotificationsSwitch({ fullUser }) {

    const [isSwitchOn, setIsSwitchOn] = useState(false)

    return (
        <>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 12
                }}
            >
                <Avatar.Icon 
                    icon='bell'
                    size={48}
                    style={{
                        backgroundColor: 'transparent'
                    }}
                    color={theme.colors.text}
                />
                <Switch 
                    value={isSwitchOn} 
                    onValueChange={async () => {
                        const token = await registerForPushNotificationsAsync()
                        setExpoToken(fullUser.id, token)
                        token && setIsSwitchOn(!isSwitchOn)
                    }} 
                />
            
                <View
                    style={{
                        marginLeft: 24
                    }}
                >
                    {
                        fullUser.expoPushToken ? 
                            <>
                                <Avatar.Icon 
                                    icon='alert-outline' 
                                    size={36} 
                                    style={{
                                        backgroundColor: 'transparent'
                                    }}
                                    color='red'
                                />
                                <Text>
                                    Reminders enabled
                                </Text>
                            </>
                            :
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <Avatar.Icon 
                                    icon='alert-outline' 
                                    size={36} 
                                    style={{
                                        backgroundColor: 'transparent'
                                    }}
                                    color='red'
                                />
                                <Text
                                    style={{
                                        color: 'red'
                                    }}
                                >
                                    Reminders disabled
                                </Text>
                            </View>
                    }
                </View>

            </View>
        </>
    )
}
