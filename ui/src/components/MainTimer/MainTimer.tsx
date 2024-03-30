import React from 'react'
import { type TimeObj } from '@src/types'
import { Button, Center, Group, Stack } from '@mantine/core'
import {
    IconPlayerPause,
    IconPlayerPauseFilled,
    IconPlayerPlay,
    IconPlayerPlayFilled,
    IconPlayerStop
} from '@tabler/icons-react'
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
        <Stack
            justify='flex-start'
            gap='0'
        >
            <Center className={classes.timer}>
                <span className={classes.hours}>{time.hour.toString().padStart(2, '0')}</span>
                <span>:</span>
                <span className={classes.minutes}>{String(time.minute).padStart(2, '0')}</span>
                <span>:</span>
                <span className={classes.seconds}>{String(time.second).padStart(2, '0')}</span>
            </Center>
            <Group
                justify='center'
                gap='xs'
            >
                <Button
                    variant='default'
                    size='xs'
                    disabled={!enabled || isRunning}
                    type='button'
                    onClick={doStart}
                    leftSection={isRunning ? <IconPlayerPlayFilled /> : <IconPlayerPlay />}
                >
                    Start
                </Button>
                <Button
                    variant='default'
                    size='xs'
                    disabled={!enabled || !isRunning}
                    type='button'
                    onClick={doStop}
                    leftSection={<IconPlayerStop />}
                >
                    Stop
                </Button>
                <Button
                    variant='default'
                    size='xs'
                    disabled={!isRunning}
                    type='button'
                    onClick={() => (isPaused ? doResume() : doPause())}
                    leftSection={isPaused ? <IconPlayerPauseFilled /> : <IconPlayerPause />}
                >
                    Pause
                </Button>
            </Group>
        </Stack>
    )
}
