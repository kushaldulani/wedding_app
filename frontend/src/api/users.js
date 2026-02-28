import api from './client'

const BASE = '/users'

export const getUsers = (params) => api.get(BASE, { params }).then((r) => r.data)

export const getUser = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createUser = (data) => api.post(BASE, data).then((r) => r.data)

export const updateUser = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteUser = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)
