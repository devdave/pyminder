// noinspection SpellCheckingInspection

import { Switchboard } from './switchboard'
import { Deferred } from './deferred'

type remoteMethod = (...args: unknown[]) => unknown | void
type remoteMethods = { [key: string]: remoteMethod }

declare global {
    interface Window {
        pywebview: {
            api: remoteMethods
        }
    }
}

export const PYWEBVIEWREADY = 'pywebviewready'

class Boundary {
    isConnected: boolean
    backendHooks: remoteMethods
    switch: Switchboard
    constructor() {
        this.isConnected = false
        this.backendHooks = {}
        this.switch = new Switchboard()
    }

    private connect() {
        if (this.isConnected) {
            return
        }

        if (window?.pywebview?.api.info !== undefined) {
            this.backendHooks = window.pywebview.api
            this.isConnected = true
            this.info('Connected!')
        } else {
            throw Error(`Unable to connect to backend; ${window.pywebview}`)
        }
    }

    public async remote(remoteName: string, ...args: unknown[]): Promise<unknown> {
        console.groupCollapsed(remoteName)
        this.info(`Calling ${remoteName} with:`, args)
        console.trace()
        const retval = this._remote(remoteName, ...args)
        console.groupEnd()
        return retval
    }

    private async _remote(remoteName: string, ...args: unknown[]): Promise<unknown> {
        this.connect()

        if (!(remoteName in this.backendHooks)) {
            throw Error(`Missing ${remoteName} from backend hooks.`)
        }

        const func = this.backendHooks[remoteName]
        return func.apply(this, args)
    }

    public request(remoteName: string, ...args: unknown[]): Deferred {
        const d = new Deferred()
        const id = this.switch.register(d)
        this.remote(remoteName, [...args, id]).then()
        return d
    }

    public info(...message: unknown[]): void {
        console.log(...message)
        this._remote('info', message).then()
    }
}

export default Boundary
