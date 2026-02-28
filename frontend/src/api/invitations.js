import api from './client'

const BASE = '/invitations'

export const getAll = () => api.get(BASE).then((r) => r.data)

export const getByEvent = (eventId, params) =>
  api.get(`${BASE}/event/${eventId}`, { params }).then((r) => r.data)

export const getByGuest = (guestId) =>
  api.get(`${BASE}/guest/${guestId}`).then((r) => r.data)

export const getRsvpSummary = (eventId) =>
  api.get(`${BASE}/rsvp-summary/${eventId}`).then((r) => r.data)

export const getInvitation = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createInvitation = (data) => api.post(BASE, data).then((r) => r.data)

export const bulkInvite = (data) => api.post(`${BASE}/bulk`, data).then((r) => r.data)

export const updateInvitation = (id, data) =>
  api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const bulkRsvpUpdate = (data) =>
  api.put(`${BASE}/bulk-rsvp`, data).then((r) => r.data)

export const deleteInvitation = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)

export const getMyInvitations = () => api.get('/my-invitations').then((r) => r.data)
