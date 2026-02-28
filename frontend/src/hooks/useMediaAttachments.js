import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as mediaApi from '../api/media'

export function useAttachments(entityType, entityId) {
  return useQuery({
    queryKey: ['media', entityType, entityId],
    queryFn: () => mediaApi.getAttachments(entityType, entityId),
    enabled: !!entityType && !!entityId,
  })
}

export function useUploadAttachments(entityType, entityId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files) => mediaApi.uploadAttachments(entityType, entityId, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media', entityType, entityId] })
    },
  })
}

export function useDeleteAttachment(entityType, entityId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: mediaApi.deleteAttachment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media', entityType, entityId] })
    },
  })
}
