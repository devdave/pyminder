import { Identifier } from '@src/types'
import { Link, Outlet, useParams } from 'react-router-dom'
import { useAppContext } from '@src/App.context'
import { Breadcrumbs, LoadingOverlay } from '@mantine/core'

export const MainPage = () => {
    const { clientBroker, projectBroker, taskBroker } = useAppContext()
    const { client_id, project_id, task_id } = useParams()

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

    // const { data: eventRecord, isLoading: eventRecordLoading } = eventBroker.fetch(event_id as Identifier)

    const items = [
        { title: 'Clients', href: '/manage' },
        { title: `${clientRecord?.name}'s projects`, href: `/manage/client/${client_id}/projects` },
        {
            title: `${myProject?.name}'s tasks`,
            href: `/manage/client/${client_id}/projects/${project_id}/tasks`
        },
        {
            title: `${taskData?.name}'s events`,
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

    if (taskIsLoading || projectLoading || clientRecordLoading) {
        return <LoadingOverlay visible />
    }

    return (
        <>
            <Breadcrumbs
                separator='→'
                separatorMargin='xs'
            >
                {items}
            </Breadcrumbs>
            <Link to='./create'>Create new entry</Link>
            <Outlet />
        </>
    )
}
