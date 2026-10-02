import axios from 'axios'
import { api } from '@/lib/api'
import type { LoginInput, RegisterInput } from '../lib/auth-validation'

export type AuthUser = { id: string; name: string; email: string }
export type AuthSession = { token: string; user: AuthUser; expiresAt: string }
export type ApiFieldErrors = Record<string, string>

export class AuthApiError extends Error {
  fieldErrors: ApiFieldErrors
  constructor(message: string, fieldErrors: ApiFieldErrors = {}) {
    super(message)
    this.name = 'AuthApiError'
    this.fieldErrors = fieldErrors
  }
}

function normalizeError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; fieldErrors?: ApiFieldErrors } | undefined
    return new AuthApiError(data?.message ?? 'Não foi possível concluir a operação.', data?.fieldErrors)
  }
  return new AuthApiError('Não foi possível concluir a operação.')
}

export async function register(input: RegisterInput) {
  try { return (await api.post<{ session: AuthSession }>('/auth/register', input)).data.session } catch (error) { throw normalizeError(error) }
}

export async function login(input: LoginInput) {
  try { return (await api.post<{ session: AuthSession }>('/auth/login', input)).data.session } catch (error) { throw normalizeError(error) }
}

export async function getSession(token: string) {
  try {
    return (await api.get<{ session: AuthSession }>('/auth/session', { headers: { Authorization: `Bearer ${token}` } })).data.session
  } catch (error) { throw normalizeError(error) }
}

export async function logout(token: string) {
  try { await api.post('/auth/logout', undefined, { headers: { Authorization: `Bearer ${token}` } }) } catch (error) { throw normalizeError(error) }
}
