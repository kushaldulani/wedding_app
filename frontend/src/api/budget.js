import api from './client'

const BASE = '/budget'

// Budget Categories
export const getCategories = () => api.get(`${BASE}/categories`).then((r) => r.data)

export const getBudgetOverview = () => api.get(`${BASE}/overview`).then((r) => r.data)

export const getCategory = (id) => api.get(`${BASE}/categories/${id}`).then((r) => r.data)

export const createCategory = (data) =>
  api.post(`${BASE}/categories`, data).then((r) => r.data)

export const updateCategory = (id, data) =>
  api.put(`${BASE}/categories/${id}`, data).then((r) => r.data)

export const deleteCategory = (id) =>
  api.delete(`${BASE}/categories/${id}`).then((r) => r.data)

// Expenses
export const getExpenses = (params) =>
  api.get(`${BASE}/expenses`, { params }).then((r) => r.data)

export const getExpense = (id) => api.get(`${BASE}/expenses/${id}`).then((r) => r.data)

export const createExpense = (data) =>
  api.post(`${BASE}/expenses`, data).then((r) => r.data)

export const updateExpense = (id, data) =>
  api.put(`${BASE}/expenses/${id}`, data).then((r) => r.data)

export const deleteExpense = (id) =>
  api.delete(`${BASE}/expenses/${id}`).then((r) => r.data)

export const exportCategories = () =>
  api.get(`${BASE}/categories/export`, { responseType: 'blob' }).then((r) => r.data)

export const exportExpenses = (params) =>
  api.get(`${BASE}/expenses/export`, { params, responseType: 'blob' }).then((r) => r.data)
