import React from 'react'
import { StyleSheet, View, } from 'react-native'

// Styles
import { Button } from 'react-native-paper';
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

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'

export default function GuestFederated(props) {
    const { 
        GUEST_SCREEN_ACTIONS,
        handleFacebookAuthPress, // serves both sign in and sign up function
        handleGoogleAuthPress, // serves both sign in and sign up function
        guestScreenDispatch,
        guestScreenState
    } = props

    return (
        <>
            {/* <Button 
                icon="google"
                labelStyle={fullScreenButtonLabelStyle}
                mode="contained" 
                onPress={handleGoogleAuthPress}
                style={styles.fullScreenButton}
            >
                { guestScreenState.userAction === 'sign-in' ? 'Login' : 'Create account' } with Google
            </Button>

            <Button 
                icon="facebook"
                labelStyle={fullScreenButtonLabelStyle}
                mode="contained" 
                onPress={handleFacebookAuthPress}
                style={styles.fullScreenButton}
            >
                { guestScreenState.userAction === 'sign-in' ? 'Login' : 'Create account' } with Facebook
            </Button> */}

            <Button 
                icon="email"
                labelStyle={fullScreenButtonLabelStyle}
                mode="contained" 
                onPress={() => {
                    guestScreenState.userAction === 'sign-in' ? 
                    guestScreenDispatch({ type: GUEST_SCREEN_ACTIONS.SIGN_IN_EMAIL }) :
                    guestScreenDispatch({ type: GUEST_SCREEN_ACTIONS.SIGN_UP_EMAIL })
                }}
                style={styles.fullScreenButton}
                color={theme.colors.accent}
            >
                { guestScreenState.userAction === 'sign-in' ? 'Login' : 'Create account' } with Email
            </Button>
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