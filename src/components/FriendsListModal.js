import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'

import { useUserState } from '../contexts/UserAuthContext'

import { deleteFriend } from '../services/users'

import { IconButton, List, Avatar, Divider } from 'react-native-paper'
import theme from '../styles/theme'

export default function FriendsListModal({ fullFriends, setFriendModalVisible, navigateToFriendsProfile, perspective }) {

    const { user } = useUserState()

    return (
        <>
             <View
                style={{
                    backgroundColor: 'white',
                    padding: 24,
                    borderRadius: 48
                }}
            >

                <IconButton 
                    icon={'close'}
                    size={24} 
                    style={{
                        backgroundColor: 'transparent', 
                        position: 'absolute',
                        left: 6,
                        top: 6,
                        zIndex: 1
                    }} 
                    color={theme.colors.text} 
                    onPress={() => setFriendModalVisible(false)}
                />
                    <FlatList 
                        data={fullFriends}
                        keyExtractor={item => item.id}
                        // keyboardShouldPersistTaps='always'
                        ItemSeparatorComponent={() => <Divider />}
                        style={{ marginTop: 12 }}
                        renderItem={({ item }) => (
                            <>
                                <List.Item 
                                    onPress={() => {
                                        if (perspective === 'current-user') {
                                            setFriendModalVisible(false)
                                            navigateToFriendsProfile({ userId: item.id, displayName: item.displayName })

                                        } 
                                    }}
                                    disabled={perspective === 'current-user' ? false : true}
                                    title={item.displayName}
                                    titleStyle={{
                                        fontFamily: 'Montserrat-Regular',
                                        fontSize: 18
                                    }}
                                    left={() => (
                                        <View style={{ alignSelf: 'center' }}>
                                            <Avatar.Image source={{ uri: item.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} size={36} />
                                        </View>
                                    )}
                                    right={() => (
                                        perspective === 'current-user' ?
                                        <TouchableOpacity>
                                            <IconButton 
                                                onPress={() => {
                                                    deleteFriend(user.uid, item.id)
                                                    setFriendModalVisible(false)
                                                }}
                                                icon='account-remove'
                                                color='#C32A2A'
                                            />

                                        </TouchableOpacity> :
                                        <>
                                        </>
                                    )}
                                /> 
                            </>

                        )}
                    />
            </View>
        </>
    )
}
