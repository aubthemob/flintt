import React, { useEffect, useState } from 'react'
import { View, Text, FlatList } from 'react-native'

// Components
import CardMessage from './CardMessage'

// Contexts 
import { useUserState } from '../contexts/UserAuthContext'

// Lib
import dayjs from 'dayjs'
import { db, storage } from '../lib/firebase'
import { getCurrentUser } from 'expo-google-sign-in'

export default function CardChat({ cardPerspective, currentChatPartner, eventOrganizerId, eventId }) {
    
    const { user } = useUserState()
    const [messages, setMessages] = useState([])
    
    useEffect(() => {
        const accountabilityPartnerId = eventOrganizerId === user.uid ? currentChatPartner : user.uid
        const unsubscribe = db.collection('users').doc(eventOrganizerId)
            .collection('events').doc(eventId)
            .collection('conversations').doc(accountabilityPartnerId)
            .collection('messages').orderBy('dateTimeSent', 'desc').onSnapshot(snapshot => {
                const data = snapshot.docs.map(s => ({ ...s.data(), id: s.id }))
                
                // Convert data to format accepted by react-native-gifted-chat
                const newData = data.map(item => ({
                    _id: item.id,
                    text: item.messageContent,
                    createdAt: dayjs.unix(item.dateTimeSent.seconds),
                    user: item.senderId && {
                        _id: item.senderId,
                        avatar: currentChatPartner.avatarUrl && currentChatPartner.avatarUrl 
                    },
                    system: item.system,
                    image: item.image
                }))
                setMessages(newData.reverse())
            })
        return unsubscribe
    }, [currentChatPartner])

    return (
        <>
            {/* <View style={{ marginVertical: 12 }}> */}
                <FlatList 
                    data={messages.slice(-3)}
                    renderItem={({ item }) => (
                        <View key={item._id}>
                            <CardMessage 
                                text={item.text}
                                user={item.user}
                                system={item.system}
                            />
                        </View>
                    )}
                    scrollEnabled={false}
                    keyExtractor={item => item._id}
                />
            {/* </View> */}
        </>
    )
}
