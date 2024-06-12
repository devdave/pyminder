import { createContext, useContext } from 'react'
import APIBridge from '@src/api'
import { Switchboard } from '@src/library/switchboard'
import { type clientBrokerReturns } from '@src/brokers/useClientBroker'
import { type projectBrokerReturn } from '@src/brokers/useProjectBroker'
import { type UseTaskBrokerReturns } from '@src/brokers/useTaskBroker'
import { type UseEventBrokerReturn } from '@src/brokers/useEventBroker'
import { type ShortcutBrokerFunctions } from '@src/brokers/use-shortcut-broker'
import { type EntryBrokerFunctions } from '@src/brokers/use-entry-broker'
import { type ReportBrokerFunctions } from '@src/brokers/use-report-broker'

export interface AppContextValue {
    api: APIBridge
    switchboard: Switchboard
    clientBroker: clientBrokerReturns
    projectBroker: projectBrokerReturn
    taskBroker: UseTaskBrokerReturns
    eventBroker: UseEventBrokerReturn
    shortcutBroker: ShortcutBrokerFunctions
    entryBroker: EntryBrokerFunctions
    reportBroker: ReportBrokerFunctions
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

export const useAppContext = () => useContext(AppContext)
