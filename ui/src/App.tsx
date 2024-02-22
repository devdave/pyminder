import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { Router } from '@src/Router'
import { theme } from '@src/theme'
import Boundary, { PYWEBVIEWREADY } from '@src/library/boundary'
import APIBridge from '@src/api'
import { useEffect, useMemo, useState } from 'react'
import { AppContext, AppContextValue } from '@src/App.context'
import { Switchboard } from '@src/library/switchboard'

const queryClient = new QueryClient()
const boundary = new Boundary()

export default function App() {
    const [isReady, setIsReady] = useState(false)

    const appContextValue = useMemo<AppContextValue>(
        () => ({
            api: new APIBridge(boundary),
            switchboard: new Switchboard()
        }),
        []
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
            <QueryClientProvider client={queryClient}>
                <AppContext.Provider value={appContextValue}>
                    <Router />
                </AppContext.Provider>
            </QueryClientProvider>
        </MantineProvider>
    )
}
