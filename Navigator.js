import React, { useState, useEffect } from 'react'
import { Share, Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications';
import * as Localization from 'expo-localization';

import { NavigationContainer, Text } from '@react-navigation/native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Components
import { GuestScreen, CalendarScreen, SocialScreen, FeedScreen, ProfileScreen } from './src/index'
import { AddFriendModal } from './src/components/AddFriendModal'
import ChatModal from './src/screens/ChatModal'

// Contexts
import { useUserState } from './src/contexts/UserAuthContext'

// Libraries
import { db, functions } from './src/lib/firebase'
import * as Analytics from 'expo-firebase-analytics'
import dayjs from 'dayjs'
import axios from 'axios'

// Services 
import { addFriendService } from './src/services/users'
import { addNewFriendAsAccountabilityPartner } from './src/services/events'

// Styles
import { IconButton } from 'react-native-paper'
import backgroundTheme from './src/styles/backgroundTheme'
import theme from './src/styles/theme'
import { registerCustomIconType } from 'react-native-elements'

// Utils
// import { registerForPushNotificationsAsync, sendPushNotification, selectPushNotification } from './src/utils/pushNotifications'
import { handleIncomingUrl } from './src/utils/links'
import SettingsScreen from './src/screens/SettingsScreen';

const FeedStack = createStackNavigator()
const CalendarStack = createStackNavigator()
const SocialStack = createStackNavigator()
const ProfileStack = createStackNavigator()
const GuestStack = createStackNavigator()

const Tab = createMaterialBottomTabNavigator()
const TopTab = createMaterialTopTabNavigator()

const options = {
    headerStyle: {
        shadowRadius: 3
    },
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
        fontFamily: 'Ubuntu-Bold',
        fontSize: 20
    },
    headerRight: () => addFriendButton()
}

const FeedStackScreen = () => {

    const { user } = useUserState()

    return (
        <FeedStack.Navigator>
            <FeedStack.Screen name="Today" component={FeedScreen} options={{
                headerStyle: {
                    shadowRadius: 3
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontFamily: 'Ubuntu-Bold',
                    fontSize: 20
                },
                title: dayjs().format('dddd, MMMM D')
            }} />
            <FeedStack.Screen name="Chat" component={ChatModal} options={{
                headerStyle: {
                    shadowRadius: 3
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontFamily: 'Ubuntu-Bold',
                    fontSize: 20
                },
                gestureEnabled: false, // disables the swipe to go back gesture
            }} />
            <ProfileStack.Screen 
                name="FriendProfile" 
                component={ProfileScreen} 
                options={({ route }) => ({
                    headerStyle: {
                        shadowRadius: 3
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontFamily: 'Ubuntu-Bold',
                        fontSize: 20
                    },
                    title: `${route.params.displayName}'s Profile`
                })} 
            />
        </FeedStack.Navigator>
    )
}

const CalendarStackScreen = () => {

    const { user } = useUserState()

    return (
        <CalendarStack.Navigator>
            <CalendarStack.Screen name="Calendar" component={CalendarScreen} options={{
                title: 'Commitments',
                headerStyle: {
                    shadowRadius: 3
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontFamily: 'Ubuntu-Bold',
                    fontSize: 20
                },
                // headerRight: () => addFriendButton(user.uid, user.displayName)
            }} 
            />
        </CalendarStack.Navigator>
    )
}

const tabBarOptions = {
    labelStyle: {
        fontFamily: 'Ubuntu-Bold',
        textTransform: 'none',
        fontSize: 15
    },
    inactiveTintColor: theme.colors.disabled,
    activeTintColor: theme.colors.text,
    indicatorStyle: {
        backgroundColor: theme.colors.primary
    },
    style: {
        elevation: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: "#EAEAEA",
        height: 70
    },
}

const ProfileStackScreen = () => {

    const { user } = useUserState()

    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{
                headerStyle: {
                    shadowRadius: 3
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontFamily: 'Ubuntu-Bold',
                    fontSize: 20
                },
                // headerRight: () => addFriendButton(user.uid, user.displayName)
            }} />
            <ProfileStack.Screen 
                name="FriendProfile" 
                component={ProfileScreen} 
                options={({ route }) => ({
                    headerStyle: {
                        shadowRadius: 3
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontFamily: 'Ubuntu-Bold',
                        fontSize: 20
                    },
                    title: `${route.params.displayName}'s Profile`
                })} 
            />
            <ProfileStack.Screen 
                name="SettingsScreen" 
                component={SettingsScreen} 
                options={({ route }) => ({
                    headerStyle: {
                        shadowRadius: 3
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontFamily: 'Ubuntu-Bold',
                        fontSize: 20
                    },
                    title: `Settings`
                })} 
            />
        </ProfileStack.Navigator>
    )
}

