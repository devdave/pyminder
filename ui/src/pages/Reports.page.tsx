import { ComboboxItem, Group, Select } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useAppContext } from '@src/App.context'
import { useEffect, useState } from 'react'
import { Identifier } from '@src/types'

export const ReportsPage = () => {
    const { clientBroker, projectBroker, taskBroker } = useAppContext()

    const [filterDate, setFilterDate] = useState<[Date | null, Date | null]>([null, null])

    // const [selectedClientID, setSelectedClientID] = useState<Identifier | null>(null)
    const [selectedClientOption, setSelectedClientOption] = useState<ComboboxItem | null>(null)

    const { data: allClients, isLoading: allClientsAreLoading } = clientBroker.getAll()
    // const { data: selectedClient, isLoading: clientIsLoading } = clientBroker.fetch(
    //     selectedClientID as Identifier,
    //     selectedClientID !== null
    // )

    // const [selectedProjectID, setSelectedProjectID] = useState<Identifier | null>(null)
    const [selectedProjectOption, setSelectedProjectOption] = useState<ComboboxItem | null>(null)
    const { data: allProjects, isLoading: allProjectsAreLoading } = projectBroker.useGetAllByClient(
        selectedClientOption?.value as Identifier,
        selectedClientOption?.value !== null && selectedClientOption?.value !== undefined
    )
    // const { data: selectedProject, isLoading: projectIsLoading } = projectBroker.fetch(
    //     selectedClientOption?.value || -1,
    //     selectedProjectOption?.value || -1,
    //     selectedClientOption !== null && selectedProjectOption !== null
    // )

    // const [selectedTaskID, setSelectedTaskID] = useState<Identifier | null>(null)
    const [selectedTaskOption, setSelectedTaskOption] = useState<ComboboxItem | null>(null)
    const { data: allTasks, isLoading: allTasksAreLoading } = taskBroker.getAllByProject(
        selectedProjectOption?.value || -1,
        selectedProjectOption?.value !== null && selectedProjectOption?.value !== undefined
    )

    useEffect(() => {
        console.log(
            'Build report on',
            filterDate,
            selectedClientOption?.value,
            selectedProjectOption?.value,
            selectedTaskOption?.value
        )
    }, [filterDate, selectedClientOption, selectedProjectOption, selectedTaskOption])

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
            </Group>
        </>
    )
}
