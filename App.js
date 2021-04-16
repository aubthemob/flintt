import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import { Platform, Linking, LogBox } from 'react-native'
import AppLoading from 'expo-app-loading';
// import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Styles 
import { Provider as PaperProvider } from 'react-native-paper'
import theme from './src/styles/theme'
import * as Font from 'expo-font'

// Components
import Navigator from './Navigator'

// Contexts
import { UserAuthProvider } from './src/contexts/UserAuthContext'
import { SafeAreaView } from 'react-native';

// Styles
import backgroundTheme from './src/styles/backgroundTheme'

export default function App() {

  // LogBox.ignoreWarnings(['Setting a timer'])
  LogBox.ignoreLogs(['Setting a timer'])
  
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    loadFonts()
  }, [])

  const loadFonts = async () => {

    await Font.loadAsync({
      fontello: require('./assets/icons/fontello.ttf'),
      'Ubuntu-Regular': require('./assets/fonts/Ubuntu-Regular.ttf'),
      'Ubuntu-Medium': require('./assets/fonts/Ubuntu-Medium.ttf'),
      'Ubuntu-Bold': require('./assets/fonts/Ubuntu-Bold.ttf'),
      'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
      'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
      'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
    })
    setFontsLoaded(true)

  }

  if (!fontsLoaded) {
    return (
      <AppLoading 
        onFinish={() => setFontsLoaded(true)}
      />
    )
  } else {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <UserAuthProvider>
              {/* <SafeAreaView style={{ flex: 1 }}> */}
                <Navigator />
              {/* </SafeAreaView> */}
          </UserAuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }
}
