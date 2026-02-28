import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as guestsApi from '../api/guests'

export function useGuests(params) {
  return useQuery({
    queryKey: ['guests', params],
    queryFn: () => guestsApi.getGuests(params),
  })
}

export function useGuestsSummary() {
  return useQuery({
    queryKey: ['guests', 'summary'],
    queryFn: guestsApi.getGuestsSummary,
  })
}

export function useFamilyGroups() {
  return useQuery({
    queryKey: ['guests', 'family-groups'],
    queryFn: guestsApi.getFamilyGroups,
  })
}

export function useGuest(id) {
  return useQuery({
    queryKey: ['guests', id],
    queryFn: () => guestsApi.getGuest(id),
    enabled: !!id,
  })
}

export function useCreateGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: guestsApi.createGuest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  })
}

export function useUpdateGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => guestsApi.updateGuest(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  })
}

export function useDeleteGuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: guestsApi.deleteGuest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  })
}
