import api from './client'

const BASE = '/vendor-services'

export const getVendorServices = (params) => api.get(BASE, { params }).then((r) => r.data)

export const getVendorServicesSummary = () => api.get(`${BASE}/summary`).then((r) => r.data)

export const getVendorService = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createVendorService = (data) => api.post(BASE, data).then((r) => r.data)

export const updateVendorService = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteVendorService = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)

export const exportVendorServices = (params) =>
  api.get(`${BASE}/export`, { params, responseType: 'blob' }).then((r) => r.data)
