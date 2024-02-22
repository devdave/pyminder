import { type Identifier } from '@src/types'
import APIBridge from '@src/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useClientBroker = (api: APIBridge) => {
    const queryClient = useQueryClient()

    const { mutate: createMutation } = useMutation<number, Error, string>({
        mutationFn: (client_name) => api.client_create(client_name)
    })

    const { mutate: updateMutation } = useMutation<
        { id: Identifier; name: string },
        Error,
        { id: Identifier; name: string }
    >({
        mutationFn: ({ id, name }) => api.client_update(id, name)
    })

    const fetch = (client_id: Identifier) =>
        //query fetch
        useQuery({ queryKey: ['client', client_id], queryFn: () => api.client_get(client_id) })

    const get_all = () => useQuery({ queryKey: ['clients'], queryFn: () => api.clients_list() })

    const create = (client_name: string) =>
        new Promise((resolve, reject) => {
            createMutation(client_name, {
                onSuccess: (client_id) => {
                    queryClient.invalidateQueries({ queryKey: ['clients'] }).then()
                    resolve(client_id)
                },
                onError: (error) => reject(error)
            })
        })

    const update = (client_id: Identifier, client_name: string) =>
        new Promise((resolve, reject) => {
            updateMutation(
                { id: client_id, name: client_name },
                {
                    onSuccess: (response) => resolve(response),
                    onError: (error) => reject(error)
                }
            )
        })

    const destroy = (client_id: Identifier) => api.client_destroy(client_id)

    return {
        fetch,
        get_all,
        create,
        update,
        destroy
    }
}