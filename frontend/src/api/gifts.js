import api from './client'

const BASE = '/gifts'

export const getGifts = (params) => api.get(BASE, { params }).then((r) => r.data)

export const getGiftsSummary = () => api.get(`${BASE}/summary`).then((r) => r.data)

export const getThankYouPending = () =>
  api.get(`${BASE}/thank-you-pending`).then((r) => r.data)

export const getGift = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createGift = (data) => api.post(BASE, data).then((r) => r.data)

export const updateGift = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteGift = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)

export const exportGifts = (params) =>
  api.get(`${BASE}/export`, { params, responseType: 'blob' }).then((r) => r.data)
