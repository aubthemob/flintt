import React, { useState } from 'react'
import { Alert, View, Text, StyleSheet, FlatList, TouchableWithoutFeedback, Button } from 'react-native'
import FeedCard from './FeedCard'

import Carousel from 'react-native-snap-carousel'

import { IconButton } from 'react-native-paper'
import theme from '../styles/theme'

import { windowWidth } from '../utils/dimensions'
import { handleShare } from '../utils/sharing'

export default function SupportersActivities({ allApEvents, feedApEvents, navigateToFriendsProfile, fullFriends, fullCurrentUser, showAddSupportersCard, setShowAddSupportersCard, navigateToChat, allUserEvents }) {

    const renderItem = ({ item }) => (
        <FeedCard 
            events={feedApEvents[item.id]}
            allEvents={allApEvents[item.id]}
            navigateToFriendsProfile={navigateToFriendsProfile}
            userId={item.id}
            fullCurrentUser={fullCurrentUser}
            navigateToChat={navigateToChat}
            allUserEvents={allUserEvents}
            allApEvents={allApEvents}
            {...item}
        />
    )

    return (
        <>
            <Carousel 
                data={fullFriends}
                renderItem={renderItem}
                itemWidth={windowWidth}
                sliderWidth={windowWidth}
                // loop={true}
                scrollEnabled={fullFriends.length === 0 ? false : true} 
                slideStyle={{
                    marginBottom: 24
                }}
            />

            {
                showAddSupportersCard &&
                <View
                    style={{
                        backgroundColor: 'white',
                        width: windowWidth*0.95,
                        borderRadius: 24,
                        paddingHorizontal: 36,
                        paddingTop: 24,
                        paddingBottom: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        marginVertical: 12
                    }}
                >

                <IconButton 
                    icon="window-close" 
                    size={18} 
                    style={{
                        backgroundColor: 'transparent', 
                        position: 'absolute',
                        left: 6,
                        top: 6,
                        zIndex: 1
                    }} 
                    color={theme.colors.text} 
                    onPress={() => setShowAddSupportersCard(false)}
                />
                    
                    <Text>
                        {
                                fullCurrentUser.persona === 'supporter' ? 
                                'Start helping someone become their best self.' :
                                "You're 85% more likely to stick to your commitments with a supporter."
                        }
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Button
                            onPress={() => handleShare('add-friend', fullCurrentUser.id, fullCurrentUser.displayName)}
                            title="Add a supporter"
                            color={theme.colors.accent}
                        />

                    </View>
                </View>
            }
        </>
    )
}
