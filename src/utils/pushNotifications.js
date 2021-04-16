import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import * as Linking from 'expo-linking'

export const registerForPushNotificationsAsync = async () => {
    let token
    
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }

      // change below
      // if (finalStatus !== 'granted') {
      //   alert('You will need to enable push notifications in your settings.')
      //   return;
      // }

      token = await Notifications.getExpoPushTokenAsync();
      
    } 
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (token) {
      return token.data
    }
};

// export async function sendPushNotification(expoPushToken, notification) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     // title: notification.title,
//     body: notification.body,
//     data: notification.data,
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });

// }

export function selectPushNotification({ type, notifFromName, activity }) {

  if (type === 'friend-tag') {
    return {
      body: `${notifFromName} wants you to help them with their activity '${activity}'!`,
      data: {
        url: Linking.makeUrl('Today')
      }
    }

  } else if (type === 'new-message') {
    return {
      body: `${notifFromName} sent you a new message.`,
      data: {
        url: Linking.makeUrl('Today')
      }
    }

  } else if (type === 'activity-reminder') {
    return {
      body: `It's almost time for your activity '${activity}' 👀`,
      data: {
        url: Linking.makeUrl('Today')
      }
    }
  } else if (type === 'add-first-friend') {
    return {
      title: 'Flintt is meant to be social!',
      body: 'Add your first accountability partner to get started.',
      data: {
        url: Linking.makeUrl('Profile')
      }
    }
  } else if (type === 'tracking-reminder') {

    return {
      title: `Did you complete your activity ${activity}?`,
      body: 'Let your accountability partners know!',
      data: {
        url: Linking.makeUrl('Today')
      }
    }
  }
  
}
