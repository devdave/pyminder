import { type Client, type Identifier } from '@src/types'
import APIBridge from '@src/api'
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'

export interface clientBrokerReturns {
    invalidateClients: () => Promise<void>
    fetch: (client_id: Identifier, enabled: boolean) => UseQueryResult<Client | undefined>
    getAll: () => UseQueryResult<Client[], Error>
    getAllActive: () => UseQueryResult<Client[], Error>
    create: (client_name: string) => Promise<Client>
    update: (client_id: Identifier, name: string) => Promise<Partial<Client> | undefined>
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

    const { mutateAsync: updateMutation } = useMutation<Client | undefined, Error, Partial<Client>>({
        mutationFn: ({ id, name }) => api.client_update(id as Identifier, name as string),
        onSuccess: (client) => {
            client && queryClient.invalidateQueries({ queryKey: ['client', client.id] }).then()
        }
    })

    const useFetch = (client_id: Identifier, enabled: boolean) =>
        useQuery({ enabled, queryKey: ['client', client_id], queryFn: () => api.client_get(client_id) })

    const useGetAll = () => useQuery({ queryKey: ['clients'], queryFn: () => api.clients_list() })

    const useGetAllActive = () => useQuery({ queryKey: ['clients'], queryFn: api.client_list_active })

    const create = (client_name: string): Promise<Client> => createMutation(client_name)

    const update = (client_id: Identifier, client_name: string) =>
        updateMutation({ id: client_id, name: client_name } as Partial<Client>)

    const destroy = (client_id: Identifier) =>
        api.client_destroy(client_id).then((status) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] }).then()
            return status
        })

    return {
        invalidateClients,
        fetch: useFetch,
        getAll: useGetAll,
        getAllActive: useGetAllActive,
        create,
        update,
        destroy
    }
}
