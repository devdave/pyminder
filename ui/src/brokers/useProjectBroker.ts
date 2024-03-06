import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { Identifier, Project } from '@src/types'
import APIBridge from '@src/api'

export interface CreateProject {
    client_id: Identifier
    name: string
}

export interface UpdateProject {
    id: Identifier
    name: string
}

export interface projectBrokerReturn {
    invalidateProject: (client_id: Identifier, project_id: Identifier) => Promise<void>
    invalidateProjects: (client_id: Identifier) => Promise<void>
    fetch: (client_id: Identifier, project_id: Identifier, enabled: boolean) => UseQueryResult<Project>
    useGetAllByClient: (client_id: Identifier, enabled: boolean) => UseQueryResult<Project[]>
    getAllActiveByClient: (client_id: Identifier, enabled: boolean) => UseQueryResult<Project[]>
    create: (client_id: Identifier, name: string) => Promise<Project>
    update: (project_id: Identifier, name: string) => Promise<Project>
    destroy: (project_id: Identifier) => Promise<boolean>
}

export const useProjectBroker = (api: APIBridge): projectBrokerReturn => {
    const queryClient = useQueryClient()

    const invalidateProject = async (client_id: Identifier, project_id: Identifier) => {
        await queryClient.invalidateQueries({ queryKey: ['client', client_id, 'project', project_id] })
    }
    const invalidateProjects = async (client_id: Identifier) => {
        await queryClient.invalidateQueries({ queryKey: ['client', client_id, 'projects'] })
    }

    const { mutateAsync: createMutation } = useMutation<Project, Error, CreateProject>({
        mutationFn: ({ client_id, name }) => api.project_create(client_id, name),
        onSuccess: (project: Project) => {
            invalidateProjects(project.client_id).then()
        }
    })

    const { mutateAsync: updateMutation } = useMutation<Project, Error, UpdateProject>({
        mutationFn: (changeset) => api.project_update(changeset.id, changeset.name),
        onSuccess: (project: Project) => {
            invalidateProject(project.client_id, project.id).then()
        }
    })

    const useFetch = (client_id: Identifier, project_id: Identifier, enabled: boolean) =>
        useQuery({
            enabled,
            queryKey: ['client', client_id, 'project', project_id],
            queryFn: () => api.project_get(project_id)
        })

    const useGetAllByClient = (client_id: Identifier, enabled: boolean) =>
        useQuery({
            enabled,
            queryKey: ['client', client_id, 'projects'],
            queryFn: () => api.projects_list_by_client_id(client_id)
        })

    const useGetAllActiveByClient = (client_id: Identifier, enabled: boolean) =>
        useQuery({
            enabled,
            queryKey: ['client', client_id, 'projects'],
            queryFn: () => api.projects_list_active_by_client_id(client_id)
        })

    const createProject = (client_id: Identifier, name: string) => createMutation({ client_id, name })

    const updateProject = (id: Identifier, name: string) => updateMutation({ id, name })

    const destroy = (project_id: Identifier) => api.project_destroy(project_id)

    return {
        invalidateProject,
        invalidateProjects,
        fetch: useFetch,
        useGetAllByClient,
        getAllActiveByClient: useGetAllActiveByClient,
        create: createProject,
        update: updateProject,
        destroy
    }
}
