import { Share, Alert } from 'react-native'
import { createLink } from './links'

export const handleShare = async (actionType, userId, displayName, eventId, eventGroupId) => {

    try {
        const { shortLink } = await createLink(actionType, userId, displayName, eventId, eventGroupId)
    
        await Share.share(
            {
                title: 'Join me on Flintt!',
                message: `Press this magic link to be my accountability partner on Flintt: ${shortLink}`,
            },
            {
                excludedActivityTypes: [
                    'com.apple.UIKit.activity.PostToWeibo',
                    'com.apple.UIKit.activity.Print',
                    'com.apple.UIKit.activity.CopyToPasteboard',
                    'com.apple.UIKit.activity.AssignToContact',
                    'com.apple.UIKit.activity.SaveToCameraRoll',
                    'com.apple.UIKit.activity.AddToReadingList',
                    'com.apple.UIKit.activity.PostToFlickr',
                    'com.apple.UIKit.activity.PostToVimeo',
                    'com.apple.UIKit.activity.PostToTencentWeibo',
                    'com.apple.UIKit.activity.AirDrop',
                    'com.apple.UIKit.activity.OpenInIBooks',
                    'com.apple.UIKit.activity.MarkupAsPDF',
                    'com.apple.reminders.RemindersEditorExtension',
                    'com.apple.mobilenotes.SharingExtension',
                    'com.apple.mobileslideshow.StreamShareService',
                    'com.linkedin.LinkedIn.ShareExtension',
                    'pinterest.ShareExtension',
                    'com.google.GooglePlus.ShareExtension',
                    'com.tumblr.tumblr.Share-With-Tumblr',
                    // 'net.whatsapp.WhatsApp.ShareExtension', //WhatsApp
                ]
            }
        )

    } catch(err) {
        Alert.alert(err.message)
    }

}