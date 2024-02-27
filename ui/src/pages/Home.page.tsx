import { MainTimer } from '@src/components/MainTimer/MainTimer'
import { ColorSchemeToggle } from '@src/components/ColorSchemeToggle/ColorSchemeToggle'
import { Center, Stack, Text } from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { useEffect, useState } from 'react'
import { Client, Identifier, Project, Task, TimeObj, TimeOwner } from '@src/types'
import { SelectCreatable } from '@src/components/SmartSelect/SmartSelectV2'

export function HomePage() {
    const { api, switchboard, clientBroker, projectBroker, taskBroker } = useAppContext()

    const [currentTime, setCurrentTime] = useState<TimeObj>({ hour: 0, minute: 0, second: 0 })
    const [isPaused, setIsPaused] = useState(false)
    const [isRunning, setIsRunning] = useState(false)

    const [selectedClientID, setSelectedClientID] = useState<Identifier | null>(null)
    const [selectedProjectID, setSelectedProjectID] = useState<Identifier | null>(null)
    const [selectedTaskID, setSelectedTaskID] = useState<Identifier | null>(null)

    const { data: clients, isLoading: clientsAreLoading } = clientBroker.getAll()

    const { data: selectedClient, isLoading: clientIsLoading } = clientBroker.fetch(
        selectedClientID as Identifier,
        selectedClientID !== null
    )

    const { data: selectedProject, isLoading: selectedProjectIsLoading } = projectBroker.fetch(
        selectedClientID as Identifier,
        selectedProjectID as Identifier,
        selectedProjectID !== null && selectedProjectID !== undefined
    )

    const { data: allProjects, isLoading: projectsAreLoading } = projectBroker.useGetAllByClient(
        selectedClient?.id as Identifier,
        selectedClient !== undefined && selectedClient !== null
    )

    const { data: allTasks, isLoading: tasksAreLoading } = taskBroker.getAllByProject(
        selectedProjectID as Identifier,
        selectedProjectID !== undefined && selectedProjectID !== null
    )

    const { data: selectedTask, isLoading: taskIsLoading } = taskBroker.fetch(
        selectedProjectID as Identifier,
        selectedTaskID as Identifier,
        selectedTaskID !== undefined && selectedTaskID !== null
    )

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
                .invalidateProject(selectedClientID as Identifier, selectedProjectID as Identifier)
                .then()
            taskBroker.invalidateTask(selectedProjectID as Identifier, selectedTaskID as Identifier).then()
        })
    }

    const startTime = async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const id = switchboard.generate(timeChanged)
        await api.timer_start(id, selectedTaskID as Identifier)
    }

    useEffect(() => {
        api.timer_check().then((status) => {
            if (status) {
                api.timer_owner().then((owner: TimeOwner) => {
                    setSelectedClientID(owner.client.id)
                    setSelectedProjectID(owner.project.id)
                    setSelectedTaskID(owner.task.id)
                    setIsPaused(owner.isPaused)
                    setIsRunning(owner.isRunning)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const new_id = switchboard.generate(timeChanged)
                    api.timer_override(new_id).then()
                })
            }
        })
    }, [])

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

    // const clearClient = () => {
    //     setSelectedClientID(null)
    //     setSelectedProjectId(null)
    //     setSelectedTaskID(null)
    // }

    // const deleteClient = (id: Identifier, value: string) => {
    //     setSelectedClientID(null)
    //     setSelectedProjectId(null)
    //     setSelectedTaskID(null)
    //     // eslint-disable-next-line no-alert
    //     if (window.confirm(`Are you sure you want to delete this client ${value}?`)) {
    //         clientBroker.destroy(id).then(() => {
    //             clientBroker.invalidateClients().then()
    //         })
    //     }
    // }

    const addProject = (projectName: string) => {
        if (selectedClientID !== null && selectedClientID !== undefined) {
            projectBroker.create(selectedClientID, projectName).then((record) => {
                setSelectedProjectID(record.id)
            })
        }
    }

    const setProject = (projectId: Identifier) => {
        console.log('project set', projectId)

        if (projectId !== null && projectId !== undefined) {
            setSelectedProjectID(projectId)
        }
    }

    // const clearProject = () => {
    //     setSelectedProjectID(null)
    //     setSelectedTaskID(null)
    // }

    // const deleteProject = (id: Identifier, value: string) => {
    //     // eslint-disable-next-line no-alert
    //     if (window.confirm(`Are you sure you want to delete this, ${value} project?`)) {
    //         projectBroker.destroy(id).then(() => {
    //             projectBroker.invalidateProjects(selectedClientID as Identifier).then()
    //         })
    //     }
    // }

    const addTask = (taskName: string) => {
        if (selectedProjectID) {
            taskBroker.create(selectedProjectID, taskName).then((record) => {
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

    // const clearTask = () => {
    //     setSelectedTaskID(null)
    // }

    // const deleteSelectedTask = (id: Identifier, value: string) => {
    //     // eslint-disable-next-line no-alert
    //     const choice = window.confirm(`Are you sure you want to delete ${value} task?`)
    //     if (choice) {
    //         taskBroker.destroy(id).then(() => {
    //             if (selectedProjectID) {
    //                 taskBroker.invalidateTasks(selectedProjectID).then()
    //             }
    //         })
    //     }
    // }

    return (
        <>
            <ColorSchemeToggle />
            <Center>
                <MainTimer
                    enabled={!!selectedTaskID}
                    time={currentTime}
                    startCB={startTime}
                    stopCB={() => timeStop()}
                    pauseCB={() => api.timer_pause().then()}
                    resumeCB={() => api.timer_resume().then()}
                    currentlyRunning={isRunning}
                    currentlyPaused={isPaused}
                />
            </Center>
            <Center>
                <Stack
                    align='center'
                    gap='xs'
                >
                    <div>
                        <Text>Client</Text>
                        <SelectCreatable
                            data={clientData || []}
                            selected={
                                selectedClient
                                    ? { value: selectedClient?.name, id: selectedClient?.id }
                                    : undefined
                            }
                            createData={addClient}
                            // allData={clientData}
                            // addData={addClient}
                            setData={setClient}
                            // clearData={clearClient}
                            // deleteData={deleteClient}
                            // placeholder='Select Client'
                        />
                    </div>
                    {projectsData && (
                        <>
                            <div>
                                <Text>Project</Text>
                                <SelectCreatable
                                    selected={
                                        selectedProject
                                            ? { value: selectedProject?.name, id: selectedProject?.id }
                                            : undefined
                                    }
                                    data={projectsData}
                                    createData={addProject}
                                    setData={setProject}
                                />
                                {selectedProject && (
                                    <span>
                                        {selectedProject.hours}:{selectedProject.minutes}:
                                        {selectedProject.seconds.toString().padStart(2, '0')}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                    {projectsData && taskData && (
                        <div>
                            <Text>Task</Text>
                            <SelectCreatable
                                selected={
                                    selectedTask
                                        ? { value: selectedTask?.name, id: selectedTask?.id }
                                        : undefined
                                }
                                data={taskData}
                                createData={addTask}
                                setData={setTask}
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
