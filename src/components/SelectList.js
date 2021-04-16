import React, { useState, useEffect, useRef, useReducer } from 'react'
import { Alert, StyleSheet, FlatList, TouchableOpacity, View, TextInput, Text } from 'react-native'

// Contexts
import { useUserState } from '../contexts/UserAuthContext'

// Styles
import { Button, Avatar, List, Divider, IconButton } from 'react-native-paper';
import { fullScreenFormField } from '../styles/styles'
import theme from '../styles/theme'
import { ScrollView } from 'react-native-gesture-handler';

// Utils
import { windowWidth } from '../utils/dimensions'
import SearchInput, { createFilter } from 'react-native-search-filter'

// --- End of imports ---

const KEYS_TO_FILTER = ['title']

// Reducer

const SEARCH_ITEMS_ACTIONS = {
    SHOW_LIST: 'show-list',
    HIDE_LIST: 'hide-list',
    CHANGE_INPUT: 'change-input',
    SET_SELECTED: 'set-selected'
}

const searchItemsReducer = (state, action) => {
    switch (action.type) {
        case SEARCH_ITEMS_ACTIONS.SHOW_LIST:
            return { ...state, dropdown: true, filteredItems: action.payload }
        case SEARCH_ITEMS_ACTIONS.HIDE_LIST:
            return { ...state, dropdown: false, searchValue: '' }
        case SEARCH_ITEMS_ACTIONS.CHANGE_INPUT:
            const friendList = action.payload.items
            const filteredItems = friendList.filter(createFilter(action.payload.val, KEYS_TO_FILTER))
            return { ...state, searchValue: action.payload.val, filteredItems }
        case SEARCH_ITEMS_ACTIONS.SET_SELECTED:
            return { ...state, filteredItems: action.payload }
        default:
            throw new Error("Invalid action type")
    }
}

export default function SelectList({ items, handleItemPress, search }) {
    const [searchItemsState, searchItemsDispatch] = useReducer(searchItemsReducer, {
        searchValue: '',
        // dropdown: componentFocused === 'AddAccountabilityPartners' ? true : false,
        filteredItems: items
    })

    // useEffect(() => {
    //     if (componentFocused !== 'AddAccountabilityPartners') {
    //         searchItemsDispatch({ type: SEARCH_ITEMS_ACTIONS.HIDE_LIST })
    //     } 
    // }, [componentFocused])

    console.log(searchItemsState.filteredItems)

    useEffect(() => {
        const selectedItems = items.map(f => {
            if (f.selected === true) {
                return f.key
            }
        })
        
        const newfilteredItems = searchItemsState.filteredItems.map(f => {
            if (selectedItems.includes(f.key)) {
                return {
                    ...f,
                    selected: true
                }
            } else {
                return {
                    ...f,
                    selected: false
                }
            }
        })
        
        searchItemsDispatch({ type: SEARCH_ITEMS_ACTIONS.SET_SELECTED, payload: newfilteredItems })
    }, [items])

    const handleFocus = () => {
        searchItemsDispatch({ type: SEARCH_ITEMS_ACTIONS.SHOW_LIST, payload: items })
        searchRef.current.focus()
        // setComponentFocused('AddAccountabilityPartners')
    }

    const handleBlur = () => {
        searchRef.current.blur()
    }


    const searchRef = useRef()

    return (
        <> 
        <View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>

                {
                    search === true &&
                        <>
                            <TouchableOpacity onPress={handleFocus} style={{ flex: 1, justifyContent: 'center' }}>
                                <View>
                                    <TextInput
                                        onChangeText={val => searchItemsDispatch({ type: SEARCH_ITEMS_ACTIONS.CHANGE_INPUT, payload: { val, items } })}
                                        style={{ fontFamily: 'Montserrat-Regular', color: theme.colors.text, fontSize: 16 }}
                                        value={searchItemsState.searchValue}
                                        blurOnSubmit={false}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        ref={searchRef}
                                        placeholder="Add accountability partners"
                                    />
                                </View>
                            </TouchableOpacity>

                            <Divider /> 
                        </>
                }                

                {/* <IconButton 
                    icon={ searchItemsState.dropdown === true ? 'chevron-up' : 'plus-circle' }
                    size={24}
                    color={ searchItemsState.dropdown === true ? theme.colors.text : theme.colors.primary }
                    onPress={() => searchItemsState.dropdown === true ? handleCloseDropdown() : handleFocus()}
                /> */}

            </View>

            {/* {   
                componentFocused === 'AddAccountabilityPartners' && 
                    <Divider />  
            } */}

            <View style={{ paddingHorizontal: 12 }}>
                
                <FlatList 
                    data={searchItemsState.filteredItems}
                    keyExtractor={item => item.key}
                    keyboardShouldPersistTaps='always'
                    ItemSeparatorComponent={() => <Divider />}
                    bounces={true}
                    renderItem={({ item }) => (
                        <>
                            <TouchableOpacity 
                                // style={{ backgroundColor: '#FAFAFA' }}
                                onPress={() => handleItemPress(item)}
                            >
                                <List.Item 
                                    title={item.title}
                                    titleStyle={ item.selected ===  true ? 
                                        {color: theme.colors.primary, fontFamily: 'Montserrat-Regular', fontSize: 14} : 
                                        {color: theme.colors.text, fontFamily: 'Montserrat-Regular', fontSize: 14} 
                                    }
                                    left={() => item.avatar && (
                                        <View style={{ alignSelf: 'center' }}>
                                            <Avatar.Image source={{ uri: item.avatar }} size={24} />
                                        </View>
                                    )}
                                /> 
                            </TouchableOpacity>
                        </>
                    )}
                />

            </View>
        </View>
        </>
    )
}

const styles = StyleSheet.create({
    // fullScreenFormField
})

// *** READ ME *** 
// items must have key & title