import { Breadcrumbs, Button, LoadingOverlay, Table, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Event, Identifier } from '@src/types'

export const MainPage = () => {
    const { projectBroker, clientBroker, eventBroker, taskBroker } = useAppContext()
    const { client_id, task_id, project_id } = useParams()

    const { data: taskData, isLoading: taskIsLoading } = taskBroker.fetch(
        project_id as Identifier,
        task_id as Identifier,
        true
    )
    const { data: myProject, isLoading: projectLoading } = projectBroker.fetch(
        client_id as Identifier,
        project_id as Identifier,
        true
    )
    const { data: clientRecord, isLoading: clientRecordLoading } = clientBroker.fetch(
        client_id as Identifier,
        true
    )

    if (taskIsLoading || projectLoading || clientRecordLoading) {
        return <LoadingOverlay visible />
    }

    if (!myProject || !clientRecord) {
        return <Text>No events available or failed to load!</Text>
    }
    if (!taskData) {
        return <Text>No task data available!</Text>
    }

    const items = [
        { title: 'Clients', href: '/manage' },
        { title: `${clientRecord.name}'s projects`, href: `/manage/client/${client_id}/projects` },
        {
            title: `${myProject.name}'s tasks`,
            href: `/manage/client/${client_id}/projects/${project_id}/tasks`
        },
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
            <Link to='create'>Create new Event</Link>
            <Outlet />
        </>
    )
}
