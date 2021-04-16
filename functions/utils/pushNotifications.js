exports.selectPushNotification = ({ type, notifFromName, activity, url, events, accountabilityPartnerNames }) => {

    if (type === 'friend-tag') {

      return {
        title: `${notifFromName} wants to be held accountable.`,
        body: `Help them stay on track with their activity '${activity}'!`,
        data: {
          url
        }
      }
  
    } else if (type === 'new-message') {

      return {
        title: `${notifFromName} sent you a new message.`,
        body: 'Press here to see it.',
        data: {
          url
        }
      }
  
    } else if (type === 'activity-reminder') {

      return {
        title: `It's time for '${activity}' in 30 minutes!`,
        body: 'Are you ready? 👀',
        data: {
          url
        }
      }

    } else if (type === 'add-first-friend') {

      return {
        title: 'Flintt is meant to be social!',
        body: 'Add your first accountability partner to get started.',
        data: {
          url
        }
      }

    } else if (type === 'tracking-reminder') {

      return {
        title: `Did you complete your activity '${activity}'?`,
        body: accountabilityPartnerNames.length > 0 ? `Let ${accountabilityPartnerNames[0]} know!` : 'Log it to see your progress!',
        data: {
          url
        }
      }

    } else if (type === 'accountability-partner-nudge') {

        return {
            title: `${notifFromName} hasn't completed their activity '${activity}' yet.`,
            body: 'Nudge them to keep them on track!',
            data: {
                url
            }
        }

    } else if (type === 'activity-time') {

        return {
            title: `It's time for your activity '${activity}.'`,
            body: accountabilityPartnerNames.length > 0 ? `Show ${accountabilityPartnerNames[0]} you can do it!` : 'You got this!',
            data: {
                url
            }
        }

    } else if (type === 'list-activities-tomorrow') {

        if (events.length === 1) {

            return {
                title: `You have one activity planned tomorow...`,
                body: `Are you ready for '${events[0]}'?`,
                data: {
                    url
                }
            }

        } else if (activities.length > 1) {

            return {
                title: `You have ${events.length} activities tomorrow...`,
                body: `Are you ready?`,
                data: {
                    url
                }
            }
        }
            
    } else if (type === 'schedule-activity-tomorrow-prompt') {

        return {
            title: 'You have nothing scheduled for tomorrow.',
            body: 'Press here to plan your day!',
            data: {
                url
            }
        }

    } else if (type === 'new-friend-added') {

        return {
          title: `You're now friends with ${notifFromName} on Flintt!`,
          body: 'Press here to tag them on an activity.',
          data: {
              url
          }
      }

    }
    
  }
  