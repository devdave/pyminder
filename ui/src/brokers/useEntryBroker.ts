import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Identifier, Entry } from '@src/types'
import APIBridge from '@src/api'
import { UpdateEvent } from '@src/brokers/useEventBroker'

interface NewEntry extends Omit<Entry, 'id' | 'created_on' | 'updated_on'> {
    event_id: Identifier
    new_entry: Entry
}

interface UpdatedEntry extends Omit<Entry, 'id' | 'created_on' | 'updated_on'> {
    entry_id: Identifier
}

export const useEntryBroker = (api: APIBridge) => {
    const queryClient = useQueryClient()

    const useFetchEntriesByEvent = (event_id: Identifier) =>
        useQuery({
            queryFn: () => api.entries_lists_by_event_id(event_id),
            queryKey: ['event', event_id, 'entries']
        })

    const destroyEntry = (entry_id: Identifier) => api.entry_destroy(entry_id)

    const _possibleDate2string = (val: Date | string | null): string =>
        val instanceof Date ? val.toISOString() : (val as string)

    const createEntry = useMutation<Entry, Error, NewEntry>({
        mutationFn: (newEntry) =>
            api.entry_create(
                newEntry.event_id,
                _possibleDate2string(newEntry.started_on),
                _possibleDate2string(newEntry.stopped_on),
                newEntry.seconds
            ),
        onSuccess: (response, newEntry) => {
            queryClient.invalidateQueries({ queryKey: ['event', newEntry.event_id, 'entries'] }).then()
        }
    })

    const updateEntry = useMutation<Entry, Error, UpdatedEntry>({
        mutationFn: (changeset) =>
            api.entry_update(
                changeset.entry_id,
                _possibleDate2string(changeset.started_on),
                _possibleDate2string(changeset.stopped_on),
                changeset.seconds
            )
    })

    return {
        fetchByEvent: useFetchEntriesByEvent,
        destroy: destroyEntry,
        create: createEntry,
        update: updateEntry
    }
}
