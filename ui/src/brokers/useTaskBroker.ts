import APIBridge from '@src/api'
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { Identifier, Task } from '@src/types'

export interface CreateTask {
    project_id: Identifier
    name: string
}

export interface UpdateTask {
    id: Identifier
    name: string | undefined
    status: string | undefined
}

export interface UseTaskBrokerReturns {
    invalidateTask: (project_id: Identifier, task_id: Identifier) => Promise<void>
    invalidateTasks: (project_id: Identifier) => Promise<void>
    fetch: (project_id: Identifier, task_id: Identifier, enabled: boolean) => UseQueryResult<Task>
    getAllByProject: (project_id: Identifier, enabled: boolean) => UseQueryResult<Task[], Error>
    create: (project_id: Identifier, name: string) => Promise<Task>
    update: (task_id: Identifier, name: string, status: string) => Promise<Task | undefined>
    destroy: (taskId: Identifier) => Promise<boolean>
}

export const useTaskBroker = (api: APIBridge): UseTaskBrokerReturns => {
    const client = useQueryClient()

    const invalidateTask = async (project_id: Identifier, task_id: Identifier) => {
        await client.invalidateQueries({ queryKey: ['project', project_id, 'task', task_id] })
    }

    const invalidateTasks = async (project_id: Identifier) => {
        await client.invalidateQueries({ queryKey: ['project', project_id, 'tasks'] })
    }

    const { mutateAsync: createMutation } = useMutation<Task, Error, CreateTask>({
        mutationFn: ({ project_id, name }) => api.task_create(project_id, name),
        onSuccess: (task: Task) => {
            client.setQueryData(['project', task.project_id, 'task', task.id], task)
            client.invalidateQueries({ queryKey: ['project', task.project_id, 'tasks'] }).then()
        }
    })

    const { mutateAsync: updateMutation } = useMutation<Task | undefined, Error, UpdateTask>({
        mutationFn: (changeset) => api.task_update(changeset.id, changeset.name, changeset.status),
        onSuccess: (task: Task | undefined) => {
            task &&
                client.invalidateQueries({ queryKey: ['project', task.project_id, 'task', task.id] }).then()
        }
    })

    const useFetch = (project_id: Identifier, task_id: Identifier, enabled: boolean) =>
        useQuery({
            enabled,
            queryKey: ['project', project_id, 'task', task_id],
            queryFn: () => api.task_get(task_id)
        })

    const useGetAllByProject = (project_id: Identifier, enabled: boolean) =>
        useQuery({
            enabled,
            queryKey: ['project', project_id, 'tasks'],
            queryFn: () => api.tasks_lists_by_project_id(project_id)
        })

    const createTask = (project_id: Identifier, name: string) => createMutation({ project_id, name })

    const updateTask = (id: Identifier, name: string | undefined, status: string | undefined) =>
        updateMutation({ id, name, status })

    const destroyTask = (id: Identifier) => api.task_destroy(id)

    return {
        invalidateTask,
        invalidateTasks,
        fetch: useFetch,
        getAllByProject: useGetAllByProject,
        create: createTask,
        update: updateTask,
        destroy: destroyTask
    }
}