export default function Navigator() {

    const { user } = useUserState()

    const navigationRef = React.createRef()

    // get timezone 
    useEffect(() => {
        if (user) {
            try {
                const newFullUser = db.collection('users').doc(user.uid).get()
                // setFullUser(newFullUser)
                if (newFullUser.timezone === undefined) {
                    const timezone = Localization.timezone
                    db.collection('users').doc(user.uid).update({
                        timezone
                    })
                }
                return
            } catch(err) {
                console.log('This user has not been created yet')
            }
        }
    }, [])

    // push notification registration and listeners - move to context?
    useEffect(() => {

        // registerForPushNotificationsAsync().then(token => setExpoPushToken(token))

        const appClosedSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            // console.log(response)
            const url = response.notification.request.content.data.url
            Linking.openURL(url)
            // if (Platform.OS === 'ios') {
            //     const url = response.notification.request.content.data.url
            //     Linking.openURL(url)
            // } else if (Platform.OS === 'android') {
            //     const url = response.notification.request.content.data.url
            //     Linking.openURL(url)
            // }
        })

        // const appOpenSubscription = Notifications.addNotificationReceivedListener(notification => {
        //     console.log(notification)
        //     const url = notification.request.content.data.url;
        //     // Linking.openUrl(url);
        // });

        return () => {
            appClosedSubscription.remove()
            // appOpenSubscription.remove()
        } // should registerForPushNotificationsAsync be cleaned up? 
        
    }, [])

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    })

    // Receive links - move to context?
    useEffect(() => {

        // when the app is not already open
        const urlListener = async () => {
            const incomingUrl = await Linking.getInitialURL()
            // console.log(incomingUrl)
            if (incomingUrl) {
                handleIncomingUrl(incomingUrl)
            }
        }
        urlListener()

        // when the app is already open & in the background
        const unsubscribe = Linking.addEventListener('url', ({ url }) => {
            // console.log(url)
            try {
                handleIncomingUrl(url)
            } catch (err) {
                Alert.alert('You must login for this link to work')
            }
        })

        return unsubscribe

    }, [user])

    useEffect(() => {
        if (user) {
            Analytics.setUserId(user.uid)
        }
    }, [user])

    const prefix = Linking.makeUrl('/')

    const linking = {
        prefixes: ['https://flintt.co', prefix],
        config: {
            screens: {
                Today: {
                    screens: {
                        Chat: {
                            path: 'Chat/:chatPartnerId',
                            params: {
                                chatPartnerId: null
                            }
                        }
                    }
                }
            }
        },
        // subscribe(listener) {
        //     const onReceiveURL = ({ url }) => listener(url);
  
        //     // Listen to incoming links from deep linking
        //     Linking.addEventListener('url', onReceiveURL);
  
        //     // Listen to expo push notifications
        //     const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        //       const url = response.notification.request.content.data.url;
  
        //       // Any custom logic to see whether the URL needs to be handled
        //       //...
        //       console.log(url)
        //         Linking.openURL(url)
        //       // Let React Navigation handle the URL
        //       listener(url);
        //     });
  
        //     return () => {
        //       // Clean up the event listeners
        //       Linking.removeEventListener('url', onReceiveURL);
        //       subscription.remove();
        //     };
        // },
    }

    function getActiveRouteName(navigationState) {
        if (!navigationState) return null;
        const route = navigationState.routes[navigationState.index];
        // Parse the nested navigators
        if (route.routes) return getActiveRouteName(route);
        return route.routeName;
    }

    return (
        <>
            {
                user ? (
                    <>
                        <NavigationContainer 
                            theme={backgroundTheme}
                            linking={linking}
                            ref={navigationRef}
                        >
                            <Tab.Navigator
                                initialRouteName="Today"
                                tabBarOptions={tabBarOptions}
                                activeColor={theme.colors.primary}
                                inactiveColor="#707070"
                                barStyle={{ backgroundColor: '#FFF' }}
                                onNavigationStateChange={(prevState, currentState) => {
                                    const currentScreen = getActiveRouteName(currentState);
                                    const prevScreen = getActiveRouteName(prevState);
                                    if (prevScreen !== currentScreen) {
                                        Analytics.setCurrentScreen(currentScreen);
                                    }
                                }}
                                // screenOptions={{
                                //     headerStyle: {
                                //         backgroundColor: '#FFF',
                                //         shadowRadius: 3
                                //     },
                                //     headerTintColor: '#707070',
                                //     headerTitleStyle: {
                                //         fontFamily: 'Ubuntu-Medium',
                                //         fontSize: 18
                                //     },
                                // }}
                                // tabBarOptions={{
                                //     labelStyle: { 
                                //         fontFamily: 'Ubuntu-Medium',
                                //         fontSize: 10
                                //     },
                                //     keyboardHidesTabBar: true,
                                // }}
                            >
                                <Tab.Screen
                                    name="Today"
                                    component={FeedStackScreen}
                                    options={{
                                        tabBarLabel: "Today",
                                        tabBarIcon: 'card-text-outline',
                                    }}
                                />
                                <Tab.Screen
                                    name="Calendar"
                                    component={CalendarStackScreen}
                                    options={{
                                        tabBarLabel: 'Commitments',
                                        tabBarIcon: 'calendar',
                                    }}
                                />
                                <Tab.Screen
                                    name="Profile"
                                    component={ProfileStackScreen}
                                    options={{
                                        tabBarLabel: 'Profile', 
                                        tabBarIcon: 'account',
                                    }}
                                />
                            </Tab.Navigator>
                        </NavigationContainer> 
                    </>
                ) : (
                    <>
                        <NavigationContainer theme={backgroundTheme} linking={linking}>
                            <GuestStack.Navigator>
                                <GuestStack.Screen 
                                    name="Guest" 
                                    component={GuestScreen} 
                                    options={{ title: 'Guest', headerShown: false }}
                                />
                            </GuestStack.Navigator>
                        </NavigationContainer> 
                    </>
                )
            }
        </>
    )
}

// const ADD_FRIEND_QUERY_PARAMS = {
//     actionType: 'add-friend',
//     referrerId: 'LZv0dahEgGPTgcRVe0EEFkeVmZ32',
//     referrerName: 'Aubrey',
// }

