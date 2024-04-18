import { LoadingOverlay, Text, Title, Breadcrumbs } from '@mantine/core'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Identifier } from '@src/types'
import { useAppContext } from '@src/App.context'

export const ProjectsPage = () => {
    const { clientBroker } = useAppContext()

    const { client_id } = useParams()

    const { data: clientRecord, isLoading: clientRecordLoading } = clientBroker.fetch(
        client_id as Identifier,
        true
    )

    if (clientRecordLoading) {
        return <LoadingOverlay visible />
    }

    if (!clientRecord) {
        return <Text>Error loading projects</Text>
    }

    const items = [{ title: 'Clients', href: '/manage' }].map((item, index) => (
        <Link
            key={index}
            to={item.href}
        >
            {item.title}
        </Link>
    ))

    return (
        <>
            <Title>Projects for {clientRecord.name}</Title>
            <Breadcrumbs>{items}</Breadcrumbs>
            <Outlet />
        </>
    )
}
