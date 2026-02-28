import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as lookupsApi from '../api/lookups'

// Generic hook — works for any lookup table
export function useLookup(tableName) {
  return useQuery({
    queryKey: ['lookups', tableName],
    queryFn: () => lookupsApi.getLookup(tableName),
    enabled: !!tableName,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateLookup(tableName) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => lookupsApi.createLookup(tableName, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lookups', tableName] }),
  })
}

export function useUpdateLookup(tableName) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => lookupsApi.updateLookup(tableName, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lookups', tableName] }),
  })
}

export function useDeleteLookup(tableName) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => lookupsApi.deleteLookup(tableName, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lookups', tableName] }),
  })
}

// Convenience aliases used by form dropdowns
export function useEventTypes() {
  return useLookup('event-types')
}

export function useVendorCategories() {
  return useLookup('vendor-categories')
}

export function useDietaryPreferences() {
  return useLookup('dietary-preferences')
}

export function useGiftTypes() {
  return useLookup('gift-types')
}

export function useRelationTypes() {
  return useLookup('relation-types')
}

export function useFamilyGroups() {
  return useLookup('family-groups')
}
