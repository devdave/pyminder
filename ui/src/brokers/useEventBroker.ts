import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import APIBridge from '@src/api'
import { Entry, Event, Identifier, StopReasons } from '@src/types'

export interface CreateEvent {
    task_id: Identifier
    start_date: string
    details: string
    notes: string
    duration?: number
}

export interface UpdateEvent {
    id: Identifier
    details: string
    notes: string
}

export interface CreateEntry {
    task_id: Identifier
    event_id: Identifier
    start_dt: string
    end_dt: string
    seconds: number
    reason: StopReasons
}

export interface UseEventBrokerReturn {
    fetch: (event_id: Identifier) => UseQueryResult<Event>
    useGetAllByTask: (client_id: Identifier) => UseQueryResult<Event[]>
    create: (event_id: Identifier, start_date: string, details: string, notes: string) => Promise<Event>
    update: (event_id: Identifier, details: string, notes: string) => Promise<Event>
    destroy: (event_id: Identifier) => Promise<boolean>
    addEntry: (
        task_id: Identifier,
        event_id: Identifier,
        start_dt: string,
        end_dt: string,
        seconds: number,
        reason: StopReasons
    ) => Promise<Entry>
}

export const useEventBroker = (api: APIBridge): UseEventBrokerReturn => {
    const client = useQueryClient()

    const { mutateAsync: createMutation } = useMutation<Event, Error, CreateEvent>({
        mutationFn: (payload) =>
            api.event_create(payload.task_id, payload.start_date, payload.details, payload.notes),
        onSuccess: (event) => {
            client.invalidateQueries({ queryKey: ['task', event.task_id, 'events'] })
        }
    })

    const { mutateAsync: updateMutation } = useMutation<Event, Error, UpdateEvent>({
        mutationFn: (payload) => api.event_update(payload.id, payload.details, payload.notes),
        onSuccess: (event) => {
            client.invalidateQueries({ queryKey: ['task', event.task_id, 'event', event.id] })
        }
    })

    const { mutateAsync: addEntryMutation } = useMutation<Entry, Error, CreateEntry>({
        mutationFn: (payload) =>
            api.event_add_entry(
                payload.event_id,
                payload.start_dt,
                payload.end_dt,
                payload.seconds,
                payload.reason
            ),
        onSuccess: (event, context) => {
            client.invalidateQueries({ queryKey: ['task', context.task_id, 'event', event.id] })
        }
    })

    const useFetch = (event_id: Identifier) =>
        useQuery({
            queryKey: ['event', event_id],
            queryFn: () => api.event_get(event_id)
        })

    const useGetAllByTask = (task_id: Identifier) =>
        useQuery({ queryKey: ['events'], queryFn: () => api.events_by_task_id(task_id) })

    const create = (task_id: Identifier, start_date: string, details: string, notes: string) =>
        createMutation({ task_id, start_date, details, notes })

    const update = (id: Identifier, details: string, notes: string) => updateMutation({ id, details, notes })

    const destroy = (event_id: Identifier) => api.event_destroy(event_id)

    const addEntry = (
        task_id: Identifier,
        event_id: Identifier,
        start_dt: string,
        end_dt: string,
        seconds: number,
        reason: StopReasons
    ) => addEntryMutation({ task_id, event_id, start_dt, end_dt, seconds, reason })

    return {
        fetch: useFetch,
        addEntry,
        useGetAllByTask,
        create,
        update,
        destroy
    }
}
