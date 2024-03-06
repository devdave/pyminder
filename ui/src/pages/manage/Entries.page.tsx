import { Breadcrumbs, LoadingOverlay, Table, Title } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useEffect, useState } from 'react'
import { Entry, Identifier } from '@src/types'
import { Link, useParams } from 'react-router-dom'

export const EntriesPage = () => {
    const { api, clientBroker, projectBroker, taskBroker, eventBroker } = useAppContext()
    const { client_id, project_id, task_id, event_id } = useParams()
    const [entries, setEntries] = useState<Entry[]>([])

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

    const { data: eventRecord, isLoading: eventRecordLoading } = eventBroker.fetch(event_id as Identifier)

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

    useEffect(() => {
        api.entries_lists_by_event_id(event_id as Identifier).then((response) => {
            setEntries(response)
        })
    }, [api, event_id])

    if (taskIsLoading || projectLoading || clientRecordLoading || eventRecordLoading) {
        return <LoadingOverlay visible />
    }

    return (
        <>
            <Title>{eventRecord?.start_date}'s entries</Title>
            <Breadcrumbs
                separator='→'
                separatorMargin='xs'
            >
                {items}
            </Breadcrumbs>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Started on</Table.Th>
                        <Table.Th>Stopped on</Table.Th>
                        <Table.Th>Reason</Table.Th>
                        <Table.Th>Seconds</Table.Th>
                        <Table.Th>Edit</Table.Th>
                        <Table.Th>Delete</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {entries.map((entry: Entry) => (
                        <Table.Tr key={entry.id}>
                            <Table.Td>{entry.started_on}</Table.Td>
                            <Table.Td>{entry.stopped_on}</Table.Td>
                            <Table.Td>{entry.stop_reason}</Table.Td>
                            <Table.Td>{entry.seconds}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </>
    )
}
