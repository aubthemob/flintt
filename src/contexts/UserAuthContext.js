import React, { useEffect, useReducer } from 'react'

import firebase from '../lib/firebase'

const UserStateContext = React.createContext()
const UserDispatchContext = React.createContext()

export const USER_AUTH_ACTIONS = {
    LOGOUT: 'logout',
    LOADING: 'loading',
    SUCCESS: 'success',
}

function userReducer(state, action) {
    switch (action.type) {
        case USER_AUTH_ACTIONS.LOGOUT:
            return { ...state, isLoading: false, user: null }
        case USER_AUTH_ACTIONS.LOADING:
            return { ...state, isLoading: true, user: null }
        case USER_AUTH_ACTIONS.SUCCESS:
            return { ...state, isLoading: false, user: action.payload }
        default: {
            throw new Error("Invalid action type")
        }   
    }
}

export function UserAuthProvider({ children }) {
    const [state, dispatch] = useReducer(userReducer, { isLoading: false, user: null })

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(userVar => {
            if (userVar) {
                dispatch({ type: USER_AUTH_ACTIONS.SUCCESS, payload: userVar })
            } else {
                dispatch({ type: USER_AUTH_ACTIONS.LOGOUT })
            }
        })
        return unsubscribe
    }, [])

    return (
        <>
            <UserStateContext.Provider value={state}>
                <UserDispatchContext.Provider value={dispatch}>
                    {children}
                </UserDispatchContext.Provider>
            </UserStateContext.Provider>
        </>
    )
}

export function useUserState() {
    const context = React.useContext(UserStateContext)
    if (context === undefined) {
        throw new Error('useUserState must be used within a UserAuthProvider')
    }
    return context
}

export function useUserDispatch() {
    const context = React.useContext(UserDispatchContext)
    if (context === undefined) {
        throw new Error('useUserDispatch must be used within a UserAuthProvider')
    }
    return context
}