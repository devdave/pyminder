import APIBridge from '@src/api'
import { type Identifier } from '@src/types'

interface ITimerReturn {
    start: (hook_id: Identifier) => void
    stop: () => void
    pause: () => void
    resume: () => void
}

export const TimerBroker = (api: APIBridge): ITimerReturn => {
    let updater_timer_id = null

    const start = async (hook_id: Identifier) => {
        updater_timer_id = hook_id
        await api.timer_start(updater_timer_id)
    }

    const stop = async () => {
        await api.timer_stop()
        updater_timer_id = null
    }

    const pause = async () => {
        await api.timer_pause()
    }

    const resume = async () => {
        await api.timer_resume()
    }

    return {
        start,
        stop,
        pause,
        resume
    }
}
