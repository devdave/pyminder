import { Button, ComboboxItem, Group, NumberInput, Select } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useAppContext } from '@src/App.context'
import { useEffect, useMemo, useState } from 'react'
import { Identifier } from '@src/types'
import { Downloader } from '@src/library/downloader'

export const ReportsPage = () => {
    const { api, clientBroker, projectBroker, taskBroker } = useAppContext()

    const [wage, setWage] = useState<number | null>(null)

    const currentDate = useMemo(
        () => ({
            date: new Date(),
            firstDay: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lastDay: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        }),
        []
    )

    const [filterDate, setFilterDate] = useState<[Date | null, Date | null]>([
        currentDate.firstDay,
        currentDate.lastDay
    ])

    const [selectedClientOption, setSelectedClientOption] = useState<ComboboxItem | null>(null)
    const { data: allClients, isLoading: allClientsAreLoading } = clientBroker.getAll()

    const [selectedProjectOption, setSelectedProjectOption] = useState<ComboboxItem | null>(null)
    const { data: allProjects, isLoading: allProjectsAreLoading } = projectBroker.useGetAllByClient(
        selectedClientOption?.value as Identifier,
        selectedClientOption?.value !== null && selectedClientOption?.value !== undefined
    )

    const [selectedTaskOption, setSelectedTaskOption] = useState<ComboboxItem | null>(null)
    const { data: allTasks, isLoading: allTasksAreLoading } = taskBroker.getAllByProject(
        selectedProjectOption?.value || -1,
        selectedProjectOption?.value !== null && selectedProjectOption?.value !== undefined
    )

    const [reportData, setReportData] = useState<string>('No report')

    useEffect(() => {
        console.log(
            'Build report on',
            filterDate,
            selectedClientOption?.value,
            selectedProjectOption?.value,
            selectedTaskOption?.value,
            wage
        )
        const start_date =
            filterDate[0] !== null
                ? `${filterDate[0].getFullYear()}-${filterDate[0].getMonth() + 1}-${filterDate[0].getDate()}`
                : undefined
        const end_date =
            filterDate[1] !== null
                ? `${filterDate[1].getFullYear()}-${filterDate[1].getMonth() + 1}-${filterDate[1].getDate()}`
                : undefined
        api.report_build2text({
            start_date,
            end_date,
            client_id: selectedClientOption ? parseInt(selectedClientOption.value, 10) : undefined,
            project_id: selectedProjectOption ? parseInt(selectedProjectOption.value, 10) : undefined,
            task_id: selectedTaskOption ? parseInt(selectedTaskOption.value, 10) : undefined,
            wage: wage as number,
            sort_order: []
        }).then((report) => {
            setReportData(report)
        })
    }, [api, filterDate, selectedClientOption, selectedProjectOption, selectedTaskOption, wage])

    useEffect(() => {
        if (selectedClientOption === null) {
            setSelectedProjectOption(null)
            setSelectedTaskOption(null)
        } else if (selectedProjectOption === null) {
            setSelectedTaskOption(null)
        }
    }, [selectedClientOption, selectedProjectOption])

    if (allClientsAreLoading || allProjectsAreLoading || allTasksAreLoading) {
        return <h1>Loading data</h1>
    }

    if (allClients === undefined) {
        return <h1>Problem loading client data</h1>
    }

    const clientOptions = allClients?.map((client) => ({
        value: client.id.toString() as string,
        label: client.name
    }))

    const projectOptions = allProjects?.map((project) => ({
        value: project.id.toString(),
        label: project.name
    }))

    const taskOptions = allTasks?.map((task) => ({
        value: task.id.toString(),
        label: task.name
    }))

    const handleClientSelect = (client_value: string | null, client_option: ComboboxItem) => {
        console.log('Selected client', client_value, client_option)
        if (client_value) {
            // setSelectedClientID(client_value)
        }
        setSelectedClientOption(client_option)
    }

    const handleProjectSelect = (project_value: string | null, project_option: ComboboxItem) => {
        console.log('Selected project', project_value, project_option)
        if (project_value) {
            // setSelectedProjectID(project_value)
        }
        setSelectedProjectOption(project_option)
    }

    const handleTaskSelect = (task_value: string | null, task_option: ComboboxItem) => {
        console.log('Selected task', task_value, task_option)
        if (task_value) {
            // setSelectedTaskID(task_value)
        }
        setSelectedTaskOption(task_option)
    }

    return (
        <>
            <Group>
                <Group>
                    <NumberInput
                        label='Wage'
                        value={wage as number}
                        onChange={(v) => setWage(v as number)}
                    />
                </Group>
                <DatePickerInput
                    clearable
                    valueFormat='YYYY-MM-DD'
                    type='range'
                    label='Filter date'
                    placeholder='Optional filter'
                    value={filterDate}
                    onChange={setFilterDate}
                />
            </Group>
            <Group>
                <Select
                    clearable
                    label='Clients'
                    data={clientOptions}
                    value={selectedClientOption ? selectedClientOption.value : null}
                    onChange={handleClientSelect}
                />
                <Select
                    clearable
                    label='Projects'
                    data={projectOptions}
                    value={selectedProjectOption ? selectedProjectOption.value : null}
                    onChange={handleProjectSelect}
                />
                <Select
                    clearable
                    label='Tasks'
                    data={taskOptions}
                    value={selectedTaskOption ? selectedTaskOption.value : null}
                    onChange={handleTaskSelect}
                />
                <Button onClick={() => Downloader(reportData.toString(), 'report.txt')}>Download</Button>
            </Group>

            <pre style={{ whiteSpace: 'pre-wrap' }}>{reportData.toString()}</pre>
        </>
    )
}
