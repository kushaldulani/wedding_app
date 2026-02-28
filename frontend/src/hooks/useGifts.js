import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as giftsApi from '../api/gifts'

export function useGifts(params) {
  return useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftsApi.getGifts(params),
  })
}

export function useGiftsSummary() {
  return useQuery({
    queryKey: ['gifts', 'summary'],
    queryFn: giftsApi.getGiftsSummary,
  })
}

export function useThankYouPending() {
  return useQuery({
    queryKey: ['gifts', 'thank-you-pending'],
    queryFn: giftsApi.getThankYouPending,
  })
}

export function useGift(id) {
  return useQuery({
    queryKey: ['gifts', id],
    queryFn: () => giftsApi.getGift(id),
    enabled: !!id,
  })
}

export function useCreateGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: giftsApi.createGift,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gifts'] }),
  })
}

export function useUpdateGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => giftsApi.updateGift(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gifts'] }),
  })
}

export function useDeleteGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: giftsApi.deleteGift,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gifts'] }),
  })
}
