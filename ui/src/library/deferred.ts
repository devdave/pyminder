type callbackMethod = (...args: unknown[]) => unknown
type callbacks = callbackMethod[]
export class Deferred {
    _callbacks: callbacks
    _result: unknown
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

    callback(result: unknown) {
        this._result = result
        this._executeCallbacks()
    }

    _executeCallbacks() {
        this._callbacks.forEach((callback) => {
            callback(this._result)
        })
        this._callbacks = []
    }
}
