import { Identifier } from '@src/types'
import { Deferred } from './deferred'

type deferredCallback = (...args: [unknown]) => void
type deferredCallbacks = { [key: Identifier]: deferredCallback }

declare global {
    interface Window {
        returnCall: (identifier: Identifier, result: never) => void
        callBack: (identifier: Identifier, result: never) => void
        endCallback: (identifier: Identifier) => void
    }
}

export class Switchboard {
    callbacks: deferredCallbacks
    constructor() {
        this.callbacks = {}
        window.returnCall = this.returnVal.bind(this)
        window.callBack = this.callBack.bind(this)
        window.endCallback = this.finished.bind(this)
    }

    public generate(callBack: () => void): Identifier {
        const id = this.generateId()
        this.callbacks[id] = callBack
        return id
    }

    private generateId() {
        let newId = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz0123456789'
        const charLen = characters.length

        while (newId.length < 12) {
            newId += characters.charAt(Math.floor(Math.random() * charLen))
        }
        return newId
    }

    public register(d: Deferred) {
        const identifier = this.generateId()
        this.callbacks[identifier] = d.callback
        return identifier
    }

    public deregister(identifier: Identifier) {
        if (this.callbacks[identifier]) {
            delete this.callbacks[identifier]
        }
    }

    public finished(identifier: Identifier) {
        this.deregister(identifier)
    }

    public callBack(identifier: Identifier, ...results: [unknown]) {
        console.debug('Called ', identifier, results)
        this.callbacks[identifier]?.apply(null, results)
    }

    public returnVal(identifier: Identifier, result: unknown) {
        if (this.callbacks[identifier]) {
            this.callBack(identifier, result)
            this.deregister(identifier)
        }
    }
}
