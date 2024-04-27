import { Button, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useForm } from '@mantine/form'
import { DatePicker } from '@mantine/dates'
import { useNavigate, useParams } from 'react-router-dom'
import { Identifier } from '@src/types'

export const CreatePage = () => {
    const { api, eventBroker } = useAppContext()

    const { task_id } = useParams()

    const navigate = useNavigate()

    const form = useForm({
        initialValues: {
            start_date: new Date()
        }
    })

    const onCreate = () => {
        api.event_create(task_id as Identifier, form.values.start_date.toISOString()).then((response) => {
            navigate(-1)
        })
    }

    return (
        <>
            <Text>Start date</Text>
            <DatePicker {...form.getInputProps('start_date')} />
            <Button onClick={onCreate}>Create</Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
        </>
    )
}
