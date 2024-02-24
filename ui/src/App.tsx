import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { Router } from '@src/Router'
import { theme } from '@src/theme'
import Boundary, { PYWEBVIEWREADY } from '@src/library/boundary'
import APIBridge from '@src/api'
import { useEffect, useMemo, useState } from 'react'
import { AppContext, AppContextValue } from '@src/App.context'
import { Switchboard } from '@src/library/switchboard'
import { useClientBroker } from '@src/brokers/useClientBroker'
import { useProjectBroker } from '@src/brokers/useProjectBroker'
import { useTaskBroker } from '@src/brokers/useTaskBroker'
import { useEventBroker } from '@src/brokers/useEventBroker'

const boundary = new Boundary()
const switchboard = new Switchboard()

export default function App() {
    const [isReady, setIsReady] = useState(false)

    const api = useMemo(() => new APIBridge(boundary), [])
    const clientBroker = useClientBroker(api)
    const projectBroker = useProjectBroker(api)
    const taskBroker = useTaskBroker(api)
    const eventBroker = useEventBroker(api)

    const appContextValue = useMemo<AppContextValue>(
        () => ({
            api,
            switchboard,
            clientBroker,
            projectBroker,
            taskBroker,
            eventBroker
        }),
        [api, clientBroker, eventBroker, projectBroker, taskBroker]
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
        return <MantineProvider>Connecting to backend</MantineProvider>
    }

    return (
        <MantineProvider theme={theme}>
            <AppContext.Provider value={appContextValue}>
                <Router />
            </AppContext.Provider>
        </MantineProvider>
    )
}
