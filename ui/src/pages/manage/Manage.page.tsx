import { Link, Outlet } from 'react-router-dom'

import { useAppContext } from '@src/App.context'

import { Text, LoadingOverlay, Box, Group, ActionIcon } from '@mantine/core'

import { DataTable } from 'mantine-datatable'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useCallback } from 'react'
import { Identifier } from '@src/types'

export const ManagePage = () => {
    const { clientBroker } = useAppContext()

    const { data: allClients, isLoading: allClientsAreLoading } = clientBroker.getAll()

    const handleDelete = useCallback((recordId: Identifier) => {
        alert(`Would delete${recordId}`)
    }, [])

    const handleEdit = useCallback((recordId: Identifier) => {
        alert(`Would edit${recordId}`)
    }, [])

    if (allClientsAreLoading) {
        return <LoadingOverlay visible />
    }

    if (!allClients) {
        return <Text>Problem loading clients</Text>
    }

    return (
        <>
            <Text>Clients</Text>
            <DataTable
                borderRadius='sm'
                withColumnBorders
                withTableBorder
                striped
                highlightOnHover
                records={allClients}
                columns={[
                    {
                        accessor: 'id',
                        title: '#',
                        textAlign: 'right'
                    },
                    {
                        accessor: 'name'
                    },
                    {
                        accessor: 'is_active',
                        title: 'Enabled',
                        render: ({ is_active }) => (
                            <Box
                                fw={700}
                                c={is_active ? 'green' : 'red'}
                            >
                                {is_active ? 'True' : 'False'}
                            </Box>
                        )
                    },
                    {
                        title: 'View projects',
                        accessor: 'count',
                        render: ({ id, projects_count }) => (
                            <Link to={`client/${id}/projects`}>View {projects_count || 0}</Link>
                        )
                    },
                    {
                        title: 'Actions',
                        accessor: 'id',
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
            <Outlet />
        </>
    )
}
