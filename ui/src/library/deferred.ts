type callbackMethod = (...args: any[]) => void | any
type callbacks = callbackMethod[]
export class Deferred {
    _callbacks: callbacks
    _result: any
    constructor() {
        this._callbacks = []
        this._result = null
    }

    addCallback(callback: callbackMethod) {
        this._callbacks.push(callback)
        if (this._result !== null) {
            this._executeCallbacks()
        }
        return this
    }

    then(callback: callbackMethod) {
        return this.addCallback(callback)
    }

    callback(result: any) {
        this._result = result
        this._executeCallbacks()
    }

    _executeCallbacks() {
        for (const callback of this._callbacks) {
            callback(this._result)
        }
        this._callbacks = []
    }
}
