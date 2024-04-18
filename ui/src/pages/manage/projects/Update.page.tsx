import { useAppContext } from '@src/App.context'
import { useNavigate, useParams } from 'react-router-dom'
import { Identifier } from '@src/types'
import { Box, Button, LoadingOverlay, Text, TextInput, Title } from '@mantine/core'
import { KeyboardEventHandler, useCallback, useEffect, useState } from 'react'

export const UpdatePage = () => {
    const { projectBroker } = useAppContext()
    const { client_id, project_id } = useParams()

    const [name, setName] = useState('')

    const {
        data: client,
        isLoading,
        isError
    } = projectBroker.fetch(client_id as Identifier, project_id as Identifier, true)

    const navigate = useNavigate()

    useEffect(() => {
        if (client) {
            setName(client.name)
        }
    }, [client])

    const handleSubmit = useCallback(() => {
        projectBroker.update(project_id as Identifier, name).then(() => {
            projectBroker.invalidateProjects(client_id as Identifier).then(() => {})
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
                    label='Project name'
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
