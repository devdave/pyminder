import { useAppContext } from '@src/App.context'
import { useNavigate, useParams } from 'react-router-dom'
import { Identifier } from '@src/types'
import { Box, Button, LoadingOverlay, Text } from '@mantine/core'

export const UpdatePage = () => {
    const { clientBroker } = useAppContext()
    const { client_id } = useParams()

    const { data: client, isLoading, isError } = clientBroker.fetch(client_id as Identifier, true)

    const navigate = useNavigate()

    if (isLoading) {
        return <LoadingOverlay visible />
    }
    if (isError || !client) {
        return <Text>Failed to load client {JSON.stringify(isError)}</Text>
    }
    return (
        <Box>
            <dt>Name</dt>
            <dd>{client.name}</dd>

            <fieldset>
                <Button onClick={() => alert('submit')}>Submit</Button>
                <Button onClick={() => navigate(-1)}>Cancel</Button>
            </fieldset>
        </Box>
    )
}
