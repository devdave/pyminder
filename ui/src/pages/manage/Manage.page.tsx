import { Link, Outlet, useNavigate } from 'react-router-dom'

import { useAppContext } from '@src/App.context'

import { Text, LoadingOverlay, Box, Group, ActionIcon, Title, Checkbox } from '@mantine/core'

import { DataTable } from 'mantine-datatable'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import React, { useCallback, useState } from 'react'
import { Identifier } from '@src/types'
import { DayActivities } from '@src/components/DayActivities/DayActivities'

export const ManagePage = () => {
    const { api, clientBroker } = useAppContext()

    const navigate = useNavigate()

    const { data: allClients, isLoading: allClientsAreLoading } = clientBroker.getAll()

    const handleDelete = useCallback((recordId: Identifier, name: string) => {
        alert(`Are you sure you want to delete ${name}(${recordId})`)
    }, [])

    const handleStatusUpdate = useCallback(
        (recordId: Identifier, status: boolean) => {
            api.client_set_status(recordId, status).then(() => {
                clientBroker.invalidateClients().then()
            })
        },
        [api, clientBroker]
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
                striped
                highlightOnHover
                withTableBorder
                borderRadius='xl'
                shadow='xl'
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
                        render: ({ id, name }) => (
                            <Group
                                gap={4}
                                justify='center'
                                wrap='nowrap'
                            >
                                <ActionIcon
                                    size='sm'
                                    variant='subtle'
                                    color='blue'
                                    onClick={() => navigate(`edit/${id}`)}
                                >
                                    <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                    size='sm'
                                    variant='subtle'
                                    color='red'
                                    onClick={() => handleDelete(id, name)}
                                >
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        )
                    }
                ]}
            />
            <Outlet />
            <DayActivities />
        </>
    )
}
