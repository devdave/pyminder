import {
    ActionIcon,
    Box,
    Breadcrumbs,
    Button,
    Group,
    LoadingOverlay,
    NumberInput,
    Title
} from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { ConfirmModal } from '@src/components/Modals/ConfirmModal'

import { useEffect, useState } from 'react'
import { Entry, Identifier } from '@src/types'
import { Link, useParams } from 'react-router-dom'
import { DataTable } from 'mantine-datatable'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { modals } from '@mantine/modals'

const EditEntryModal = (entry: Entry) => {
    const new_entry: Entry = { ...entry }
    new_entry.started_on = new Date(new_entry.started_on as string)
    new_entry.stopped_on = new Date(new_entry.stopped_on as string)

    return new Promise((resolve) => {
        const handleStartedChanged = (new_date: Date | null) => {
            console.log(new_entry.started_on, new_date)
            new_entry.started_on = new_date
            console.log(new_entry.started_on)
        }

        const handleStoppedChanged = (new_date: Date | null) => {
            new_entry.stopped_on = new_date
        }

        const handleSecondsChanged = (new_seconds: string | number) => {
            new_entry.seconds = Number(new_seconds)
        }

        const handleSubmit = () => {
            modals.close('editEntryModal')
            resolve(new_entry)
        }

        modals.open({
            modalId: 'editEntryModal',
            children: (
                <>
                    <DateTimePicker
                        label='Started on'
                        valueFormat='DD/MM/YYYY hh:mm:ss A'
                        withSeconds
                        value={new_entry.started_on}
                        onChange={(v) => handleStartedChanged(v)}
                    />
                    <DateTimePicker
                        label='Stopped on'
                        valueFormat='DD/MM/YYYY hh:mm:ss A'
                        withSeconds
                        value={new_entry.stopped_on}
                        onChange={handleStoppedChanged}
                    />
                    <NumberInput
                        label='seconds'
                        value={new_entry.seconds}
                        onChange={handleSecondsChanged}
                    />
                    <Button onClick={handleSubmit}>Submit</Button>
                </>
            )
        })
    })
}

interface FormProps {
    started_on: Date
    stopped_on: Date
    seconds: number | string
}

export const EntriesPage = () => {
    const { api, clientBroker, projectBroker, taskBroker, eventBroker } = useAppContext()
    const { client_id, project_id, task_id, event_id } = useParams()
    const [entries, setEntries] = useState<Entry[]>([])

    const form = useForm<FormProps>({
        initialValues: {
            started_on: new Date(),
            stopped_on: new Date(),
            seconds: 0
        }
    })

    const handleEdit = async (entry: Entry) => {
        const new_entry = await EditEntryModal(entry)
        console.log('new entry', new_entry)
    }

    const handleDelete = async (entryId: Identifier) => {
        const response = await ConfirmModal('Delete', 'Are you sure you want to delete this entry?')
        if (response) {
            console.log('would delete', entryId)
        }
    }

    const handleFormSubmit = (values: FormProps) => {
        console.log('handleFormSubmit', values)
        api.entry_create(
            event_id as Identifier,
            values.started_on.toISOString(),
            values.stopped_on.toISOString(),
            values.seconds as number
        ).then((record) => {
            if (record) {
                form.reset()
                api.entries_lists_by_event_id(event_id as Identifier).then((response) => {
                    setEntries(response)
                })
            } else {
                // eslint-disable-next-line no-alert
                window.alert(`Failed to create entry: ${JSON.stringify(values)}`)
            }
        })
    }

    const { data: taskData, isLoading: taskIsLoading } = taskBroker.fetch(
        project_id as Identifier,
        task_id as Identifier,
        true
    )
    const { data: myProject, isLoading: projectLoading } = projectBroker.fetch(
        client_id as Identifier,
        project_id as Identifier,
        true
    )
    const { data: clientRecord, isLoading: clientRecordLoading } = clientBroker.fetch(
        client_id as Identifier,
        true
    )

    const { data: eventRecord, isLoading: eventRecordLoading } = eventBroker.fetch(event_id as Identifier)

    const items = [
        { title: 'Clients', href: '/manage' },
        { title: `${clientRecord?.name}'s projects`, href: `/manage/client/${client_id}/projects` },
        {
            title: `${myProject?.name}'s tasks`,
            href: `/manage/client/${client_id}/projects/${project_id}/tasks`
        },
        {
            title: `${taskData?.name}'s events`,
            href: `/manage/client/${client_id}/projects/${project_id}/tasks/${task_id}/events`
        }
    ].map((item, index) => (
        <Link
            key={index}
            to={item.href}
        >
            {item.title}
        </Link>
    ))

    useEffect(() => {
        api.entries_lists_by_event_id(event_id as Identifier).then((response) => {
            setEntries(response)
        })
    }, [api, event_id])

    if (taskIsLoading || projectLoading || clientRecordLoading || eventRecordLoading) {
        return <LoadingOverlay visible />
    }

    return (
        <>
            <Title>{eventRecord?.start_date}'s entries</Title>
            <Breadcrumbs
                separator='→'
                separatorMargin='xs'
            >
                {items}
            </Breadcrumbs>
            <DataTable
                borderRadius='sm'
                withColumnBorders
                withTableBorder
                striped
                highlightOnHover
                records={entries}
                columns={[
                    {
                        accessor: 'id',
                        title: '#'
                    },
                    {
                        accessor: 'started_on',
                        title: 'Started @'
                    },
                    {
                        accessor: 'stopped_on',
                        title: 'Stopped @'
                    },
                    {
                        accessor: 'stop_reason',
                        title: 'Reason stopped'
                    },
                    {
                        accessor: 'seconds'
                    },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (entry) => (
                            <Group
                                gap={4}
                                justify='right'
                                wrap='nowrap'
                            >
                                <ActionIcon
                                    size='sm'
                                    variant='subtle'
                                    color='blue'
                                    onClick={() => handleEdit(entry).then()}
                                >
                                    <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                    size='sm'
                                    variant='subtle'
                                    color='red'
                                    onClick={() => handleDelete(entry.id).then()}
                                >
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        )
                    }
                ]}
            />
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
