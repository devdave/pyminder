import { type Client, type Identifier } from '@src/types'
import APIBridge from '@src/api'
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'

export interface clientBrokerReturns {
    invalidateClients: () => Promise<void>
    fetch: (client_id: Identifier, enabled: boolean) => UseQueryResult<Client>
    getAll: () => UseQueryResult<Client[], Error>
    create: (client_name: string) => Promise<Client>
    update: (client_id: Identifier, name: string) => Promise<Client>
    destroy: (client_id: Identifier) => Promise<boolean>
}

export const useClientBroker = (api: APIBridge): clientBrokerReturns => {
    const queryClient = useQueryClient()

    const invalidateClients = async () => {
        await queryClient.invalidateQueries({ queryKey: ['clients'] })
    }

    const { mutateAsync: createMutation } = useMutation<Client, Error, string>({
        mutationFn: (client_name) => api.client_create(client_name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] }).then()
        }
    })

    const { mutateAsync: updateMutation } = useMutation<Client, Error, Client>({
        mutationFn: ({ id, name }) => api.client_update(id, name),
        onSuccess: (client) => {
            queryClient.invalidateQueries({ queryKey: ['client', client.id] }).then()
        }
    })

    const useFetch = (client_id: Identifier, enabled: boolean) =>
        useQuery({ enabled, queryKey: ['client', client_id], queryFn: () => api.client_get(client_id) })

    const useGetAll = () => useQuery({ queryKey: ['clients'], queryFn: () => api.clients_list() })

    const create = (client_name: string): Promise<Client> => createMutation(client_name)

    const update = (client_id: Identifier, client_name: string) =>
        updateMutation({ id: client_id, name: client_name })

    const destroy = (client_id: Identifier) =>
        api.client_destroy(client_id).then((status) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] }).then()
            return status
        })

    return {
        invalidateClients,
        fetch: useFetch,
        getAll: useGetAll,
        create,
        update,
        destroy
    }
}
