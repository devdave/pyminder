import { type DependencyList, type EffectCallback, useEffect, useRef } from 'react'

export interface UseDebouncedEffectOptions {
    delay: number
    runOnInitialize?: boolean
}

export const useDebouncedEffect = (
    fn: EffectCallback,
    deps: DependencyList,
    { delay, runOnInitialize }: UseDebouncedEffectOptions
) => {
    const ref = useRef(false)

    useEffect(() => {
        if (!runOnInitialize && !ref.current) {
            ref.current = true
            return
        }

        const handler = setTimeout(() => {
            clearTimeout(handler)
            fn()
        }, delay)

        // eslint-disable-next-line consistent-return
        return () => {
            clearTimeout(handler)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}
