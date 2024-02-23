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
    fetch: (client_id: Identifier, project_id: Identifier) => UseQueryResult
    useGetAllByClient: (client_id: Identifier) => UseQueryResult
    create: (client_id: Identifier, name: string) => Promise<Project>
    update: (project_id: Identifier, name: string) => Promise<Project>
    destroy: (project_id: Identifier) => Promise<boolean>
}

export const useProjectBroker = (api: APIBridge): projectBrokerReturn => {
    const queryClient = useQueryClient()

    const { mutateAsync: createMutation } = useMutation<Project, Error, CreateProject>({
        mutationFn: ({ client_id, name }) => api.project_create(client_id, name),
        onSuccess: (project: Project) => {
            queryClient.invalidateQueries({ queryKey: ['client', project.client_id, 'projects'] }).then()
        }
    })

    const { mutateAsync: updateMutation } = useMutation<Project, Error, UpdateProject>({
        mutationFn: (changeset) => api.project_update(changeset.id, changeset.name),
        onSuccess: (project: Project) => {
            queryClient
                .invalidateQueries({ queryKey: ['client', project.client_id, 'project', project.id] })
                .then()
        }
    })

    const useFetch = (client_id: Identifier, project_id: Identifier) =>
        useQuery({
            queryKey: ['client', client_id, 'project', project_id],
            queryFn: () => api.project_get(project_id)
        })

    const useGetAllByClient = (client_id: Identifier) =>
        useQuery({
            queryKey: ['client', client_id, 'projects'],
            queryFn: () => api.projects_list_by_client_id(client_id)
        })

    const createProject = (client_id: Identifier, name: string) => createMutation({ client_id, name })

    const updateProject = (id: Identifier, name: string) => updateMutation({ id, name })

    const destroy = (project_id: Identifier) => api.project_destroy(project_id)

    return {
        fetch: useFetch,
        useGetAllByClient,
        create: createProject,
        update: updateProject,
        destroy
    }
}
