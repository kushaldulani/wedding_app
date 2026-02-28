import api from './client'

const BASE = '/media'

export const uploadAttachments = (entityType, entityId, files) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return api
    .post(`${BASE}/${entityType}/${entityId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    .then((r) => r.data)
}

export const getAttachments = (entityType, entityId) =>
  api.get(`${BASE}/${entityType}/${entityId}`).then((r) => r.data)

export const getFileUrl = (attachmentId) =>
  `${api.defaults.baseURL}${BASE}/file/${attachmentId}`

export const deleteAttachment = (id) =>
  api.delete(`${BASE}/${id}`).then((r) => r.data)
