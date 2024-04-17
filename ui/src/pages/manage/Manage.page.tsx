import { Link, Outlet } from 'react-router-dom'

import { useAppContext } from '@src/App.context'

import { Text, LoadingOverlay, Box, Group, ActionIcon, Title, Checkbox } from '@mantine/core'

import { DataTable } from 'mantine-datatable'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import React, { useCallback } from 'react'
import { Identifier } from '@src/types'

export const ManagePage = () => {
    const { api, clientBroker } = useAppContext()

    const { data: allClients, isLoading: allClientsAreLoading } = clientBroker.getAll()

    const handleDelete = useCallback((recordId: Identifier) => {
        alert(`Would delete${recordId}`)
    }, [])

    const handleEdit = useCallback((recordId: Identifier) => {
        alert(`Would edit${recordId}`)
    }, [])

    const handleStatusUpdate = useCallback(
        (recordId: Identifier, status: boolean) => {
            api.client_set_status(recordId, status).then(() => {})
        },
        [api]
    )

    if (allClientsAreLoading) {
        return <LoadingOverlay visible />
    }

    if (!allClients) {
        return <Text>Problem loading clients</Text>
    }

    return (
        <>
            <Title>Clients</Title>
            <DataTable
                withTableBorder
                borderRadius='xl'
                shadow='xl'
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
                        render: ({ id, is_active }) => (
                            <Checkbox
                                checked={!!is_active}
                                onChange={(event) => {
                                    handleStatusUpdate(id, !is_active)
                                    event.preventDefault()
                                    event.stopPropagation()
                                }}
                            />
                        )
                    },
                    {
                        title: 'Projects',
                        accessor: 'count',
                        render: ({ id, projects_count }) => (
                            <Link to={`client/${id}/projects`}>View {projects_count || 0}</Link>
                        )
                    },
                    {
                        accessor: 'created_on',
                        title: 'Created on(UTC)'
                    },
                    {
                        accessor: 'updated_on',
                        title: 'Updated on(UTC)'
                    },
                    {
                        title: <Box mr={6}>Row actions</Box>,
                        accessor: 'actions',
                        textAlign: 'center',
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
