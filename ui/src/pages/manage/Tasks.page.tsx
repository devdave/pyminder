import { Breadcrumbs, LoadingOverlay, Table, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useParams, Link, Outlet } from 'react-router-dom'
import { Identifier, Task } from '@src/types'

export const TasksPage = () => {
    const { taskBroker, projectBroker } = useAppContext()

    const { client_id, project_id } = useParams()

    const { data: myProject } = projectBroker.fetch(client_id as Identifier, project_id as Identifier, true)

    const { data: allTasks, isLoading: allTasksAreLoading } = taskBroker.getAllByProject(
        project_id as Identifier,
        true
    )

    if (allTasksAreLoading) {
        return <LoadingOverlay visible />
    }
    if (!allTasks) {
        return <Text>Failed loading projects</Text>
    }

    const items = [
        { title: 'Clients', href: '/manage' },
        { title: 'Projects', href: `/manage/client/${client_id}/projects` }
    ].map((item, index) => (
        <Link
            key={index}
            to={item.href}
        >
            {item.title}
        </Link>
    ))

    return (
        <>
            <Title>Tasks</Title>
            <Breadcrumbs>{items}</Breadcrumbs>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Enabled</Table.Th>
                        <Table.Th>View Events</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {allTasks.map((task: Task) => (
                        <Table.Tr key={task.id}>
                            <Table.Td>{task.name}</Table.Td>
                            <Table.Td>{task.is_active ? 'True' : 'False'}</Table.Td>
                            <Table.Td>
                                <Link to={`${task.id}/events`}>Events {task.events_count || 0}</Link>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            <Outlet />
        </>
    )
}
