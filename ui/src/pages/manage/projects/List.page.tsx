import { ActionIcon, Box, Checkbox, Group, LoadingOverlay, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useParams, Link } from 'react-router-dom'
import { Identifier } from '@src/types'

import { DataTable } from 'mantine-datatable'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import React, { useCallback } from 'react'

export const ListPage = () => {
    const { api, projectBroker } = useAppContext()

    const { client_id } = useParams()
    const { data: allProjects, isLoading: allProjectsAreLoading } = projectBroker.useGetAllByClient(
        client_id as Identifier,
        true
    )

    const handleEdit = useCallback(
        (project_id: Identifier, name: string) => {
            alert('@TODO finish edit option')
        },
        [projectBroker, client_id]
    )

    const handleProjectDelete = useCallback(
        (id: Identifier, name: string) => {
            if (window.confirm(`Are you sure you want to delete ${name} project?`)) {
                projectBroker.destroy(id).then(() => {
                    projectBroker.invalidateProjects(client_id as Identifier).then()
                })
            }
        },
        [projectBroker, client_id]
    )

    const handleProjectStatusChange = useCallback(
        (id: Identifier, status: boolean) => {
            api.project_set_status(id, status).then(() => {
                projectBroker.invalidateProjects(client_id as Identifier).then()
                projectBroker.invalidateProject(client_id as Identifier, id).then(() => {})
            })
        },
        [api, client_id, projectBroker]
    )

    if (allProjectsAreLoading) {
        return <LoadingOverlay visible />
    }

    if (!allProjects) {
        return <Text>Error loading projects</Text>
    }

    return (
        <DataTable
            shadow='xl'
            striped
            highlightOnHover
            records={allProjects}
            columns={[
                {
                    accessor: 'id',
                    title: '#'
                },
                {
                    accessor: 'name',
                    title: 'Name'
                },
                {
                    accessor: 'tasks',
                    title: 'Tasks',
                    render: ({ id, tasks_count }) => <Link to={`${id}/tasks`}>Tasks {tasks_count}</Link>
                },
                {
                    accessor: 'is_active',
                    title: 'Enabled',
                    render: ({ is_active, id }) => (
                        <Checkbox
                            checked={!!is_active}
                            onChange={(event) => {
                                handleProjectStatusChange(id, !is_active)
                                event.stopPropagation()
                            }}
                        />
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
                    accessor: 'actions',
                    title: <Box mr={6}>Row actions</Box>,
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
                                onClick={() => handleEdit(id, name)}
                            >
                                <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                                size='sm'
                                variant='subtle'
                                color='red'
                                onClick={() => handleProjectDelete(id, name)}
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
