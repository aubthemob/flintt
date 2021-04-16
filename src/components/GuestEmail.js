import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

// Styles
import { Button, TextInput } from 'react-native-paper';
import { 
    appContainerCentered, 
    bodyText, 
    bodyTextLink,
    fullScreenButton, 
    fullScreenButtonLabelStyle, 
    fullScreenFormField,
    subtitleText
} from '../styles/styles'

import { ActivityIndicator } from 'react-native-paper'
import theme from '../styles/theme'

// Utils
import { windowWidth, windowHeight } from '../utils/dimensions'

export default function GuestEmail(props) {

    const { 
        form,
        guestScreenState,
        handleEmailAuth,
        setForm,
        loading
    } = props
    
    return (
        <>
            {
                loading &&
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator animating={true} color={theme.colors.primary} size='large' />
                </View>
            }
            {
                !loading && guestScreenState.userAction === 'sign-up' &&
                <TextInput
                    autoFocus={false}
                    label="Name"
                    onChangeText={name => setForm({ ...form, name })}
                    style={styles.fullScreenFormField}
                    value={form.name}
                />
            }

            {
                !loading &&
                <>
                    <TextInput
                        autoCapitalize = 'none'
                        autoFocus={false}
                        label="Email"
                        onChangeText={email => setForm({ ...form, email })}
                        style={styles.fullScreenFormField}
                        fontFamily={"Montserrat-Regular"}
                        value={form.email}
                    />
                    
                    <TextInput
                        autoFocus={false}
                        label="Password"
                        onChangeText={password => setForm({ ...form, password })}
                        secureTextEntry={true}
                        style={styles.fullScreenFormField}
                        value={form.password}
                    />

                    {/* {
                        !loading && guestScreenState.userAction === 'sign-up' &&
                        <TextInput
                            autoFocus={false}
                            label="Signup code or friend code"
                            onChangeText={signupCode => setForm({ ...form, signupCode })}
                            secureTextEntry={false}
                            style={styles.fullScreenFormField}
                            value={form.signupCode}
                        />
                    } */}

                    <Button 
                        icon="email"
                        labelStyle={fullScreenButtonLabelStyle}
                        mode="contained" 
                        onPress={() => handleEmailAuth(form)}
                        color={theme.colors.accent}
                        style={styles.fullScreenButton}
                    >
                        {
                            guestScreenState.userAction === 'sign-in' ? 'Login' : 'Create account'
                        } with email
                    </Button>
                </>
            }
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