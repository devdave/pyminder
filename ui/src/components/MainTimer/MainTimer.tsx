import React from 'react'
import { type TimeObj } from '@src/types'
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
        <>
            <span className='timer'>
                <span className={classes.hours}>{time.hour}</span>
                <span>:</span>
                <span className={classes.minutes}>{time.minute}</span>
                <span>:</span>
                <span className={classes.seconds}>{time.second}</span>
            </span>
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
        </>
    )
}
