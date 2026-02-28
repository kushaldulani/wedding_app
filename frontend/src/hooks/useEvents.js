import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as eventsApi from '../api/events'

export function useEvents(params) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsApi.getEvents(params),
  })
}

export function useEventsSummary() {
  return useQuery({
    queryKey: ['events', 'summary'],
    queryFn: eventsApi.getEventsSummary,
  })
}

export function useEvent(id) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.getEvent(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => eventsApi.updateEvent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
