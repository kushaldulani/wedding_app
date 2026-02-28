import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/vendor-services'

export function useVendorServices(params) {
  return useQuery({
    queryKey: ['vendor-services', params],
    queryFn: () => api.getVendorServices(params),
  })
}

export function useVendorServicesSummary() {
  return useQuery({
    queryKey: ['vendor-services', 'summary'],
    queryFn: api.getVendorServicesSummary,
  })
}

export function useVendorService(id) {
  return useQuery({
    queryKey: ['vendor-services', id],
    queryFn: () => api.getVendorService(id),
    enabled: !!id,
  })
}

export function useCreateVendorService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createVendorService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-services'] }),
  })
}

export function useUpdateVendorService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateVendorService(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-services'] }),
  })
}

export function useDeleteVendorService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteVendorService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-services'] }),
  })
}
