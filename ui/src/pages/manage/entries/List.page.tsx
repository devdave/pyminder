import { ActionIcon, Group } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { ConfirmModal } from '@src/components/Modals/ConfirmModal'

import { useEffect, useState } from 'react'
import { Entry, Identifier } from '@src/types'
import { useNavigate, useParams } from 'react-router-dom'
import { DataTable } from 'mantine-datatable'

import { IconEdit, IconTrash } from '@tabler/icons-react'

export const ListPage = () => {
    const { api } = useAppContext()
    const { event_id } = useParams()
    const [entries, setEntries] = useState<Entry[]>([])

    const navigate = useNavigate()

    const handleEdit = async (entry: Entry) => {
        navigate(`update/${entry.id}`)
    }

    const handleDelete = async (entryId: Identifier) => {
        const response = await ConfirmModal('Delete', 'Are you sure you want to delete this entry?')
        if (response) {
            api.entry_destroy(entryId).then(() => {
                alert('Entry deleted')
                api.entries_lists_by_event_id(event_id as Identifier).then((manifest) => {
                    setEntries(manifest)
                })
            })
        }
    }

    useEffect(() => {
        api.entries_lists_by_event_id(event_id as Identifier).then((response) => {
            setEntries(response)
        })
    }, [api, event_id])

    const seconds2time = (seconds: number) => new Date(seconds * 1000).toISOString().slice(11, 19)

    return (
        <DataTable
            borderRadius='sm'
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
                    accessor: 'seconds',
                    render: ({ seconds }) => <div title={seconds.toString()}>{seconds2time(seconds)}</div>
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
    )
}
