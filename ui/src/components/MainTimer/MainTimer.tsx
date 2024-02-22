import React from 'react'
import { type TimeObj } from '@src/types'
import { Center, Stack } from '@mantine/core'
import classes from './MainTimer.module.css'

interface MainTimerProps {
    time: TimeObj
    start: () => void
    stop: () => unknown
    pause: () => unknown
    resume: () => unknown
}

export const MainTimer: React.FC<MainTimerProps> = ({ time, start, stop, pause, resume }) => {
    const number = 123
    console.log(number)

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
                <button
                    type='button'
                    onClick={start}
                >
                    Start
                </button>
                <button
                    type='button'
                    onClick={stop}
                >
                    Stop
                </button>
                <button
                    type='button'
                    onClick={pause}
                >
                    Pause
                </button>
                <button
                    type='button'
                    onClick={resume}
                >
                    Resume
                </button>
            </div>
        </Stack>
    )
}
