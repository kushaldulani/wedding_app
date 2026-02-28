import api from './client'

export const login = (data) => api.post('/auth/login', data).then((r) => r.data)

export const register = (data) => api.post('/auth/register', data).then((r) => r.data)

export const refreshToken = (refresh_token) =>
  api.post('/auth/refresh', { refresh_token }).then((r) => r.data)

export const getMe = () => api.get('/auth/me').then((r) => r.data)
