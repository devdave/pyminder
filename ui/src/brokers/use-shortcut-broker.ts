import type { Shortcut, Identifier } from '@src/types'
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import APIBridge from '@src/api'

export interface ShortcutBrokerFunctions {
    invalidate: () => Promise<null>
    fetchAll: () => UseQueryResult<Shortcut[], Error>
    create: (client_id: Identifier, project_id: Identifier, task_id: Identifier) => Promise<Shortcut>
}

export const useShortcutBroker = (api: APIBridge): ShortcutBrokerFunctions => {
    const queryClient = useQueryClient()
    const invalidateQuery = () =>
        new Promise<null>((resolve) => {
            queryClient.invalidateQueries({ queryKey: ['shortcuts'] }).then(() => resolve(null))
        })

    const useFetchAll = () =>
        useQuery<Shortcut[], Error>({ queryKey: ['shortcuts'], queryFn: () => api.shortcut_get_all() })

    const create = (client_id: Identifier, project_id: Identifier, task_id: Identifier) =>
        api.shortcut_add(client_id, project_id, task_id)

    return {
        invalidate: invalidateQuery,
        fetchAll: useFetchAll,
        create
    }
}
