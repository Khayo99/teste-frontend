import { create } from 'zustand'
import type { AuthSession, AuthUser } from './api/auth-api'
import { clearPrivateCache } from '@/lib/query-client'
import { endSessionRealtime, startSessionRealtime } from '@/lib/realtime'

const STORAGE_KEY = 'kurio.auth.session'
type AuthState = {
  status: 'anonymous' | 'authenticated' | 'loading'
  token: string | null
  user: AuthUser | null
  returnTo: string | null
  authModal: {
    open: boolean
    mode: 'login' | 'register'
    returnTo: string | null
  }
  setSession: (session: AuthSession) => void
  setReturnTo: (path: string | null) => void
  openAuthModal: (mode?: 'login' | 'register', returnTo?: string | null) => void
  closeAuthModal: () => void
  updateUser: (user: AuthUser) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  status: 'loading',
  token: null,
  user: null,
  returnTo: null,
  authModal: { open: false, mode: 'login', returnTo: null },
  setSession: session => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: session.token,
        user: session.user,
        expiresAt: session.expiresAt
      })
    )
    startSessionRealtime(session.token)
    set({ status: 'authenticated', token: session.token, user: session.user })
  },
  setReturnTo: returnTo => set({ returnTo }),

  openAuthModal: (mode = 'login', returnTo = null) =>
    set({ authModal: { open: true, mode, returnTo } }),

  closeAuthModal: () =>
    set({ authModal: { open: false, mode: 'login', returnTo: null } }),

  updateUser: user => set(state => {
    if (state.token) {
      const saved = storedSession()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user, expiresAt: saved?.expiresAt }))
    }
    return { user }
  }),

  clear: () => {
    localStorage.removeItem(STORAGE_KEY)
    clearPrivateCache()
    endSessionRealtime()
    set({ status: 'anonymous', token: null, user: null, returnTo: null })
  }
}))

export function storedSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as {
      token: string
      user: AuthUser
      expiresAt: string
    } | null
  } catch {
    return null
  }
}

export function setAuthLoading() {
  useAuthStore.setState({ status: 'loading' })
}
