// COMPONENT SHOULD BE RETIRED - NO LONGER USED

import React, { useState, useEffect, useRef } from 'react'
import { Text, View } from 'react-native'

import Carousel from 'react-native-snap-carousel'
import { Avatar, Button } from 'react-native-paper'

import CardChat from './CardChat'

// Analytics
import { chatPartnerSwipeEvent } from '../utils/analyticsEvents'

// Services
import { getCertainUsers } from '../services/users'

// Styles
import theme from '../styles/theme'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'

export default function AccountabilityPartnerChatSwiper({ fullAccountabilityPartners, fullCurrentChatPartner, setFullCurrentChatPartner  }) {

    const renderItem = ({ item, index }) => {
        return (
            <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar.Image size={38} source={ {uri: item.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} />
                    <Text style={{ marginLeft: 8, fontFamily: 'Ubuntu-Regular', color: theme.colors.text, fontSize: 20 }}>{item.displayName}</Text>
                </View>
            </>
        )
    }

    const carouselRef = useRef(null)

    const onSnapToItem = () => {
        const index = carouselRef.current.currentIndex
        const newFullChatPartner = fullAccountabilityPartners[index]
        setFullCurrentChatPartner(newFullChatPartner)
        chatPartnerSwipeEvent()
    }
    
    // const onLayout = () => {
    //     const index = carouselRef.current.currentIndex
    //     const newChatPartner = fullAccountabilityPartners[index].id
    //     setCurrentChatPartner(newChatPartner)
    // }

    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                {
                    fullAccountabilityPartners.length > 1 ?
                    <>
                        <Avatar.Icon icon='chevron-left' size={36} style={{ backgroundColor: 'transparent' }} color={theme.colors.text} />

                        <Carousel 
                            data={fullAccountabilityPartners} 
                            firstItem={0}
                            sliderWidth={windowWidth - 50}
                            itemWidth={windowWidth - 50}
                            renderItem={renderItem}
                            ref={carouselRef}
                            onSnapToItem={onSnapToItem}
                            // onLayout={onLayout}
                            loop={true}
                            lockScrollWhileSnapping={true}
                            activeSlideOffset={30}
                            slideStyle={ fullAccountabilityPartners.length > 1 ? { paddingRight: 72 } : {}}
                            lockScrollWhileSnapping={true}
                        />

                        <Avatar.Icon icon='chevron-right' size={36} style={{ backgroundColor: 'transparent' }} color={theme.colors.text} />
                    </>
                    :
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Avatar.Image size={38} source={{ uri: fullCurrentChatPartner.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} />
                        <Text style={{ marginLeft: 8, fontFamily: 'Ubuntu-Regular', color: theme.colors.text, fontSize: 20  }}>{fullCurrentChatPartner.displayName}</Text>
                    </View>
                }   
            </View>
        </>
    )
}
