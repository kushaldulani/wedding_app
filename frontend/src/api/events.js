import api from './client'

const BASE = '/events'

export const getEvents = (params) => api.get(BASE, { params }).then((r) => r.data)

export const getEventsSummary = () => api.get(`${BASE}/summary`).then((r) => r.data)

export const getEvent = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createEvent = (data) => api.post(BASE, data).then((r) => r.data)

export const updateEvent = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteEvent = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)

export const exportEvents = (params) =>
  api.get(`${BASE}/export`, { params, responseType: 'blob' }).then((r) => r.data)
