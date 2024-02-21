import { MainTimer } from '@src/components/MainTimer/MainTimer'
import { ColorSchemeToggle } from '@src/components/ColorSchemeToggle/ColorSchemeToggle'
import { Center } from '@mantine/core'
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
        </>
    )
}
