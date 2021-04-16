import theme from './theme'

// Buttons
export const fullScreenButton = {
    marginHorizontal: 36,
    marginVertical: 12,
}

export const fullScreenButtonLabelStyle = { 
    color: 'white', 
    fontFamily: 'Ubuntu-Regular' 
}

// Forms
export const fullScreenFormField = {
    backgroundColor: '#f0f2f5',
    fontFamily: 'Montserrat-Regular',
    marginHorizontal: 36,
    marginVertical: 12,
}

// Misc
export const chipToPlaceOnCalendar = {
    backgroundColor: theme.colors.primary,
    color: 'white',
    fontFamily: 'Montserrat-Regular',
    margin: 12,
    width: 108, // change to fit to the text in the chip
}

// Shadow
export const modalShadow = {
    elevation: 15, 
    backgroundColor: 'white',
    shadowColor: '#CCCCCC', 
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.8, 
    shadowRadius: 3
}

// Text
export const bodyText = {
    color: theme.colors.text,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
}

export const bodyTextLink = {
    color: theme.colors.primary,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
}

export const timePickerText = {
    color: theme.colors.text,
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
}

export const subtitleText = {
    color: theme.colors.text,
    fontFamily: 'Ubuntu-Bold',
    fontSize: 24,
    marginBottom: 24
}