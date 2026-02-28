import api from './client'

const BASE = '/guests'

export const getGuests = (params) => api.get(BASE, { params }).then((r) => r.data)

export const getGuestsSummary = () => api.get(`${BASE}/summary`).then((r) => r.data)

export const getFamilyGroups = () => api.get(`${BASE}/family-groups`).then((r) => r.data)

export const getGuest = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createGuest = (data) => api.post(BASE, data).then((r) => r.data)

export const updateGuest = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteGuest = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)

export const exportGuests = (params) =>
  api.get(`${BASE}/export`, { params, responseType: 'blob' }).then((r) => r.data)
