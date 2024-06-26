import { Box, Button, Group, LoadingOverlay, NumberInput, Text, Title } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'

import { useForm } from '@mantine/form'
import { Entry, EntryUpdate, Identifier } from '@src/types'

import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '@src/App.context'
import { useEffect } from 'react'

interface FormProps {
    id: Identifier | null
    started_on: Date | null | undefined
    stopped_on: Date | null | undefined
    seconds: number | string
}

export const UpdatePage = () => {
    const { entry_id } = useParams()
    const { api, entryBroker } = useAppContext()
    const navigate = useNavigate()

    const { data: entryData, isLoading: dataIsLoading } = entryBroker.get(entry_id as Identifier)

    const form = useForm<FormProps>({
        initialValues: {
            id: null,
            started_on: null,
            stopped_on: null,
            seconds: 0
        }
    })

    useEffect(() => {
        if (entryData) {
            form.values.id = entryData.id
            form.values.started_on = entryData.started_on ? new Date(entryData.started_on) : new Date()
            form.values.stopped_on = entryData.stopped_on ? new Date(entryData.stopped_on) : new Date()
            form.values.seconds = entryData.seconds
            form.resetDirty()
        }
    }, [entryData])

    const localizeDate = (date: Date) => {
        const offset = new Date().getTimezoneOffset()
        date.setMinutes(date.getMinutes() - offset)
        return date.toISOString()
    }

    const handleFormSubmit = (values: FormProps) => {
        console.log('handleFormSubmit', values)
        const changeset: EntryUpdate = { ...values }
        changeset.started_on = localizeDate(values.started_on || new Date())
        changeset.stopped_on = localizeDate(values.stopped_on || new Date())

        api.entry_update(entry_id as Identifier, changeset as Entry).then(() => navigate(-1))
        navigate(-1)
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (dataIsLoading) {
        return (
            <>
                <LoadingOverlay visible />
                <Text>Loading data...</Text>
            </>
        )
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
