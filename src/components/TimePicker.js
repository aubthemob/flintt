import React from 'react'

import dayjs from 'dayjs'
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme from '../styles/theme'

export default function TimePicker({ dateTime, type, formDispatch, EVENT_FORM_ACTIONS, isTimePickerVisible, setTimePickerVisibility }) {

    function handleTimeConfirm(selectedTime) {
        type === 'start' ?
        formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_START_TIME, payload: dayjs(selectedTime) }) :
        formDispatch({ type: EVENT_FORM_ACTIONS.CHANGE_END_TIME, payload: dayjs(selectedTime) })
    }

    return (
        <>
            <DateTimePickerModal 
                isVisible={isTimePickerVisible}
                onConfirm={ (selectedTime) => {
                    setTimePickerVisibility(false)
                    handleTimeConfirm(selectedTime)
                }}
                onCancel={() => setTimePickerVisibility(false)}
                testID="dateTimePicker"
                date={dateTime.toDate()}
                mode='time'
                is24Hour={false}
                display={Platform.OS === 'ios' ? "spinner" : 'clock'}
                headerTextIOS={type === 'start' ? `Select a start time` : 'Select an end time'}
                textColor={theme.colors.text}
            />
        </>
    )
}
