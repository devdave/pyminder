import { useAppContext } from '@src/App.context'
import { useNavigate, useParams } from 'react-router-dom'
import { Identifier } from '@src/types'
import { Box, Button, LoadingOverlay, Text, TextInput, Title } from '@mantine/core'
import { KeyboardEventHandler, useCallback, useEffect, useState } from 'react'

export const UpdatePage = () => {
    const { clientBroker } = useAppContext()
    const { client_id } = useParams()

    const [name, setName] = useState('')

    const { data: client, isLoading, isError } = clientBroker.fetch(client_id as Identifier, true)

    const navigate = useNavigate()

    useEffect(() => {
        if (client) {
            setName(client.name)
        }
    }, [client])

    const handleSubmit = useCallback(() => {
        clientBroker.update(client_id as Identifier, name).then(() => {
            clientBroker.invalidateClients()
            navigate(-1)
        })
    }, [name])

    const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
        if (e.key === 'Escape') {
            navigate(-1)
        }
    }

    if (isLoading) {
        return <LoadingOverlay visible />
    }
    if (isError || !client) {
        return <Text>Failed to load client {JSON.stringify(isError)}</Text>
    }
    return (
        <Box>
            <fieldset>
                <legend>Edit name</legend>
                <TextInput
                    autoFocus
                    label='Client name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyUp={handleKeyUp}
                />

                <Button onClick={() => handleSubmit()}>Submit</Button>
                <Button onClick={() => navigate(-1)}>Cancel</Button>
            </fieldset>
        </Box>
    )
}
