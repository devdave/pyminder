import { Button, ComboboxItem, Group, LoadingOverlay, Select, Stack } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useState } from 'react'
import { Identifier } from '@src/types'

export const ManagePage = () => {
    const { clientBroker, projectBroker, taskBroker } = useAppContext()

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

    if (allClientsAreLoading || allProjectsAreLoading || allTasksAreLoading) {
        return <LoadingOverlay visible />
    }

    function optionMaker(records: { id: Identifier; name: string }[] | undefined) {
        return records
            ? records.map((record: { id: Identifier; name: string }) => ({
                  value: record.id.toString() as string,
                  label: record.name
              }))
            : []
    }

    const clientOptions = optionMaker(allClients)
    const projectOptions = optionMaker(allProjects)
    const taskOptions = optionMaker(allTasks)

    const onDeleteClient = () => {
        if (selectedClientOption) {
            if (window.confirm(`Are you sure you want to delete ${selectedClientOption.label} client?`)) {
                clientBroker.destroy(selectedClientOption.value).then(() => {
                    setSelectedClientOption(null)
                    setSelectedProjectOption(null)
                    setSelectedTaskOption(null)
                })
            }
        }
    }

    const onDeleteProject = () => {
        if (selectedProjectOption) {
            if (window.confirm(`Are you sure you want to delete ${selectedProjectOption.label} project?`)) {
                projectBroker.destroy(selectedProjectOption.value).then(() => {
                    setSelectedProjectOption(null)
                    setSelectedTaskOption(null)
                })
            }
        }
    }

    const onDeleteTask = () => {
        if (selectedTaskOption) {
            if (window.confirm(`Are you sure you want to delete ${selectedTaskOption.label} task?`)) {
                taskBroker.destroy(selectedTaskOption.value).then(() => {
                    setSelectedTaskOption(null)
                })
            }
        }
    }

    return (
        <>
            <h1>Manager</h1>
            <Group>
                <Group>
                    <Select
                        clearable
                        label='Clients'
                        data={clientOptions}
                        value={selectedClientOption ? selectedClientOption.value : null}
                        onChange={(value, option) => setSelectedClientOption(option)}
                    />
                    <Button
                        onClick={onDeleteClient}
                        disabled={selectedClientOption === null}
                    >
                        Delete Client?
                    </Button>
                </Group>
                <Group>
                    <Select
                        clearable
                        label='Projects'
                        data={projectOptions}
                        value={selectedProjectOption ? selectedProjectOption.value : null}
                        onChange={(value, option) => setSelectedProjectOption(option)}
                    />
                    <Button
                        onClick={onDeleteProject}
                        disabled={selectedProjectOption === null}
                    >
                        Delete Project?
                    </Button>
                </Group>
                <Group>
                    <Select
                        clearable
                        label='Tasks'
                        data={taskOptions}
                        value={selectedTaskOption ? selectedTaskOption.value : null}
                        onChange={(value, option) => setSelectedTaskOption(option)}
                    />
                    <Button
                        onClick={onDeleteTask}
                        disabled={selectedTaskOption === null}
                    >
                        Delete Task?
                    </Button>
                </Group>
            </Group>
        </>
    )
}
