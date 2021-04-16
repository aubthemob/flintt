import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import * as Linking from 'expo-linking';


import Modal from 'react-native-modal'
import PrivacyPolicy from '../components/PrivacyPolicy'


import { logout } from '../services/auth'
import theme from '../styles/theme'


const Anchor = ({ title, href }) => {

    const handlePress = () => {
        try {
            Linking.openURL(href)
        } catch (err) {
            Alert.alert('Reach out to hello@flintt.co')
        }
    }

    return (
        <TouchableOpacity 
            onPress={handlePress}
        >
            <Text style={styles.textStyle}>
                {title}
            </Text>
        </TouchableOpacity>
    )
}

export default function SettingsScreen() {

    const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false)

    return (
        <>
            <View
                style={{
                    justifyContent: 'space-between',
                    paddingVertical: 48
                }}
            >

                <TouchableOpacity 
                    onPress={() => setPrivacyPolicyVisible(true)}
                >
                    <Text style={styles.textStyle}>
                        Privacy Policy
                    </Text>
                </TouchableOpacity>

                <Anchor title={'Support'} href={'mailto:hello@flintt.co'} />

                <TouchableOpacity 
                    onPress={logout}
                >
                    <Text style={styles.textStyle}>
                        Logout
                    </Text>
                </TouchableOpacity>

            </View>

            <Modal
                isVisible={privacyPolicyVisible}
                onBackButtonPress={() => setPrivacyPolicyVisible(false)}
            >
                <PrivacyPolicy 
                    close={setPrivacyPolicyVisible}
                />
            </Modal>

        </>
    )
}

const styles = StyleSheet.create({
    textStyle: {
        color: theme.colors.text,
        fontSize: 18,
        paddingHorizontal: 24,
        paddingVertical: 8
    }
})