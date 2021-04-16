import React, { useState } from 'react'
import { Text, View, FlatList, TouchableOpacity } from 'react-native'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Styles
import { List, Divider, Avatar, IconButton, Button, RadioButton } from 'react-native-paper'
import theme from '../styles/theme'

// Services
import { updateAps } from '../services/events'

// Utils
import { handleShare } from '../utils/sharing'
import { windowHeight } from '../utils/dimensions'

export default function AddApToEventModal({ friends, handleApPress, accountabilityPartners, setAddApModalVisible, eventId, eventGroupId, type }) {

    const [updatedAps, setUpdatedAps] = useState(accountabilityPartners) // for inside the activity
    const { user } = useUserState()

    const handleApPressInActivity = apId => {

        const currentAccountabilityPartners = updatedAps
        const newAccountabilityPartners =
        currentAccountabilityPartners.includes(apId) ?
        currentAccountabilityPartners.filter(a => a !== apId) :
        [apId, ...currentAccountabilityPartners]

        setUpdatedAps(newAccountabilityPartners)
    }

    console.log(updatedAps)

    return (
        <>
            <View
                style={{
                    backgroundColor: 'white',
                    padding: 24,
                    borderRadius: 48,
                    minHeight: windowHeight/3
                }}
            >

                <IconButton 
                    icon={type ? 'close' : "arrow-left"}
                    size={24} 
                    style={{
                        backgroundColor: 'transparent', 
                        position: 'absolute',
                        left: 6,
                        top: 6,
                        zIndex: 1
                    }} 
                    color={theme.colors.text} 
                    onPress={() => setAddApModalVisible(false)}
                />

                <FlatList 
                    data={friends}
                    keyExtractor={item => item.id}
                    // keyboardShouldPersistTaps='always'
                    ItemSeparatorComponent={() => <Divider />}
                    ListFooterComponent={() => friends.length > 0 && <Divider />}
                    style={{ marginTop: 12 }}
                    renderItem={({ item }) => (
                        <>
                            <TouchableOpacity 
                                onPress={() => {
                                    if (!type) {
                                        handleApPress(item.id)
                                    } else {
                                        handleApPressInActivity(item.id)
                                    }
                                }}
                            >
                                <List.Item 
                                    // onPress={() => handleApPress(item.id)}
                                    title={item.displayName}
                                    titleStyle={
                                        type ? (
                                            [updatedAps.includes(item.id) ? 
                                            {
                                                color: theme.colors.primary
                                            } : {
                                                color: theme.colors.text
                                            }, {
                                                fontSize: 20,
                                                fontFamily: 'Montserrat-Regular',
                                                marginLeft: 8
                                            }]
                                        ) :
                                        [accountabilityPartners.includes(item.id) ? 
                                            {
                                                color: theme.colors.primary
                                            } : {
                                                color: theme.colors.text
                                            }, {
                                                fontSize: 20,
                                                fontFamily: 'Montserrat-Regular',
                                                marginLeft: 8
                                            }]
                                        // [type ?  : accountabilityPartners.includes(item.id) ? {
                                        //     color: theme.colors.primary
                                        // } : {
                                        //     color: theme.colors.text
                                        // }, {
                                        //     fontSize: 20,
                                        //     fontFamily: 'Montserrat-Regular',
                                        //     marginLeft: 8
                                        // }]
                                    }
                                    left={() => (
                                        <View style={{ alignSelf: 'center' }}>
                                            <Avatar.Image source={{ uri: item.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} size={36} />
                                        </View>
                                    )}
                                    right={() => (
                                        <RadioButton 
                                            status={
                                                type ? (
                                                    updatedAps.includes(item.id) ?
                                                    'checked' :
                                                    'unchecked'
                                                ) : (
                                                    accountabilityPartners.includes(item.id) ? 
                                                    'checked' : 
                                                    'unchecked'
                                                )
                                            }
                                            color={theme.colors.primary}
                                            onPress={() => {
                                                if (!type) {
                                                    handleApPress(item.id)
                                                } else {
                                                    handleApPressInActivity(item.id)
                                                }
                                            }}
                                        />
                                    )}
                                /> 
                            </TouchableOpacity>
                        </>

                    )}
                />

                <List.Item 
                    onPress={() => handleShare('add-accountability-partner', user.uid, user.displayName, eventId, eventGroupId)}
                    title="Tag a new friend"
                    style={{
                        padding: 0
                    }}
                    titleStyle={{
                        fontSize: 20,
                        fontFamily: 'Montserrat-Regular',
                        marginVertical: 4,
                        paddingHorizontal: 0
                    }}
                    left={() => (
                        <Avatar.Icon icon="plus-circle" size={52} style={{ backgroundColor: 'transparent', margin: 0 }} color={theme.colors.accent} />
                    )}
                />

                {
                    type &&
                        <Button
                            onPress={() => {
                                updateAps(user.uid, eventId, updatedAps)
                                setAddApModalVisible(false)
                            }}
                            mode='contained'
                            labelStyle={{
                                color: 'white'
                            }}
                            style={{
                                alignItems: 'stretch',
                                borderRadius: 48,
                                marginTop: 6
                            }} 
                            color={theme.colors.accent} 
                        >Save</Button>
                }

            </View>
        </>
    )
}
