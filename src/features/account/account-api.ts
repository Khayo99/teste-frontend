import axios from 'axios'
import { api } from '@/lib/api'

export type Profile = {
  displayName: string
  username: string
  email: string
  ens: string
  walletAlias: string
  avatar?: string
}
export type Wallet = {
  id: string
  displayName: string
  alias: string
  network: string
  profileName: string
  address: string
  secondaryAddress?: string
  type: string
  referralCode: string
  email: string
  ens: string
}
export type AccountError = Error & { fieldErrors?: Record<string, string> }

function headers() {
  const session = JSON.parse(
    localStorage.getItem('kurio.auth.session') ?? 'null'
  ) as { token?: string } | null
  return { Authorization: `Bearer ${session?.token ?? ''}` }
}

function errorMessage(error: unknown): AccountError {
  const data = axios.isAxiosError(error)
    ? (error.response?.data as {
        message?: string
        fieldErrors?: Record<string, string>
      })
    : undefined
  return Object.assign(
    new Error(data?.message ?? 'Não foi possível salvar suas informações.'),
    { fieldErrors: data?.fieldErrors }
  )
}

export async function getProfile() {
  try {
    return (
      await api.get<{ profile: Profile }>('/profile', { headers: headers() })
    ).data.profile
  } catch (error) {
    throw errorMessage(error)
  }
}
export async function saveProfile(profile: Profile) {
  try {
    return (
      await api.put<{
        profile: Profile
        user: { id: string; name: string; email: string }
      }>('/profile', profile, { headers: headers() })
    ).data
  } catch (error) {
    throw errorMessage(error)
  }
}
export async function changePassword(input: {
  currentPassword: string
  password: string
  confirmPassword: string
}) {
  try {
    await api.put('/profile/password', input, { headers: headers() })
  } catch (error) {
    throw errorMessage(error)
  }
}
export async function getWallets() {
  try {
    return (
      await api.get<{ wallets: Wallet[] }>('/wallets', { headers: headers() })
    ).data.wallets
  } catch (error) {
    throw errorMessage(error)
  }
}
export async function saveWallet(wallet: Wallet) {
  try {
    return (
      await api.put<{ wallet: Wallet }>('/wallets/' + wallet.id, wallet, {
        headers: headers()
      })
    ).data.wallet
  } catch (error) {
    throw errorMessage(error)
  }
}
