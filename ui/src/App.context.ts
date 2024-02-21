import { createContext, useContext } from 'react'
import APIBridge from '@src/api'
import { Switchboard } from '@src/library/switchboard'

export interface AppContextValue {
    api: APIBridge
    switchboard: Switchboard
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

export const useAppContext = () => useContext(AppContext)
