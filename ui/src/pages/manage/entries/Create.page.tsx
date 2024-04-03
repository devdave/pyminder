import { Box, Button, Group, NumberInput, Title } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'

import { useForm } from '@mantine/form'
import { Identifier } from '@src/types'

import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '@src/App.context'

interface FormProps {
    started_on: Date
    stopped_on: Date
    seconds: number | string
}

export const CreatePage = () => {
    const { event_id } = useParams()
    const { api } = useAppContext()
    const navigate = useNavigate()

    const form = useForm<FormProps>({
        initialValues: {
            started_on: new Date(),
            stopped_on: new Date(),
            seconds: 0
        }
    })

    const handleFormSubmit = (values: FormProps) => {
        console.log('handleFormSubmit', values)
        api.entry_create(
            event_id as Identifier,
            values.started_on.toISOString(),
            values.stopped_on.toISOString(),
            values.seconds as number
        ).then(() => {
            navigate(-1)
        })
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
                </form>
            </Box>
        </>
    )
}
