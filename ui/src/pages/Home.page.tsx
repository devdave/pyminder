import { MainTimer } from '@src/components/MainTimer/MainTimer'
import { ColorSchemeToggle } from '@src/components/ColorSchemeToggle/ColorSchemeToggle'
import { SmartSelect } from '@src/components/SmartSelect/SmartSelect'
import { Center, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useState } from 'react'
import { TimeObj } from '@src/types'

export function HomePage() {
    const { api, switchboard } = useAppContext()

    const [currentTime, setCurrentTime] = useState<TimeObj>({ hour: 0, minute: 0, second: 0 })

    const timeChanged = (newTime: [number, number, number]) => {
        console.log('tick', newTime)
        setCurrentTime(() => ({
            hour: newTime[0],
            minute: newTime[1],
            second: newTime[2]
        }))
    }

    const startTime = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const id = switchboard.generate(timeChanged)
        api.timer_start(id).then()
    }

    const clientData = [
        { id: '1', value: 'self' },
        { id: '2', value: 'TwoBit' }
    ]

    const addClient = (clientName: string) => {
        const index = clientData.length
        clientData.push({ id: index.toString(), value: clientName })
    }

    const setClient = (clientId: string) => {
        const client = clientData.find((c) => c.id === clientId)
        if (client) {
            alert(`Set to ${JSON.stringify(client)}`)
        } else {
            alert(`Failed to find ${clientId}`)
        }
    }

    return (
        <>
            <ColorSchemeToggle />
            <Center>
                <MainTimer
                    time={currentTime}
                    start={startTime}
                    stop={() => api.timer_stop().then()}
                    pause={() => api.timer_pause().then()}
                    resume={() => api.timer_resume().then()}
                />
            </Center>
            <Center>
                <span>
                    <Text>Client</Text>
                    <SmartSelect
                        allData={clientData}
                        addData={addClient}
                        setData={setClient}
                        placeholder='Select Client'
                    />
                </span>
            </Center>
        </>
    )
}
