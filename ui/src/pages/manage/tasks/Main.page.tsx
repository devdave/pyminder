import { Breadcrumbs, LoadingOverlay, Text, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useParams, Link, Outlet } from 'react-router-dom'
import { Identifier } from '@src/types'

export const TasksMainPage = () => {
    const { clientBroker, projectBroker } = useAppContext()

    const { client_id, project_id } = useParams()

    const { data: myProject } = projectBroker.fetch(client_id as Identifier, project_id as Identifier, true)
    const { data: clientRecord, isLoading: clientRecordLoading } = clientBroker.fetch(
        client_id as Identifier,
        true
    )

    if (clientRecordLoading) {
        return <LoadingOverlay visible />
    }
    if (!clientRecord) {
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

    return (
        <>
            <Title>Tasks for {myProject?.name}</Title>
            <Breadcrumbs>{items}</Breadcrumbs>
            <Outlet />
        </>
    )
}
