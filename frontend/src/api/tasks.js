import api from './client'

const BASE = '/tasks'

export const getTasks = (params) => api.get(BASE, { params }).then((r) => r.data)

export const getTasksSummary = () => api.get(`${BASE}/summary`).then((r) => r.data)

export const getOverdueTasks = () => api.get(`${BASE}/overdue`).then((r) => r.data)

export const getMyTasks = () => api.get(`${BASE}/my-tasks`).then((r) => r.data)

export const getTask = (id) => api.get(`${BASE}/${id}`).then((r) => r.data)

export const createTask = (data) => api.post(BASE, data).then((r) => r.data)

export const updateTask = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data)

export const patchTask = (id, data) => api.patch(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteTask = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data)

export const exportTasks = (params) =>
  api.get(`${BASE}/export`, { params, responseType: 'blob' }).then((r) => r.data)
