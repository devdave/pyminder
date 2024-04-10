import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-datatable/styles.layer.css'
import './layout.css'

import { ColorSchemeScript, MantineProvider, Text } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Router } from '@src/Router'
import Boundary, { PYWEBVIEWREADY } from '@src/library/boundary'
import APIBridge from '@src/api'
import { useEffect, useMemo, useState } from 'react'
import { AppContext, AppContextValue } from '@src/App.context'
import { Switchboard } from '@src/library/switchboard'
import { useClientBroker } from '@src/brokers/useClientBroker'
import { useProjectBroker } from '@src/brokers/useProjectBroker'
import { useTaskBroker } from '@src/brokers/useTaskBroker'
import { useEventBroker } from '@src/brokers/useEventBroker'
import { DatesProvider } from '@mantine/dates'
import { useShortcutBroker } from '@src/brokers/use-shortcut-broker'
import { useEntryBroker } from '@src/brokers/use-entry-broker'

const boundary = new Boundary()
const switchboard = new Switchboard()

declare global {
    interface navigator {
        msSaveBlob?: ((data: Blob[], fileName: string) => void) | undefined
    }
}

export default function App() {
    const [isReady, setIsReady] = useState(false)

    const api = useMemo(() => new APIBridge(boundary), [])
    const clientBroker = useClientBroker(api)
    const projectBroker = useProjectBroker(api)
    const taskBroker = useTaskBroker(api)
    const eventBroker = useEventBroker(api)
    const shortcutBroker = useShortcutBroker(api)
    const entryBroker = useEntryBroker(api)

    const appContextValue = useMemo<AppContextValue>(
        () => ({
            api,
            switchboard,
            clientBroker,
            projectBroker,
            taskBroker,
            eventBroker,
            shortcutBroker,
            entryBroker
        }),
        [api, clientBroker, projectBroker, taskBroker, eventBroker, shortcutBroker, entryBroker]
    )

    useEffect(() => {
        console.log('Connected')
        if (window.pywebview !== undefined && window.pywebview.api !== undefined) {
            setIsReady(true)
        } else {
            window.addEventListener(PYWEBVIEWREADY, () => setIsReady(true), { once: true })
        }
    }, [isReady, setIsReady])

    if (!isReady) {
        return (
            <MantineProvider defaultColorScheme='dark'>
                <Text>Waiting for backend</Text>
            </MantineProvider>
        )
    }

    return (
        <MantineProvider defaultColorScheme='dark'>
            <DatesProvider settings={{ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }}>
                <ModalsProvider>
                    <AppContext.Provider value={appContextValue}>
                        <Router />
                    </AppContext.Provider>
                </ModalsProvider>
            </DatesProvider>
        </MantineProvider>
    )
}
