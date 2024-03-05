import { Route, Routes, Link, Outlet } from 'react-router-dom'

import { useAppContext } from '@src/App.context'
import { useState } from 'react'
import { Button, Text, LoadingOverlay, Table } from '@mantine/core'
import { Client } from '@src/types'
import { ClientsPage } from '@src/pages/manage/Clients.page'
import { ProjectsPage } from '@src/pages/manage/Projects.page'

export const ManagePage = () => {
    const { clientBroker } = useAppContext()

    const { data: allClients, isLoading: allClientsAreLoading } = clientBroker.getAll()

    if (allClientsAreLoading) {
        return <LoadingOverlay visible />
    }

    if (!allClients) {
        return <Text>Problem loading clients</Text>
    }

    return (
        <>
            <Text>Clients</Text>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Enabled</Table.Th>
                        <Table.Th>View Projects</Table.Th>
                        <Table.Th>Edit</Table.Th>
                        <Table.Th>Delete</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {allClients.map((client: Client) => (
                        <Table.Tr key={client.id}>
                            <Table.Td>{client.name}</Table.Td>
                            <Table.Td>{client.is_active ? 'True' : 'False'}</Table.Td>
                            <Table.Td>
                                <Link to={`client/${client.id}/projects`}>
                                    View {client.projects_count || 0}
                                </Link>
                            </Table.Td>
                            <Table.Td>
                                <Button>Edit</Button>
                            </Table.Td>
                            <Table.Td>
                                <Button>Delete</Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            <Outlet />
        </>
    )
}
