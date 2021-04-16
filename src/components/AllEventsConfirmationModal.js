import React from 'react'
import { View, Text } from 'react-native'
import { IconButton, Button } from 'react-native-paper'
import theme from '../styles/theme'

export default function AllEventsConfirmationModal({ setAllEventsConfirmationModalVisible, type, activity, handleFormSubmit, handleEventDelete }) {

    return (
        <>
            <View
                style={{
                    backgroundColor: 'white',
                    padding: 24,
                    paddingTop: 48,
                    borderRadius: 48
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
                    onPress={() => setAllEventsConfirmationModalVisible(false)}
                />

                {
                    type === 'edit' &&
                        <>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'Ubuntu-Regular',
                                    color: theme.colors.text
                                }}
                            >{`Would you like to modify all '${activity}' events or only this event?`}</Text>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    marginTop: 12
                                }}
                            >
                                <Button
                                    onPress={() => handleFormSubmit('one-event')}
                                    color={theme.colors.accent}
                                    labelStyle={{ color: 'white' }}
                                    mode='contained'
                                    style={{
                                        marginHorizontal: 12,
                                        marginVertical: 6
                                    }}
                                >
                                    This event
                                </Button>
                                
                                <Button
                                    onPress={() => handleFormSubmit('all-events')}
                                    color={theme.colors.accent}
                                    labelStyle={{ color: 'white' }}
                                    mode='contained'
                                    style={{
                                        marginHorizontal: 12,
                                        marginVertical: 6
                                    }}
                                >
                                    All events
                                </Button>
                            </View>
                        </>
                }

                {
                    type === 'delete' &&
                        <>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'Ubuntu-Regular',
                                    color: theme.colors.text
                                }}
                            >{`Would you like to delete all '${activity}' events or only this event?`}</Text>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    marginTop: 12
                                }}
                            >
                                <Button
                                    onPress={() => handleEventDelete('one-event')}
                                    color={theme.colors.accent}
                                    labelStyle={{ color: 'white' }}
                                    mode='contained'
                                    style={{
                                        marginHorizontal: 12,
                                        marginVertical: 6
                                    }}
                                >
                                    This event
                                </Button>
                                
                                <Button
                                    onPress={() => handleEventDelete('all-events')}
                                    color={theme.colors.accent}
                                    labelStyle={{ color: 'white' }}
                                    mode='contained'
                                    style={{
                                        marginHorizontal: 12,
                                        marginVertical: 6
                                    }}
                                >
                                    All events
                                </Button>
                            </View>
                        </>
                }
            </View>
        </>
    )
}
