import React from 'react'
import { type TimeObj } from '@src/types'
import { Button, Center, Stack } from '@mantine/core'
import classes from './MainTimer.module.css'

interface MainTimerProps {
    enabled: boolean
    time: TimeObj
    startCB: () => void
    stopCB: () => unknown
    pauseCB: () => unknown
    resumeCB: () => unknown
    currentlyRunning: boolean
    currentlyPaused: boolean
}

export const MainTimer: React.FC<MainTimerProps> = ({
    enabled,
    time,
    startCB,
    stopCB,
    pauseCB,
    resumeCB,
    currentlyRunning,
    currentlyPaused
}) => {
    const [isRunning, setRunning] = React.useState(currentlyRunning)
    const [isPaused, setPaused] = React.useState(currentlyPaused)

    const doStart = () => {
        startCB()
        setRunning(true)
    }

    const doStop = () => {
        stopCB()
        setRunning(false)
    }

    const doPause = () => {
        pauseCB()
        setPaused(true)
    }

    const doResume = () => {
        resumeCB()
        setPaused(false)
    }

    return (
        <Stack>
            <Center className={classes.timer}>
                <span className={classes.hours}>{time.hour.toString().padStart(2, '0')}</span>
                <span>:</span>
                <span className={classes.minutes}>{String(time.minute).padStart(2, '0')}</span>
                <span>:</span>
                <span className={classes.seconds}>{String(time.second).padStart(2, '0')}</span>
            </Center>
            <div>
                <Button
                    disabled={!enabled || isRunning}
                    type='button'
                    onClick={doStart}
                >
                    Start
                </Button>
                <Button
                    disabled={!enabled || !isRunning}
                    type='button'
                    onClick={doStop}
                >
                    Stop
                </Button>
                <Button
                    disabled={!isRunning || isPaused}
                    type='button'
                    onClick={doPause}
                >
                    Pause
                </Button>
                <Button
                    disabled={!isRunning || !isPaused}
                    type='button'
                    onClick={doResume}
                >
                    Resume
                </Button>
            </div>
        </Stack>
    )
}
