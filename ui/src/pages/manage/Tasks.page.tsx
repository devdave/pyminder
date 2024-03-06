import { Breadcrumbs, Button, Checkbox, LoadingOverlay, Table, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useParams, Link, Outlet } from 'react-router-dom'
import { Identifier, Task } from '@src/types'

export const TasksPage = () => {
    const { api, clientBroker, taskBroker, projectBroker } = useAppContext()

    const { client_id, project_id } = useParams()

    const { data: myProject } = projectBroker.fetch(client_id as Identifier, project_id as Identifier, true)
    const { data: clientRecord, isLoading: clientRecordLoading } = clientBroker.fetch(
        client_id as Identifier,
        true
    )

    const { data: allTasks, isLoading: allTasksAreLoading } = taskBroker.getAllByProject(
        project_id as Identifier,
        true
    )

    if (allTasksAreLoading || clientRecordLoading) {
        return <LoadingOverlay visible />
    }
    if (!allTasks || !clientRecord) {
        return <Text>Failed loading data</Text>
    }

    const items = [
        { title: 'Clients', href: '/manage' },
        { title: `${clientRecord.name}'s projects`, href: `/manage/client/${client_id}/projects` }
    ].map((item, index) => (
        <Link
            key={index}
            to={item.href}
        >
            {item.title}
        </Link>
    ))

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
            taskBroker.invalidateTasks(project_id as Identifier)
        })
    }

    return (
        <>
            <Title>Tasks for {myProject?.name}</Title>
            <Breadcrumbs>{items}</Breadcrumbs>
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
                                    onChange={(event) =>
                                        handleToggleStatus(task.id, event.currentTarget.checked)
                                    }
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
            <Outlet />
        </>
    )
}
