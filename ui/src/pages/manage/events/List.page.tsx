import { ActionIcon, Group, LoadingOverlay, Text } from '@mantine/core'
import { Identifier } from '@src/types'
import { Link, useParams } from 'react-router-dom'
import { useAppContext } from '@src/App.context'

import { DataTable } from 'mantine-datatable'
import { IconEdit, IconTrash } from '@tabler/icons-react'

export const ListPage = () => {
    const { task_id } = useParams()

    const { eventBroker, api } = useAppContext()

    const { data: allEvents, isLoading: allEventsAreLoading } = eventBroker.useGetAllByTask(
        task_id as Identifier
    )

    const handleEdit = (event_id: Identifier) => {
        console.log(event_id)
    }

    const handleDelete = (event_id: Identifier) => {
        if (confirm('Are you sure you want to delete this?')) {
            eventBroker.destroy(event_id).then(() => {})
        }
    }

    if (allEventsAreLoading) {
        return <LoadingOverlay visible />
    }

    if (!allEvents) {
        return <Text>Data failed to load!</Text>
    }

    return (
        <DataTable
            withTableBorder
            borderRadius='sm'
            shadow='sm'
            striped
            highlightOnHover
            verticalAlign='center'
            records={allEvents}
            columns={[
                {
                    accessor: 'id',
                    title: '#'
                },
                {
                    accessor: 'start_date',
                    title: 'Started @'
                },
                {
                    accessor: 'entries',
                    title: 'Entries',
                    render: ({ id, entries }) => <Link to={`${id}/entries`}>{entries.length || 0}</Link>
                },
                {
                    accessor: 'actions',
                    title: 'Actions',
                    render: ({ id }) => (
                        <Group
                            gap={4}
                            justify='center'
                            wrap='nowrap'
                        >
                            <ActionIcon
                                size='sm'
                                variant='subtle'
                                color='blue'
                                onClick={() => handleEdit(id)}
                            >
                                <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                                size='sm'
                                variant='subtle'
                                color='red'
                                onClick={() => handleDelete(id)}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>
                    )
                }
            ]}
        />
    )
}
