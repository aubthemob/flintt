import React, { useState, useReducer, useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, SafeAreaView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Components
import GuestFederated from '../components/GuestFederated'
import GuestEmail from '../components/GuestEmail'
import PrivacyPolicy from '../components/PrivacyPolicy'
import UxGuidePopup from '../components/UxGuidePopup'

// Contexts
import { USER_AUTH_ACTIONS, useUserDispatch } from '../contexts/UserAuthContext'

// Lib
import Onboarding from 'react-native-onboarding-swiper'
import Modal from 'react-native-modal'

// Services
import { signInWithFacebook, signUpWithEmail, signInWithEmail, validateSignupCode } from '../services/auth'
import { setAddFirstFriendNotification } from '../services/pushNotifications'

// Styles
import { 
    appContainerCentered, 
    bodyText, 
    bodyTextLink,
    fullScreenButton, 
    fullScreenButtonLabelStyle, 
    fullScreenFormField,
    subtitleText
} from '../styles/styles'
import theme from '../styles/theme'
import { Avatar, Snackbar } from 'react-native-paper'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'

// Reducer
const GUEST_SCREEN_ACTIONS = {
    SIGN_IN_EMAIL: 'sign-in-email',
    SIGN_IN_FEDERATED: 'sign-in-federated',
    SIGN_UP_EMAIL: 'sign-up-email',
    SIGN_UP_FEDERATED: 'sign-up-federated',
}

function guestScreenStateReducer(state, action) {
    switch (action.type) {
        case GUEST_SCREEN_ACTIONS.SIGN_IN_EMAIL:
            return { authType: 'email', userAction: 'sign-in' }
        case GUEST_SCREEN_ACTIONS.SIGN_IN_FEDERATED:
            return { authType: 'federated', userAction: 'sign-in' }
        case GUEST_SCREEN_ACTIONS.SIGN_UP_EMAIL:
            return { authType: 'email', userAction: 'sign-up' }
        case GUEST_SCREEN_ACTIONS.SIGN_UP_FEDERATED:
            return { authType: 'federated', userAction: 'sign-up' }
        default: 
            throw new Error("Invalid action type")
    }
}

export default function GuestScreen() {
    const [form, setForm] = useState({ email: '', password: '', name: '' })
    const [guestScreenState, guestScreenDispatch] = useReducer(guestScreenStateReducer, { authType: 'email', userAction: 'sign-up' })
    const [onboardingComplete, setOnboardingComplete] = useState(false)

    const [loading, setLoading] = useState(false)
    const [snackbarIsVisible, setSnackbarIsVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState(false)

    const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false)
    const [onboardingObj, setOnboardingObj] = useState({})
    
    const userAuthDispatch = useUserDispatch()

    useEffect(() => {
        getOnboardingObj()
    }, [])

    const getOnboardingObj = async () => {
        const newOnboardingObj = await AsyncStorage.getItem('@onboardingObj')
        if (newOnboardingObj !== null) {
            setOnboardingObj(JSON.parse(newOnboardingObj))
        }
    }

    async function handleEmailSignInPress({ email, password }) {
        setLoading(true)
        try {
            userAuthDispatch({ type: USER_AUTH_ACTIONS.LOADING })
            await signInWithEmail(email, password)
            setLoading(false)
        } catch (err) {
            alert(err.message)
            console.log(err)
            setLoading(false)
        }
    }

    async function handleEmailSignUpPress({ email, password, name }) {
        setLoading(true)
        try {
            userAuthDispatch({ type: USER_AUTH_ACTIONS.LOADING })
            await signUpWithEmail(email, password, name)
            // await setAddFirstFriendNotification(userId)
            setLoading(false)
        } catch (err) {
            if (err.message === 'Missing or insufficient permissions.') {
                setSnackbarIsVisible(true)
                setSnackbarMessage('This signup code is invalid')
            } else {
                setSnackbarIsVisible(true)
                setSnackbarMessage(err.message)
            }
            // alert(err.message)
            // console.log(err)
            setLoading(false)
        }
    }

    async function handleFacebookSignUpPress() { // also services as Facebook sign in
        try {
            await signInWithFacebook()
        } catch (err) {
            console.log(err.message)
            // no alert because it would appear if the user exits the login modal
        }
    }

    async function handleGoogleSignUpPress() { // also serves as Google sign in
        try {
            // await signInWithFacebook() // --> REPLACE WITH GOOGLE SIGN IN SERVICE
        } catch (err) {
            console.log(err)
            // no alert because it would appear if the user exits the login modal
        }
    }

    return (
        <>
        <SafeAreaView style={{ flex: 1 }}>
            {
                Object.keys(onboardingObj).length !== 0 && onboardingComplete === false && 
                    <View
                        style={{
                            position: 'absolute',
                            top: 60,
                            zIndex: 1,
                            // left: 100,
                            alignSelf: 'flex-end',
                        }}
                    >
                        <UxGuidePopup 
                            referrerName={onboardingObj.referrerName}
                            type='onboarding-flow-friend-context'
                        />

                    </View>
            }

            {
                onboardingComplete === false ?
                    <Onboarding 
                        containerStyles={{
                            // flexDirection: 'row',
                            alignContent: 'center',
                            // justifyContent: 'flex-start'
                        }}
                        showSkip={false}
                        bottomBarHighlight={false}
                        DoneButtonComponent={props => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                                <Text style={[styles.bodyText, { fontSize: 18, color: theme.colors.accent  }]} {...props} >Done</Text>
                                <Avatar.Icon icon="chevron-right" size={32} backgroundColor="transparent" color={theme.colors.accent} />
                            </View>
                        )}
                        NextButtonComponent={props => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                                <Text style={[styles.bodyText, { fontSize: 18, color: theme.colors.accent  }]} {...props} >Next</Text>
                                <Avatar.Icon icon="chevron-right" size={32} backgroundColor="transparent" color={theme.colors.accent} />
                            </View>
                        )}
                        titleStyles={styles.subtitleText}
                        subTitleStyles={{ fontFamily: 'Ubuntu-Regular', color: theme.colors.text, marginHorizontal: 36 }}
                        pages={[
                            {
                                backgroundColor: '#f0f2f5',
                                image: <Image 
                                    source={require('./images/Normal_logo_mod.png')} 
                                    style={{ width: windowWidth/2, height: windowWidth/1.25/1.77 }}
                                    resizeMode='contain'
                                />,
                                title: 'Stay healthy with your friends',
                                subtitle: ''
                            },
                            {
                                backgroundColor: '#f0f2f5',
                                image: <Image 
                                    source={require('./images/onboarding_1.png')} 
                                    style={{ width: windowWidth/1.25, height: windowWidth/1.25/1.77 }}
                                    resizeMode='contain'
                                />,
                                title: 'Plan',
                                subtitle: "Design your ideal week and tag friends to keep you accountable",
                            },
                            {
                                backgroundColor: '#f0f2f5',
                                image: <Image 
                                    source={require('./images/onboarding_2.png')} 
                                    style={{ width: windowWidth/1.25, height: windowWidth/1.25/1.77 }}
                                    resizeMode='contain'
                                />,
                                title: 'Share',
                                subtitle: 'Track and share your daily progress with your friends',
                            },
                            {
                                backgroundColor: '#f0f2f5',
                                image: <Image 
                                    source={require('./images/onboarding_3.png')} 
                                    style={{ width: windowWidth/1.25, height: windowWidth/1.25/1.77 }}
                                    resizeMode='contain'
                                />,
                                title: 'Encourage',
                                subtitle: 'Encourage your friends to help them achieve their goals',
                            },
                        ]}
                        onDone={() => setOnboardingComplete(true)}
                        onSkip={() => setOnboardingComplete(true)}
                    /> :
                    <KeyboardAwareScrollView 
                        keyboardShouldPersistTaps='always'
                        contentContainerStyle={{ flex: 0, justifyContent: 'space-around' }}
                        enableOnAndroid={true}
                    >

                        <Image 
                            source={require('../../assets/Normal_logo_mod.png')} 
                            style={{ height: 200, width: 200, alignSelf: 'center' }}
                            resizeMode="contain"
                        />

                        <Text style={[styles.subtitleText, { textAlign: 'center', marginVertical: 48 }]}>
                            Stay healthy with your friends
                        </Text>

                        <View>  

                            {
                                guestScreenState.authType === 'federated' &&
                                (
                                    <GuestFederated 
                                        GUEST_SCREEN_ACTIONS={GUEST_SCREEN_ACTIONS}
                                        guestScreenDispatch={guestScreenDispatch}
                                        guestScreenState={guestScreenState}
                                        handleFacebookAuthPress={handleFacebookSignUpPress} 
                                        handleGoogleAuthPress={handleGoogleSignUpPress} 
                                    />
                                ) 
                            }   

                            {
                                guestScreenState.authType === 'email' &&
                                (
                                    <GuestEmail 
                                        form={form}
                                        guestScreenState={guestScreenState}
                                        handleEmailAuth={ guestScreenState.userAction === 'sign-in' ? handleEmailSignInPress : handleEmailSignUpPress }
                                        setForm={setForm}
                                        loading={loading}
                                    />
                                )
                            }

                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>

                                {
                                    guestScreenState.userAction === 'sign-in' ? 
                                    (
                                        <>
                                            <Text style={[styles.bodyText, { marginBottom: 24 }]}>
                                                Don't have an account yet? 
                                            </Text>

                                            <TouchableOpacity onPress={() => guestScreenDispatch({ type: GUEST_SCREEN_ACTIONS.SIGN_UP_FEDERATED })}>
                                                <Text style={styles.bodyTextLink}> Create account.</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={[styles.bodyText, { marginBottom: 24 }]}>
                                                Already have an account? 
                                            </Text>

                                            <TouchableOpacity onPress={() => guestScreenDispatch({ type: GUEST_SCREEN_ACTIONS.SIGN_IN_FEDERATED })}>
                                                <Text style={styles.bodyTextLink}> Login.</Text>
                                            </TouchableOpacity>
                                        </>
                                    )
                                }

                            </View>  

                            <TouchableWithoutFeedback 
                                onPress={() => setPrivacyPolicyVisible(true)}
                            >
                                <Text style={[styles.bodyText, { alignSelf: 'center', marginBottom: 12 }]}>
                                    Privacy Policy
                                </Text>
                            </TouchableWithoutFeedback>

                        </View>

                        <Modal
                            isVisible={privacyPolicyVisible}
                            onBackButtonPress={() => setPrivacyPolicyVisible(false)}
                        >
                            <PrivacyPolicy 
                                close={setPrivacyPolicyVisible}
                            />
                        </Modal>

                    </KeyboardAwareScrollView>
            }

            

            <Snackbar 
                visible={snackbarIsVisible}
                onDismiss={() => setSnackbarIsVisible(false)}
                duration={3000}
                style={{ backgroundColor: '#404040' }}
            >
                {snackbarMessage}
            </Snackbar>
        </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    appContainerCentered,
    bodyText,
    bodyTextLink,
    fullScreenButton,
    fullScreenButtonLabelStyle,
    fullScreenFormField,
    logo: {
        height: windowHeight/4*0.446875,
        marginBottom: 48,
        resizeMode: 'contain',
        width: windowWidth/4,
    },
    subtitleText
})