import { Box, Button, Group, NumberInput, Title } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'

import { useForm } from '@mantine/form'
import { Entry, EntryUpdate, Identifier } from '@src/types'

import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '@src/App.context'

interface FormProps {
    started_on: Date | null | undefined
    stopped_on: Date | null | undefined
    seconds: number | string
}

export const CreatePage = () => {
    const { event_id, entry_id } = useParams()
    const { api, entryBroker } = useAppContext()
    const navigate = useNavigate()

    const { data: EntryData } = entryBroker.get(entry_id as Identifier)

    const form = useForm<FormProps>({
        initialValues: {
            started_on: EntryData && EntryData.started_on ? new Date(EntryData.started_on) : new Date(),
            stopped_on: EntryData && EntryData.stopped_on ? new Date(EntryData.stopped_on) : new Date(),
            seconds: EntryData?.seconds || 0
        }
    })

    const handleFormSubmit = (values: FormProps) => {
        console.log('handleFormSubmit', values)
        const changeset: EntryUpdate = { ...values }
        api.entry_update(entry_id as Identifier, changeset as Entry).then(() => navigate(-1))
    }

    const handleCancel = () => {
        navigate(-1)
    }

    return (
        <>
            <Title>New event</Title>
            <Box
                mx='auto'
                w='60vw'
            >
                <form onSubmit={form.onSubmit(handleFormSubmit)}>
                    <Group>
                        <DateTimePicker
                            label='Start time'
                            required
                            {...form.getInputProps('started_on')}
                        />
                        <DateTimePicker
                            label='Stop time'
                            required
                            {...form.getInputProps('stopped_on')}
                        />
                    </Group>
                    <NumberInput
                        placeholder='Optional seconds'
                        label='Seconds(optional)'
                        {...form.getInputProps('seconds')}
                    />
                    <Button type='submit'>Submit</Button>
                    <Button
                        type='button'
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </form>
            </Box>
        </>
    )
}
