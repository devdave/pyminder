import { Identifier } from '@src/types'

interface Boundary {
    remote: (method_name: string, ...args: [unknown?]) => Promise<unknown>
}

class APIBridge {
    boundary: Boundary

    constructor(boundary: Boundary) {
        this.boundary = boundary
    }

    timer_start(listener_id: Identifier): Promise<boolean> {
        return this.boundary.remote('timer_start', listener_id) as Promise<boolean>
    }

    timer_stop(): Promise<boolean> {
        return this.boundary.remote('timer_stop') as Promise<boolean>
    }

    timer_pause(): Promise<boolean> {
        return this.boundary.remote('timer_pause') as Promise<boolean>
    }

    timer_resume(): Promise<boolean> {
        return this.boundary.remote('timer_resume') as Promise<boolean>
    }
}

export default APIBridge
