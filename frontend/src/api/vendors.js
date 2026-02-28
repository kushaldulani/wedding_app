import api from './client'

const BASE = '/vendors'

export const getVendors = (params) => api.get(BASE, { params }).then((r) => r.data)

export const getVendorsSummary = () => api.get(`${BASE}/summary`).then((r) => r.data)

export const getVendor = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createVendor = (data) => api.post(BASE, data).then((r) => r.data)

export const updateVendor = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteVendor = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)

export const exportVendors = (params) =>
  api.get(`${BASE}/export`, { params, responseType: 'blob' }).then((r) => r.data)
