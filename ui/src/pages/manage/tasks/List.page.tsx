import { ActionIcon, Box, Button, Checkbox, Group, LoadingOverlay, Table, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useParams, Link } from 'react-router-dom'
import { Identifier, Task } from '@src/types'
import { DataTable, DataTableSortStatus } from 'mantine-datatable'
import { sortBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { IconEdit, IconTrash } from '@tabler/icons-react'

export const TasksListPage = () => {
    const { api, taskBroker } = useAppContext()

    const { project_id } = useParams()

    const [sortStatus, setSortStatus] = React.useState<DataTableSortStatus<Task>>({
        columnAccessor: 'name',
        direction: 'asc'
    })

    const [showAll, setShowAll] = React.useState(true)

    const [records, setRecords] = useState<Task[]>([])

    const { data: allTasks, isLoading: allTasksAreLoading } = taskBroker.getAllByProject(
        project_id as Identifier,
        true
    )

    useEffect(() => {
        const data = sortBy(allTasks, sortStatus.columnAccessor).filter(({ is_active }) => {
            if (showAll === false) {
                return is_active
            }
            return true
        })
        setRecords(sortStatus.direction === 'desc' ? data.reverse() : data)
        console.log('Resorted ', sortStatus, showAll)
    }, [allTasks, sortStatus, showAll])

    const handleEditTask = (taskId: Identifier, taskName: string) => {
        console.log(taskId)
    }

    const handleDeleteTask = (taskId: Identifier, taskName: string) => {
        if (window.confirm(`Are you sure you want to delete ${taskName} task?`)) {
            taskBroker.destroy(taskId).then(() => {
                taskBroker.invalidateTasks(project_id as Identifier).then()
            })
        }
    }

    const handleToggleStatus = (taskId: Identifier, status: boolean) => {
        console.log(taskId, status)
        api.task_set_status(taskId, status).then(() => {
            taskBroker.invalidateTasks(project_id as Identifier).then()
            taskBroker.invalidateTask(project_id as Identifier, taskId).then(() => {})
        })
    }

    if (allTasksAreLoading) {
        return <LoadingOverlay visible />
    }
    if (!allTasks) {
        return <Text>Failed loading data</Text>
    }

    return (
        <>
            <DataTable
                shadow='xl'
                striped
                highlightOnHover
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                records={records}
                columns={[
                    {
                        accessor: 'id',
                        title: '#'
                    },
                    {
                        accessor: 'name',
                        title: 'Name',
                        sortable: true
                    },
                    {
                        accessor: 'is_active',
                        title: 'Enabled',
                        sortable: true,
                        filter: () => (
                            <Checkbox
                                label='Enabled'
                                description='Show only enabled'
                                checked={!showAll}
                                onChange={() => {
                                    setShowAll((current) => !current)
                                }}
                            />
                        ),
                        render: ({ id, is_active }) => (
                            <Checkbox
                                checked={!!is_active}
                                onChange={(event) => {
                                    handleToggleStatus(id, event.currentTarget.checked)
                                    event.stopPropagation()
                                    event.preventDefault()
                                }}
                            />
                        )
                    },
                    {
                        accessor: 'events',
                        title: 'Events',
                        render: ({ id, events_count }) => <Link to={`${id}/events`}>{events_count || 0}</Link>
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
                                    onClick={() => handleEditTask(id, name)}
                                >
                                    <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                    size='sm'
                                    variant='subtle'
                                    color='red'
                                    onClick={() => handleDeleteTask(id, name)}
                                >
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        )
                    }
                ]}
            />
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Enabled</Table.Th>
                        <Table.Th>View Events</Table.Th>
                        <Table.Th>Edit</Table.Th>
                        <Table.Th>Delete</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {allTasks.map((task: Task) => (
                        <Table.Tr key={task.id}>
                            <Table.Td>{task.name}</Table.Td>
                            <Table.Td>
                                <Checkbox
                                    checked={task.is_active}
                                    onChange={(event) => {
                                        handleToggleStatus(task.id, event.currentTarget.checked)
                                        event.stopPropagation()
                                    }}
                                />
                            </Table.Td>
                            <Table.Td>
                                <Link to={`${task.id}/events`}>Events {task.events_count || 0}</Link>
                            </Table.Td>
                            <Table.Td>
                                <Button>Edit</Button>
                            </Table.Td>
                            <Table.Td>
                                <Button onClick={() => handleDeleteTask(task.id, task.name)}>Delete</Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </>
    )
}
