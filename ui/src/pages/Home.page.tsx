import { MainTimer } from '@src/components/MainTimer/MainTimer'
import { Select, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'

import { useAppContext } from '@src/App.context'
import { useCallback, useEffect, useState } from 'react'
import { Client, Identifier, Project, Task, TimeObj, TimeOwner } from '@src/types'
import { SelectCreatable } from '@src/components/SmartSelect/SmartSelectV2'
import { IconX } from '@tabler/icons-react'

export function HomePage() {
    const { api, switchboard, clientBroker, projectBroker, taskBroker, shortcutBroker } = useAppContext()

    const [currentTime, setCurrentTime] = useState<TimeObj>({ hour: 0, minute: 0, second: 0 })
    const [isPaused, setIsPaused] = useState(false)
    const [isRunning, setIsRunning] = useState(false)

    const [selectedClientID, setSelectedClientID] = useState<Identifier | null>(null)
    const [selectedProjectID, setSelectedProjectID] = useState<Identifier | null>(null)
    const [selectedTaskID, setSelectedTaskID] = useState<Identifier | null>(null)
    const [selectedShortcutID, setSelectedShortcutID] = useState<Identifier | null>(null)

    const { data: shortcuts } = shortcutBroker.fetchAll()

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

    const { data: allProjects, isLoading: projectsAreLoading } = projectBroker.getAllActiveByClient(
        selectedClient?.id as Identifier,
        selectedClient !== undefined && selectedClient !== null
    )

    const { data: allTasks, isLoading: tasksAreLoading } = taskBroker.getAllActiveByProject(
        selectedProjectID as Identifier,
        selectedProjectID !== undefined && selectedProjectID !== null
    )

    const { data: selectedTask, isLoading: taskIsLoading } = taskBroker.fetch(
        selectedProjectID as Identifier,
        selectedTaskID as Identifier,
        selectedTaskID !== undefined && selectedTaskID !== null
    )

    /**
     * Client side callback for the backend to update the clock
     *
     * @param newTime tuple
     */
    function timeChanged(newTime: [number, number, number]) {
        console.log('tick', newTime)
        setCurrentTime(() => ({
            hour: newTime[0],
            minute: newTime[1],
            second: newTime[2]
        }))
    }

    const timeStop = useCallback(() => {
        api.timer_stop().then(() => {
            projectBroker
                .invalidateProject(selectedClientID as Identifier, selectedProjectID as Identifier)
                .then()
            taskBroker.invalidateTask(selectedProjectID as Identifier, selectedTaskID as Identifier).then()
            api.title_set('PyMinder').then()
            setIsRunning(() => false)
            setIsPaused(() => false)
            // setCurrentTime(() => ({ hour: 0, minute: 0, second: 0 }))
        })
    }, [api, projectBroker, selectedClientID, selectedProjectID, selectedTaskID, taskBroker])

    const startTime = async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const id = switchboard.generate(timeChanged)
        await api.timer_start(id, selectedTaskID as Identifier)
        await api.title_set(`PyMinder->${selectedTask?.name}`)
        await shortcutBroker.create(
            selectedClientID as Identifier,
            selectedProjectID as Identifier,
            selectedTaskID as Identifier
        )
        await shortcutBroker.invalidate()
    }

    useEffect(() => {
        console.log('use effected')
        api.timer_check().then((status) => {
            if (status) {
                api.timer_owner().then((owner: TimeOwner | undefined) => {
                    if (owner) {
                        console.log('Reconnecting to timer', owner)
                        setSelectedClientID(owner.client.id)
                        setSelectedProjectID(owner.project.id)
                        setSelectedTaskID(owner.task.id)
                        setIsPaused(owner.isPaused)
                        setIsRunning(owner.isRunning)
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const new_id = switchboard.generate(timeChanged)
                        api.timer_override(new_id).then()
                    }
                })
            }
        })

        // api.shortcut_get_all().then((records) => {
        //     setShortOptions(() =>
        //         records.map((record) => ({
        //             value: record.id.toString(),
        //             label: record.compound_name.join('->') as string
        //         }))
        //     )
        // })
    }, [api, switchboard])

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

    const shortOptions = shortcuts
        ? shortcuts.map((record) => ({
              value: record.id.toString(),
              label: record.compound_name.join('->') as string
          }))
        : []

    const clientData = clients?.map((element: Client) => ({ id: element.id, value: element.name }))

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
        api.timer_stop().then()
        setSelectedClientID(null)
        setSelectedProjectID(null)
        setSelectedTaskID(null)
        setCurrentTime(() => ({ hour: 0, minute: 0, second: 0 }))
    }

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

    const clearProject = () => {
        api.timer_stop().then()
        setSelectedProjectID(null)
        setSelectedTaskID(null)
        setCurrentTime(() => ({ hour: 0, minute: 0, second: 0 }))
    }

    const addTask = async (taskName: string) => {
        if (selectedProjectID) {
            try {
                const record = await taskBroker.create(selectedProjectID, taskName)
                setSelectedTaskID(record.id)
            } catch (error) {
                if (error instanceof Error && error.name === 'IntegrityError') {
                    const record = await api.task_get_by_name(taskName)
                    await api.task_set_status(record.id, true)
                    setSelectedTaskID(record.id)
                    notifications.show({
                        withCancelable: true,
                        autoClose: 2500,
                        title: 'Info',
                        color: 'green',
                        message: `${taskName} already existed, re-enabled`
                    })
                } else {
                    notifications.show({
                        withCloseButton: true,
                        autoClose: 5500,
                        title: 'Error',
                        message: `Unknown/unexpected error: ${JSON.stringify(error)}`,
                        color: 'red',
                        icon: <IconX />
                    })
                }
            }
        }
    }

    const setTask = (taskId: Identifier) => {
        console.log('Task set', taskId)
        if (taskId !== null && taskId !== undefined) {
            setSelectedTaskID(taskId)
        }
    }

    const handleShortcutChange = async (shortcutId: string) => {
        timeStop()
        setIsRunning(false)
        setIsRunning(() => false)
        setIsPaused(false)
        setIsPaused(() => false)
        setSelectedShortcutID(shortcutId)
        const selectedShortcut = await api.shortcut_get(shortcutId)
        if (selectedShortcut) {
            setSelectedClientID(selectedShortcut.client_id)
            setSelectedProjectID(selectedShortcut.project_id)
            setSelectedTaskID(selectedShortcut.task_id)
        }
    }

    const clearTask = () => {
        api.timer_stop().then()
        if (isRunning || isPaused) {
            setIsRunning(false)
            setIsPaused(false)
        }
        setSelectedTaskID(null)
        setCurrentTime(() => ({ hour: 0, minute: 0, second: 0 }))
    }

    const deleteSelectedTask = async (id: Identifier, value: string) => {
        // eslint-disable-next-line no-alert
        const choice = window.confirm(`Are you sure you want to delete ${value} task?`)
        console.log('delete task', id, value, choice)
        if (choice) {
            await taskBroker.destroy(id)
            await taskBroker.invalidateTasks(selectedProjectID as Identifier)
            return true
        }
        return false
    }

    return (
        <Stack
            align='center'
            justify='flex-start'
            gap='2'
        >
            <Select
                placeholder='Select shortcut'
                data={shortOptions}
                value={selectedShortcutID ? selectedShortcutID.toString() : null}
                onChange={(value, option) => {
                    console.log(option)
                    if (value) {
                        handleShortcutChange(value)
                    }
                }}
            />
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
            <SelectCreatable
                data={clientData || []}
                selected={
                    selectedClient ? { value: selectedClient?.name, id: selectedClient?.id } : undefined
                }
                createData={addClient}
                setData={setClient}
                placeholder='Select Client'
                onClear={clearClient}
            />

            {projectsData && (
                <div>
                    <SelectCreatable
                        selected={
                            selectedProject
                                ? { value: selectedProject?.name, id: selectedProject?.id }
                                : undefined
                        }
                        data={projectsData}
                        createData={addProject}
                        setData={setProject}
                        onClear={clearProject}
                        placeholder='Select Project'
                    />
                    {selectedProject && (
                        <span>
                            {selectedProject.time?.hours.toString().padStart(2, '0')}:
                            {selectedProject.time?.minutes.toString().padStart(2, '0')}:
                            {selectedProject.time?.seconds.toString().padStart(2, '0')}
                        </span>
                    )}
                </div>
            )}
            {projectsData && taskData && (
                <div>
                    <SelectCreatable
                        selected={
                            selectedTask ? { value: selectedTask?.name, id: selectedTask?.id } : undefined
                        }
                        data={taskData}
                        createData={addTask}
                        setData={setTask}
                        onClear={clearTask}
                        onDelete={deleteSelectedTask}
                        placeholder='Select Task'
                    />
                    {selectedTask && selectedTask.time && (
                        <span>
                            {selectedTask.time.hours.toString().padStart(2, '0')}:
                            {selectedTask.time.minutes.toString().padStart(2, '0')}:
                            {Math.floor(selectedTask.time.seconds).toString().padStart(2, '0')}
                        </span>
                    )}
                </div>
            )}
        </Stack>
    )
}
