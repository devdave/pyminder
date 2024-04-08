import { Button, Checkbox, LoadingOverlay, Table, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useParams, Link } from 'react-router-dom'
import { Identifier, Task } from '@src/types'

export const TasksListPage = () => {
    const { api, taskBroker } = useAppContext()

    const { project_id } = useParams()

    const { data: allTasks, isLoading: allTasksAreLoading } = taskBroker.getAllByProject(
        project_id as Identifier,
        true
    )

    if (allTasksAreLoading) {
        return <LoadingOverlay visible />
    }
    if (!allTasks) {
        return <Text>Failed loading data</Text>
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

    return (
        <>
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
