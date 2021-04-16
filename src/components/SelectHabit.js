import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import Modal from 'react-native-modal'
import Carousel from 'react-native-snap-carousel'

import { Avatar, IconButton } from 'react-native-paper';
import theme from '../styles/theme'

import { windowHeight, windowWidth } from '../utils/dimensions'

export default function SelectHabit({ formState, fullUser, getPlaceholders, EVENT_FORM_ACTIONS, formDispatch, editMode }) {

    // const [icon, setIcon] = useState('run')
    const [modalVisible, setModalVisible] = useState(false)
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)

    const carouselRef = useRef()

    useEffect(() => {
        if (Object.keys(fullUser).length > 0 && !editMode) {
            const { icon: newIcon } = getPlaceholders(fullUser)
            formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_ICON, payload: newIcon })
        }
    }, [fullUser])

    useEffect(() => {
        const icons = HABITS_CAROUSEL.map(i => i.icon)
        const index = icons.findIndex(i => i === formState.icon)
        setCurrentCarouselIndex(index)
    }, [formState])

    const renderItem = ({item, index}) => (
        <View
            style={{
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Avatar.Icon 
                icon={item.icon} 
                size={96} 
                style={{ backgroundColor: 'transparent' }} color={ item.key === formState.habit ? theme.colors.primary : 'grey' } 
            />
            <Text>
                {item.title}
            </Text>
        </View>
    )

    const onSnap = () => {
        const newCurrentIndex = carouselRef.current.currentIndex
        setCurrentCarouselIndex(newCurrentIndex)

        const habitKey = HABITS_CAROUSEL.find((item, index) => index === newCurrentIndex).key
        formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_HABIT, payload: habitKey })

        const habitIcon = HABITS_CAROUSEL.find((item, index) => index === newCurrentIndex).icon
        formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_ICON, payload: habitIcon })
    }

    // selects the first icon upon opening the modal for the first time
    const onLayout = () => {
        if (formState.habit === '') {
            onSnap()
        } 
    }

    return (
        <>
            <TouchableOpacity
                style={{
                    backgroundColor: '#EAEAEA',
                    borderRadius: 12,
                    marginRight: 12
                }}
                onPress={() => setModalVisible(true)}
            >
                <Avatar.Icon 
                    icon={formState.icon} 
                    size={48} 
                    style={{ backgroundColor: 'transparent' }} color={formState.habit ? '#707070' : "#c9c9c9" }
                /> 
            </TouchableOpacity>

            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        padding: 24,
                        borderRadius: 48
                    }}
                >
                    <IconButton 
                        icon={'arrow-left'}
                        size={24} 
                        style={{
                            backgroundColor: 'transparent', 
                            position: 'absolute',
                            left: 6,
                            top: 6,
                            zIndex: 1
                        }} 
                        color={theme.colors.text} 
                        onPress={() => setModalVisible(false)}
                    />
                    
                    <Carousel 
                        data={HABITS_CAROUSEL}
                        renderItem={renderItem}
                        sliderWidth={windowWidth/1.25}
                        itemWidth={windowWidth/3}
                        // loop
                        inactiveSlideScale={0.7}
                        onSnapToItem={onSnap}
                        onLayout={onLayout}
                        ref={carouselRef}
                        firstItem={currentCarouselIndex}
                    />
                </View>
            </Modal>
        </>
    )
}

const HABITS_CAROUSEL = [
    {
        icon: 'run',
        key: 'exercise',
        title: 'Exercise'
    },
    {
        icon: 'food-apple',
        key: 'nutrition',
        title: 'Nutrition'
    },
    {
        icon: 'emoticon-happy',
        key: 'mindfulness',
        title: 'Mindfulness'
    },
    {
        icon: 'power-sleep',
        key: 'sleep',
        title: 'Sleep'
    },
    {
        icon: 'dots-horizontal',
        key: 'other',
        title: 'Other'
    },
]