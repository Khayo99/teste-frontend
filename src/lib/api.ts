import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(response => {
  const contentType = response.headers?.['content-type']

  if (typeof contentType === 'string' && contentType.includes('text/html')) {
    throw new Error(
      'A API respondeu com HTML em vez de JSON. O Mock Service Worker pode não estar ativo; recarregue a página.'
    )
  }

  return response
}, error => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    void import('@/features/auth/auth-store').then(({ useAuthStore }) => {
      if (useAuthStore.getState().status === 'authenticated') useAuthStore.getState().clear()
    })
  }
  return Promise.reject(error)
})
