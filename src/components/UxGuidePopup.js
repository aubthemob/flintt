import React from 'react'
import { View, Text } from 'react-native'

import { windowHeight, windowWidth } from '../utils/dimensions'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'

export default function UxGuidePopup({ referrerName, type, navigateToCalendarScreen }) {
    return (
        <>
            {
                type === 'onboarding-flow-friend-context' &&
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#404040', 
                            borderTopLeftRadius: 48,
                            borderBottomLeftRadius: 48,
                            padding: 18,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            flexShrink: 1,
                            maxWidth: windowWidth/2
                            // paddingRight: 100,
                            // alignSelf: 'flex-end'
                        }}
                    >
                        <Text
                            style={{
                                textAlign: 'left',
                                color: 'white',
                                fontFamily: 'Montserrat-Regular',
                                // alignSelf: 'flex-end'
                                // justifyContent: 'flex-end'
                            }}
                        >
                            {`${referrerName} is waiting for you inside!`}
                        </Text>
                    </View>
            }
            {
                type === 'schedule-activity-to-get-started' &&
                
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#404040', 
                            borderTopLeftRadius: 48,
                            borderBottomLeftRadius: 48,
                            padding: 18,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            flexShrink: 1,
                            // paddingRight: 100,
                            // alignSelf: 'flex-end'
                        }}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => navigateToCalendarScreen()}
                        >
                            <Text
                                style={{
                                    textAlign: 'left',
                                    color: 'white',
                                    fontFamily: 'Montserrat-Regular',
                                    // alignSelf: 'flex-end'
                                    // justifyContent: 'flex-end'
                                }}
                            >
                                {`Press here to get started by scheduling an activity of your own!`}
                            </Text>

                        </TouchableWithoutFeedback>
                    </View>
            }
            {
                type === 'press-cal-cell' &&
                
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#404040', 
                            borderTopLeftRadius: 48,
                            borderBottomLeftRadius: 48,
                            padding: 18,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            flexShrink: 1,
                            // paddingRight: 100,
                            // alignSelf: 'flex-end'
                        }}
                    >

                        <Text
                            style={{
                                textAlign: 'left',
                                color: 'white',
                                fontFamily: 'Montserrat-Regular',
                                // alignSelf: 'flex-end'
                                // justifyContent: 'flex-end'
                            }}
                        >
                            {`Press on a time slot to plan an activity`}
                        </Text>

                    </View>
            }
            
        </>
    )
}
