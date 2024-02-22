import { useLocation } from 'react-router-dom'

interface Page404 {
    missing: React.ReactNode
    error?: Error
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Page404 = (props, context) => {
    const location = useLocation()

    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <>
            <h1>Error!</h1>
            <div>{JSON.stringify(props)}</div>
            <div>{JSON.stringify(context)}</div>
            <div>{JSON.stringify(location)}</div>
        </>
    )
}
