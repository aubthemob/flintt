import React, { useState, useEffect, useRef, useReducer } from 'react'
import { 
    Alert, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    View, 
    TextInput, 
    LayoutAnimation, 
    UIManager, 
    KeyboardAvoidingView, 
    Text, 
    TouchableWithoutFeedback
 } from 'react-native'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Components
import AddFriendModal from './AddFriendModal'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Styles
import { Button, Avatar, List, Divider, IconButton, Chip } from 'react-native-paper';
import { fullScreenFormField } from '../styles/styles'
import theme from '../styles/theme'
import { ScrollView,  } from 'react-native-gesture-handler';
import Modal from 'react-native-modal'


// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'
import SearchInput, { createFilter } from 'react-native-search-filter'
import AddApToEventModal from './AddApToEventModal';

export default function AddAccountabilityPartners(props) {

    const { 
        friends, 
        getFriends, 
        setFriendsOnAddFirstFriendInFlow, 
        accountabilityPartners,
        formDispatch,
        EVENT_FORM_ACTIONS,
        eventId,
        eventGroupId
    } = props

    const [noFriendsPopupIsVisible, setNoFriendsPopupIsVisible] = useState(false)
    const [addApModalVisible, setAddApModalVisible] = useState(false)
    const [fullAccountabilityPartners, setFullAccountabilityPartners] = useState([])

    const { user } = useUserState()

    useEffect(() => {
        const allFriends = [...friends]
        const selectedFriends = allFriends.filter(f => accountabilityPartners.includes(f.id))
        setFullAccountabilityPartners(selectedFriends)
    }, [friends, accountabilityPartners])

    // changes the value of formState.accountability partners and dispatches to state
    const handleApPress = apId => {

        const currentAccountabilityPartners = [...accountabilityPartners]
        const newAccountabilityPartners =
        accountabilityPartners.includes(apId) ?
        accountabilityPartners.filter(a => a !== apId) :
        [...currentAccountabilityPartners, apId]

        formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_ACCOUNTABILITY_PARTNERS, payload: newAccountabilityPartners })
        
    }

    // console.log(accountabilityPartners)

    return (
        <> 
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>

                <Avatar.Icon icon="account-multiple" size={48} style={{ backgroundColor: 'white' }} />
                
                    {
                        accountabilityPartners.length === 0 &&
                            <View
                                style={{
                                    flexShrink: 1,
                                }}
                            >
                                <TouchableWithoutFeedback 
                                    onPress={() => setAddApModalVisible(true)} 
                                >
                                    <Text
                                        style={{ fontFamily: 'Montserrat-Regular', color: '#b7b7b7', fontSize: 18 }}
                                    >
                                        {`Friends tagged: ${accountabilityPartners.length}`}
                                    </Text>

                                </TouchableWithoutFeedback>
                                
                                <TouchableWithoutFeedback
                                    onPress={() => setAddApModalVisible(true)}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            // flexShrink: 1,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                flexShrink: 1,
                                                color: '#C32A2A',
                                                fontSize: 12,
                                                fontFamily: 'Montserrat-Regular',
                                            }}
                                        >
                                            {`You're 65% more likely to complete your activity if you tag an accountability partner!`}
                                        </Text>
                                        
                                    </View>

                                </TouchableWithoutFeedback>

                            </View>
                    }


                    <View
                        style={{
                            flexDirection: 'row',
                            marginRight: 'auto',
                            flexShrink: 1
                        }} 
                    >
                        {
                            accountabilityPartners.length > 0 && accountabilityPartners.length < friends.length &&
                                fullAccountabilityPartners.map(a => (

                                    <View
                                        key={a.id}
                                        style={{ flexShrink: 1 }}
                                    >
                                        <Chip
                                            mode='outlined'
                                            onClose={() => handleApPress(a.id)}
                                            style={{
                                                // backgroundColor: '#EAEAEA',
                                                marginRight: 8,
                                            }}
                                            key={a.id}
                                            textStyle={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text, fontSize: 16 }}
                                            avatar={ <Avatar.Image source={{ uri: a.avatarUrl || 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png' }} size={24}/> }
                                        >
                                            {a.displayName}
                                        </Chip>
                                        
                                    </View>

                                ))  
                        }

                        {
                            accountabilityPartners.length === friends.length && friends.length > 0 &&
                            <View
                                style={{
                                    flexShrink: 1,
                                }}
                            >
                                <TouchableWithoutFeedback 
                                    onPress={() => setAddApModalVisible(true)} 
                                >
                                    <Text
                                        style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text, fontSize: 18 }}
                                    >
                                        Visible to all supporters
                                    </Text>

                                </TouchableWithoutFeedback>
                                
                                <TouchableWithoutFeedback
                                    onPress={() => setAddApModalVisible(true)}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            // flexShrink: 1,
                                        }}
                                    >
                                        <Avatar.Icon 
                                            icon='information-outline'
                                            size={28}
                                            style={{
                                                backgroundColor: 'transparent'
                                            }}
                                            color='green'
                                        />
                                        <Text
                                            style={{
                                                flexShrink: 1,
                                                color: 'green',
                                                fontSize: 12,
                                                fontFamily: 'Montserrat-Regular',
                                            }}
                                        >
                                            Supporters will see if you completed this activity
                                        </Text>
                                        
                                    </View>

                                </TouchableWithoutFeedback>

                            </View>
                        }

                    </View>

                <IconButton 
                    icon='plus'
                    size={24}
                    color={theme.colors.text}
                    onPress={() => setAddApModalVisible(true)}
                />

            </View>

                

        <AddFriendModal 
            isVisible={noFriendsPopupIsVisible}
            close={setNoFriendsPopupIsVisible}
            user={user}
            getFriends={getFriends}
            setFriendsOnAddFirstFriendInFlow={setFriendsOnAddFirstFriendInFlow}
            type={'schedule-activity'}
        />

        <Modal
            isVisible={addApModalVisible}
            onBackdropPress={() => setAddApModalVisible(false)}
        >
            <AddApToEventModal 
                friends={friends}
                formDispatch={formDispatch}
                EVENT_FORM_ACTIONS={EVENT_FORM_ACTIONS}
                accountabilityPartners={accountabilityPartners}
                setAddApModalVisible={setAddApModalVisible}
                handleApPress={handleApPress}
                eventId={eventId}
                eventGroupId={eventGroupId}
            />
        </Modal>
        
        </>
    )
}

const styles = StyleSheet.create({
    // fullScreenFormField
})