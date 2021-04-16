import React, { useState, useEffect, useRef, useReducer, useContext } from 'react'
import { Alert, StyleSheet, FlatList, TouchableOpacity, View, TextInput, LayoutAnimation, UIManager } from 'react-native'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Contexts
import { useUserState } from '../contexts/UserAuthContext'
import { CardContext } from './FeedCardOLD'

// Libraries
import SearchInput, { createFilter } from 'react-native-search-filter'

// Styles
import { Button, Avatar, List, Divider, IconButton } from 'react-native-paper';
import { fullScreenFormField } from '../styles/styles'
import theme from '../styles/theme'
import { ScrollView } from 'react-native-gesture-handler';

// Utils
import { windowWidth } from '../utils/dimensions'
import REASONS from '../utils/reasons'

// --- End of imports ---

const KEYS_TO_FILTER = ['title', 'key']

// Reducer

const SEARCH_REASONS_ACTIONS = {
    SHOW_LIST: 'show-list',
    HIDE_LIST: 'hide-list',
    CHANGE_INPUT: 'change-input',
    SET_SELECTED: 'set-selected'
}

const searchReasonsReducer = (state, action) => {
    switch (action.type) {
        case SEARCH_REASONS_ACTIONS.SHOW_LIST:
            return { ...state, dropdown: true, filteredReasons: action.payload }
        case SEARCH_REASONS_ACTIONS.HIDE_LIST:
            return { ...state, dropdown: false, searchValue: '' }
        case SEARCH_REASONS_ACTIONS.CHANGE_INPUT:
            const reasonList = action.payload.REASONS
            const filteredReasons = reasonList.filter(createFilter(action.payload.val, KEYS_TO_FILTER))
            return { ...state, searchValue: action.payload.val, filteredReasons }
        case SEARCH_REASONS_ACTIONS.SET_SELECTED:
            return { ...state, filteredReasons: action.payload }
        default:
            throw new Error("Invalid action type")
    }
}

export default function AddReasonForSkipping({ setComponentFocused, componentFocused, handleReasonPress, reasons, setTimeComponentFocused }) {
    const [searchReasonsState, searchReasonsDispatch] = useReducer(searchReasonsReducer, {
        searchValue: '',
        dropdown: componentFocused === 'ReasonForSkipping' ? true : false,
        filteredReasons: reasons,
    })

    const {
        currentEvent
    } = useContext(CardContext)

    useEffect(() => {
        if (componentFocused !== 'ReasonForSkipping') {
            searchReasonsDispatch({ type: SEARCH_REASONS_ACTIONS.HIDE_LIST })
        } 
    }, [componentFocused])

    useEffect(() => {
        const selectedReasons = reasons.map(r => {
            if (r.selected === true) {
                return r.key
            }
        })
        
        const newFilteredReasons = searchReasonsState.filteredReasons.map(r => {
            if (selectedReasons.includes(r.key)) {
                return {
                    ...r,
                    selected: true
                }
            } else {
                return {
                    ...r,
                    selected: false
                }
            }
        })
        
        searchReasonsDispatch({ type: SEARCH_REASONS_ACTIONS.SET_SELECTED, payload: newFilteredReasons })
    }, [reasons])

    const handleFocus = () => {
        searchReasonsDispatch({ type: SEARCH_REASONS_ACTIONS.SHOW_LIST, payload: REASONS })
        searchRef.current.focus()
        LayoutAnimation.spring()
        setComponentFocused('ReasonForSkipping')
        setTimeComponentFocused && setTimeComponentFocused(null)
    }

    const handleBlur = () => {
        searchRef.current.blur()
    }

    const handleCloseDropdown = () => {
        searchReasonsDispatch({ type: SEARCH_REASONS_ACTIONS.HIDE_LIST })
        searchRef.current.blur()
        setComponentFocused(null)
        LayoutAnimation.easeInEaseOut()
    }

    const searchRef = useRef()

    return (
        <> 
            <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>

                    <Avatar.Icon icon="information" size={42} style={{ backgroundColor: 'white' }} />
                    
                    <TouchableOpacity onPress={handleFocus} style={{ flex: 1, justifyContent: 'center' }}>
                        <View>
                            <TextInput
                                onChangeText={val => searchReasonsDispatch({ type: SEARCH_REASONS_ACTIONS.CHANGE_INPUT, payload: { val, REASONS } })}
                                style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text, fontSize: 14 }}
                                value={searchReasonsState.searchValue}
                                blurOnSubmit={false}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                ref={searchRef}
                                placeholder={`Why did you skip?`}
                            />
                        </View>
                    </TouchableOpacity>

                    <IconButton 
                        icon={ searchReasonsState.dropdown === true ? 'chevron-up' : 'plus-circle' }
                        size={24}
                        color={ searchReasonsState.dropdown === true ? theme.colors.text : theme.colors.primary }
                        onPress={() => searchReasonsState.dropdown === true ? handleCloseDropdown() : handleFocus()}
                    />

                </View>

                {   
                    componentFocused === 'ReasonForSkipping' && 
                        <Divider />  
                }

                <View style={ componentFocused === 'ReasonForSkipping' ? { flex: 2, backgroundColor: '#FAFAFA' } : { paddingHorizontal: 12 } }>
                    
                    <FlatList 
                        data={searchReasonsState.filteredReasons}
                        keyExtractor={item => item.key}
                        keyboardShouldPersistTaps='always'
                        ItemSeparatorComponent={() => searchReasonsState.dropdown === true ? <Divider /> : <></>}
                        renderItem={({ item }) => searchReasonsState.dropdown === true && 
                            <>
                                <TouchableOpacity 
                                    style={{ backgroundColor: '#FAFAFA' }}
                                    onPress={() => {
                                        handleReasonPress(item)
                                    }}
                                >
                                    <List.Item 
                                        title={item.title}
                                        titleStyle={ item.selected ===  true ? 
                                            {color: theme.colors.primary, fontFamily: 'Montserrat-Regular', fontSize: 12} : 
                                            {color: theme.colors.text, fontFamily: 'Montserrat-Regular', fontSize: 12} 
                                        }
                                        left={() => item.avatar && (
                                            <View style={{ alignSelf: 'center' }}>
                                                <Avatar.Image source={{ uri: item.avatar }} size={24} />
                                            </View>
                                        )}
                                    /> 
                                </TouchableOpacity>
                            </>
                        }
                    />
                    {   
                        componentFocused === 'ReasonForSkipping' && 
                            <Divider />  
                    }
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    // fullScreenFormField
})