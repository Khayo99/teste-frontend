import { create } from 'zustand'
import type { AuthSession, AuthUser } from './api/auth-api'
import { clearPrivateCache } from '@/lib/query-client'
import { endSessionRealtime, startSessionRealtime } from '@/lib/realtime'

const STORAGE_KEY = 'kurio.auth.session'
type AuthState = { status: 'anonymous' | 'authenticated' | 'loading'; token: string | null; user: AuthUser | null; returnTo: string | null; setSession: (session: AuthSession) => void; setReturnTo: (path: string | null) => void; clear: () => void }

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading', token: null, user: null, returnTo: null,
  setSession: (session) => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: session.token, user: session.user, expiresAt: session.expiresAt })); startSessionRealtime(session.token); set({ status: 'authenticated', token: session.token, user: session.user }) },
  setReturnTo: (returnTo) => set({ returnTo }),
  clear: () => { localStorage.removeItem(STORAGE_KEY); clearPrivateCache(); endSessionRealtime(); set({ status: 'anonymous', token: null, user: null, returnTo: null }) },
}))

export function storedSession() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as { token: string; user: AuthUser; expiresAt: string } | null } catch { return null } }
export function setAuthLoading() { useAuthStore.setState({ status: 'loading' }) }
