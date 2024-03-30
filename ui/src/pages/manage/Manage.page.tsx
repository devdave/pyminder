import { Link, Outlet } from 'react-router-dom'

import { useAppContext } from '@src/App.context'

import { Button, Text, LoadingOverlay, Box } from '@mantine/core'

import { DataTable } from 'mantine-datatable'

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
                            <>
                                <Button>Edit {id}</Button>
                                <Button>Delete {id}</Button>
                            </>
                        )
                    }
                ]}
            />
            <Outlet />
        </>
    )
}
