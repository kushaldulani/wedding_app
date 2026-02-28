import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as vendorsApi from '../api/vendors'

export function useVendors(params) {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => vendorsApi.getVendors(params),
  })
}

export function useVendorsSummary() {
  return useQuery({
    queryKey: ['vendors', 'summary'],
    queryFn: vendorsApi.getVendorsSummary,
  })
}

export function useVendor(id) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => vendorsApi.getVendor(id),
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: vendorsApi.createVendor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
}

export function useUpdateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => vendorsApi.updateVendor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: vendorsApi.deleteVendor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
}
