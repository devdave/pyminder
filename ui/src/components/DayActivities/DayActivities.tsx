import { useAppContext } from '@src/App.context'
import { useState } from 'react'
import { Group, Stack, Text } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { DataTable } from 'mantine-datatable'

import { Link } from 'react-router-dom'
import _ from 'lodash'

export const DayActivities = () => {
    const { reportBroker } = useAppContext()

    const [searchDate, setSearchDate] = useState<Date | null>(new Date())

    const { data, isLoading } = reportBroker.getDailyReport(searchDate as Date)

    const formatDate = (target: string) => {
        const date = new Date(target)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }

    const formatTime = (target: string) => {
        const date = new Date(target)
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    }

    const seconds2time = (seconds: number) => new Date(seconds * 1000).toISOString().slice(11, 19)

    if (isLoading) {
        return <>Loading data...</>
    }

    if (!data) {
        return <>Failed to load or no data...</>
    }

    const totalTime = _.sumBy(data, (o) => o.seconds)

    return (
        <Stack>
            <Group>
                <DatePickerInput
                    valueFormat='YYYY-MM-DD'
                    label='Search date'
                    placeholder='Optional filter'
                    value={searchDate}
                    onChange={setSearchDate}
                />
            </Group>

            <DataTable
                records={data}
                columns={[
                    {
                        accessor: 'started_on',
                        render: ({ started_on }) => formatTime(started_on)
                    },
                    {
                        accessor: 'stopped_on',
                        render: ({ stopped_on }) => formatTime(stopped_on)
                    },
                    {
                        accessor: 'seconds',
                        title: 'Duration',
                        render: ({ seconds }) => seconds2time(seconds)
                    },
                    {
                        accessor: 'client_name',
                        render: ({ client_name, client_id }) => (
                            <Link to={`client/${client_id}/projects`}>{client_name}</Link>
                        )
                    },
                    {
                        accessor: 'project_name',
                        render: ({ client_id, project_name, project_id }) => (
                            <Link to={`client/${client_id}/projects/${project_id}/tasks`}>
                                {project_name}
                            </Link>
                        )
                    },
                    {
                        accessor: 'task_name',
                        render: ({ client_id, task_name, task_id, project_id }) => (
                            <Link to={`client/${client_id}/projects/${project_id}/tasks/${task_id}/events`}>
                                {task_name}
                            </Link>
                        )
                    },
                    {
                        accessor: 'event_id',
                        title: 'Entries',
                        render: ({ client_id, task_id, project_id, event_id }) => (
                            <Link
                                to={`client/${client_id}/projects/${project_id}/tasks/${task_id}/events/${event_id}/entries`}
                            >
                                Entries
                            </Link>
                        )
                    }
                ]}
            />
            <Group>
                <Text>Total time: {seconds2time(totalTime)}</Text>
            </Group>
        </Stack>
    )
}
