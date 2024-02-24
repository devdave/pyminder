import { MainTimer } from '@src/components/MainTimer/MainTimer'
import { ColorSchemeToggle } from '@src/components/ColorSchemeToggle/ColorSchemeToggle'
import { SmartSelect } from '@src/components/SmartSelect/SmartSelect'
import { Center, Stack, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useState } from 'react'
import { Client, Identifier, Project, Task, TimeObj } from '@src/types'
import { useLogger } from '@mantine/hooks'

export function HomePage() {
    const { api, switchboard, clientBroker, projectBroker, taskBroker } = useAppContext()

    const [currentTime, setCurrentTime] = useState<TimeObj>({ hour: 0, minute: 0, second: 0 })

    const [selectedClientID, setSelectedClientID] = useState<Identifier | null>(null)
    const [selectedProjectId, setSelectedProjectId] = useState<Identifier | null>(null)
    const [selectedTaskId, setSelectedTaskID] = useState<Identifier | null>(null)

    const { data: clients, isLoading: clientsAreLoading } = clientBroker.getAll()

    const { data: selectedClient, isLoading: clientIsLoading } = clientBroker.fetch(
        selectedClientID as Identifier,
        selectedClientID !== null
    )

    const { data: selectedProject, isLoading: selectedProjectIsLoading } = projectBroker.fetch(
        selectedClientID as Identifier,
        selectedProjectId as Identifier,
        selectedProjectId !== null && selectedProjectId !== undefined
    )

    const { data: allProjects, isLoading: projectsAreLoading } = projectBroker.useGetAllByClient(
        selectedClient?.id as Identifier,
        selectedClient !== undefined && selectedClient !== null
    )

    const { data: allTasks, isLoading: tasksAreLoading } = taskBroker.getAllByProject(
        selectedProjectId as Identifier,
        selectedProjectId !== undefined && selectedProjectId !== null
    )

    const { data: selectedTask, isLoading: taskIsLoading } = taskBroker.fetch(
        selectedProjectId as Identifier,
        selectedTaskId as Identifier,
        selectedTaskId !== undefined && selectedTaskId !== null
    )

    useLogger('Home', ['I am in hell'])

    const timeChanged = (newTime: [number, number, number]) => {
        console.log('tick', newTime)
        setCurrentTime(() => ({
            hour: newTime[0],
            minute: newTime[1],
            second: newTime[2]
        }))
    }

    const timeStop = () => {
        api.timer_stop().then(() => {
            projectBroker
                .invalidateProject(selectedClientID as Identifier, selectedProjectId as Identifier)
                .then()
            taskBroker.invalidateTask(selectedProjectId as Identifier, selectedTaskId as Identifier).then()
        })
    }

    const startTime = async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const id = switchboard.generate(timeChanged)
        await api.timer_start(id, selectedTaskId as Identifier)
    }

    const clientData = clients?.map((element: Client) => ({ id: element.id, value: element.name }))

    if (
        clientsAreLoading ||
        clientIsLoading ||
        projectsAreLoading ||
        selectedProjectIsLoading ||
        tasksAreLoading ||
        taskIsLoading
    ) {
        return 'Loading data'
    }

    const projectsData = allProjects?.map((project: Project) => ({ id: project.id, value: project.name }))

    const taskData = allTasks?.map((element: Task) => ({ id: element.id, value: element.name }))

    const addClient = (clientName: string) => {
        clientBroker.create(clientName).then((record) => {
            setSelectedClientID(record.id)
        })
    }

    const setClient = (clientId: Identifier) => {
        console.log('client set', clientId)

        if (clientId !== null && clientId !== undefined) {
            setSelectedClientID(clientId)
        }
    }

    const clearClient = () => {
        setSelectedClientID(null)
        setSelectedProjectId(null)
        setSelectedTaskID(null)
    }

    const addProject = (projectName: string) => {
        if (selectedClientID !== null && selectedClientID !== undefined) {
            projectBroker.create(selectedClientID, projectName).then((record) => {
                setSelectedProjectId(record.id)
            })
        }
    }

    const setProject = (projectId: Identifier) => {
        console.log('project set', projectId)

        if (projectId !== null && projectId !== undefined) {
            setSelectedProjectId(projectId)
        }
    }

    const clearProject = () => {
        setSelectedProjectId(null)
        setSelectedTaskID(null)
    }

    const addTask = (taskName: string) => {
        if (selectedProjectId) {
            taskBroker.create(selectedProjectId, taskName).then((record) => {
                setSelectedTaskID(record.id)
            })
        }
    }

    const setTask = (taskId: Identifier) => {
        console.log('Task set', taskId)
        if (taskId !== null && taskId !== undefined) {
            setSelectedTaskID(taskId)
        }
    }

    const clearTask = () => {
        setSelectedTaskID(null)
    }

    return (
        <>
            <ColorSchemeToggle />
            <Center>
                <MainTimer
                    enabled={!!selectedTaskId}
                    time={currentTime}
                    startCB={startTime}
                    stopCB={() => timeStop()}
                    pauseCB={() => api.timer_pause().then()}
                    resumeCB={() => api.timer_resume().then()}
                />
            </Center>
            <Center>
                <Stack>
                    <div>
                        <Text>Client</Text>
                        <SmartSelect
                            selected={{ value: selectedClient?.name, id: selectedClient?.id }}
                            allData={clientData}
                            addData={addClient}
                            setData={setClient}
                            clearData={clearClient}
                            placeholder='Select Client'
                        />
                    </div>
                    {projectsData && (
                        <>
                            <div>
                                <Text>Project</Text>
                                <SmartSelect
                                    selected={{ value: selectedProject?.name, id: selectedProject?.id }}
                                    allData={projectsData}
                                    addData={addProject}
                                    setData={setProject}
                                    clearData={clearProject}
                                    placeholder='Select Client'
                                />
                                {selectedProject && (
                                    <span>
                                        {selectedProject.hours}:{selectedProject.minutes}:
                                        {selectedProject.seconds}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                    {projectsData && taskData && (
                        <div>
                            <Text>Task</Text>
                            <SmartSelect
                                selected={{ value: selectedTask?.name, id: selectedTask?.id }}
                                allData={taskData}
                                addData={addTask}
                                setData={setTask}
                                clearData={clearTask}
                                placeholder='Select or create a new task'
                            />
                            {selectedTask && (
                                <span>
                                    {selectedTask.hours.toString().padStart(2, '0')}:
                                    {selectedTask.minutes.toString().padStart(2, '0')}:
                                    {Math.floor(selectedTask.seconds).toString().padStart(2, '0')}
                                </span>
                            )}
                        </div>
                    )}
                </Stack>
            </Center>
        </>
    )
}
