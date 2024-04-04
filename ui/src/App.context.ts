import { createContext, useContext } from 'react'
import APIBridge from '@src/api'
import { Switchboard } from '@src/library/switchboard'
import { clientBrokerReturns } from '@src/brokers/useClientBroker'
import { projectBrokerReturn } from '@src/brokers/useProjectBroker'
import { UseTaskBrokerReturns } from '@src/brokers/useTaskBroker'
import { UseEventBrokerReturn } from '@src/brokers/useEventBroker'
import { ShortcutBrokerFunctions } from '@src/brokers/use-shortcut-broker'
import { EntryBrokerFunctions } from '@src/brokers/use-entry-broker'

export interface AppContextValue {
    api: APIBridge
    switchboard: Switchboard
    clientBroker: clientBrokerReturns
    projectBroker: projectBrokerReturn
    taskBroker: UseTaskBrokerReturns
    eventBroker: UseEventBrokerReturn
    shortcutBroker: ShortcutBrokerFunctions
    entryBroker: EntryBrokerFunctions
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

export const useAppContext = () => useContext(AppContext)
