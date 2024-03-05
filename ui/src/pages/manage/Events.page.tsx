import { Breadcrumbs, Button, LoadingOverlay, Table, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Event, Client, Identifier } from '@src/types'

export const EventsPage = () => {
    const { eventBroker, taskBroker } = useAppContext()
    const { client_id, task_id, project_id } = useParams()

    const { data: taskData, isLoading: taskIsLoading } = taskBroker.fetch(
        project_id as Identifier,
        task_id as Identifier,
        true
    )

    const { data: allEvents, isLoading: allEventsAreLoading } = eventBroker.useGetAllByTask(
        task_id as Identifier
    )

    if (allEventsAreLoading || taskIsLoading) {
        return <LoadingOverlay visible />
    }

    if (!allEvents) {
        return <Text>No events available or failed to load!</Text>
    }
    if (!taskData) {
        return <Text>No task data available!</Text>
    }

    const items = [
        { title: 'Clients', href: '/manage' },
        { title: 'Projects', href: `/manage/client/${client_id}/projects` },
        { title: 'Tasks', href: `/manage/client/${client_id}/projects/${project_id}/tasks` },
        {
            title: 'Events',
            href: `/manage/client/${client_id}/projects/${project_id}/tasks/${task_id}/events`
        }
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
            <Title>Events for Task {taskData.name}</Title>
            <Breadcrumbs>{items}</Breadcrumbs>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Start date</Table.Th>
                        <Table.Th>Entries</Table.Th>
                        <Table.Th>Edit?</Table.Th>
                        <Table.Th>Delete?</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {allEvents.map((record: Event) => (
                        <Table.Tr key={record.id}>
                            <Table.Td>{record.start_date}</Table.Td>
                            <Table.Td>
                                <Link to={`${record.id}/entries`}>{record.entries.length || 0}</Link>
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
