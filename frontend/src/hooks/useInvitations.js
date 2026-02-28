import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as invApi from '../api/invitations'

export function useAllInvitations() {
  return useQuery({
    queryKey: ['invitations', 'all'],
    queryFn: invApi.getAll,
  })
}

export function useInvitationsByEvent(eventId, params) {
  return useQuery({
    queryKey: ['invitations', 'event', eventId, params],
    queryFn: () => invApi.getByEvent(eventId, params),
    enabled: !!eventId,
  })
}

export function useInvitationsByGuest(guestId) {
  return useQuery({
    queryKey: ['invitations', 'guest', guestId],
    queryFn: () => invApi.getByGuest(guestId),
    enabled: !!guestId,
  })
}

export function useRsvpSummary(eventId) {
  return useQuery({
    queryKey: ['invitations', 'rsvp-summary', eventId],
    queryFn: () => invApi.getRsvpSummary(eventId),
    enabled: !!eventId,
  })
}

export function useCreateInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: invApi.createInvitation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  })
}

export function useBulkInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: invApi.bulkInvite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  })
}

export function useUpdateInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => invApi.updateInvitation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  })
}

export function useDeleteInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: invApi.deleteInvitation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  })
}

export function useMyInvitations() {
  return useQuery({
    queryKey: ['invitations', 'my-invitations'],
    queryFn: invApi.getMyInvitations,
  })
}
