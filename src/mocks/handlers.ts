import { HttpResponse, http, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { catalogNfts } from '@/features/catalog/data/catalog-fixtures'
import { filterCatalog } from '@/features/catalog/lib/filter-catalog'
import type {
  CatalogCategory,
  CatalogNetwork,
  CatalogSort
} from '@/@types/catalog'
import { getNftDetailFixture } from '@/features/nft-detail/data/nft-detail-fixtures'
import Decimal from 'decimal.js'
import type { CartQuote } from '@/features/cart/cart-api'

type User = { id: string; name: string; email: string; passwordHash: string }
type StoredUser = Omit<User, 'passwordHash'> & { passwordHash: string }
type Profile = {
  displayName: string
  username: string
  email: string
  ens: string
  walletAlias: string
  avatar?: string
}
type Wallet = {
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

const USERS_STORAGE_KEY = 'kurio.mock.users'
const FAVORITES_STORAGE_KEY = 'kurio.mock.favorites'
const PROFILES_STORAGE_KEY = 'kurio.mock.profiles'
const WALLETS_STORAGE_KEY = 'kurio.mock.wallets'
const ORDERS_STORAGE_KEY = 'kurio.mock.orders'
const CATALOG_STORAGE_KEY = 'kurio.mock.catalog'
const CARTS_STORAGE_KEY = 'kurio.mock.carts'
const SESSIONS_STORAGE_KEY = 'kurio.mock.sessions'
type MockCartLine = { lineId: string; id: string; editionId: string; editionLabel: string; quantity: number; stock: number }
type MockCart = { items: MockCartLine[]; coupon: string | null; revision: number }
type Order = {
  id: string
  userId: string
  status: 'pending' | 'confirmed' | 'declined'
  version: number
  receipt: CartQuote
  createdAt: string
  reason?: string
  transactionReference?: string
  idempotencyKey: string
  fingerprint: string
  resolveAt?: string
}
const initialCatalog = catalogNfts.map(nft => ({ ...nft }))
let mockCatalog = initialCatalog.map(nft => ({ ...nft }))
const orders = new Map<string, Order>()
export type MockScenario =
  | 'success'
  | 'offline'
  | 'server-error'
  | 'slow'
  | 'variable-latency'
  | 'payment-declined'
  | 'payment-pending'
  | 'order-timeout'
type OneShotFailure = { path: string; status?: number; networkError?: boolean }
const mockState: {
  scenario: MockScenario
  latencyMs: number
  now: string | null
  oneShotFailures: OneShotFailure[]
  autoConfirmPendingOrders: boolean
} = {
  scenario: (import.meta.env.VITE_MOCK_SCENARIO as MockScenario | undefined) ?? 'success',
  latencyMs: 0,
  now: null,
  oneShotFailures: [],
  autoConfirmPendingOrders: true
}
const realtime = ws.link('/realtime/socket.io')
type MockSocket = {
  on: (
    event: string,
    listener: (event: MessageEvent, ...data: unknown[]) => void
  ) => void
  emit: (event: string, ...data: unknown[]) => void
}
const socketUsers = new Map<MockSocket, string>()
const resourceVersions = new Map<string, number>()
const nextVersion = (resource: string) =>
  (resourceVersions.get(resource) ?? 0) + 1
function emitToUser(
  userId: string | null,
  event: 'nft.updated' | 'order.updated',
  payload: object
) {
  socketUsers.forEach((owner, socket) => {
    if (userId === null || owner === userId) socket.emit(event, payload)
  })
}
const mockNow = () => (mockState.now ? new Date(mockState.now) : new Date())
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const DEMO_USER: User = {
  id: 'user-demo',
  name: 'Demo Kurio',
  email: 'demo@kurio.test',
  passwordHash: hashPassword('kurio-demo')
}
const sessions = new Map<string, { userId: string; expiresAt: string }>()
const favorites = new Map<string, Set<string>>()
const profiles = new Map<string, Profile>()
const wallets = new Map<string, Wallet[]>()

function hashPassword(password: string) {
  let hash = 2166136261
  for (let index = 0; index < password.length; index += 1)
    hash = Math.imul(hash ^ password.charCodeAt(index), 16777619)
  return `mock-hash-${(hash >>> 0).toString(16)}`
}

function readUsers(): User[] {
  try {
    const stored = JSON.parse(
      localStorage.getItem(USERS_STORAGE_KEY) ?? 'null'
    ) as StoredUser[] | null
    return stored?.length ? stored : [DEMO_USER]
  } catch {
    return [DEMO_USER]
  }
}

function writeUsers(users: User[]) {
  const safeUsers: StoredUser[] = users.map(
    ({ id, name, email, passwordHash }) => ({ id, name, email, passwordHash })
  )
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(safeUsers))
}
function loadSessions() {
  if (sessions.size) return
  try {
    const saved = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) ?? '{}') as Record<string, { userId: string; expiresAt: string }>
    Object.entries(saved).forEach(([token, session]) => sessions.set(token, session))
  } catch { /* use empty session store */ }
}
function persistSessions() {
  const records: Record<string, { userId: string; expiresAt: string }> = {}
  sessions.forEach((session, token) => { records[token] = session })
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(records))
}

function readAccountRecords<T>(storageKey: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Record<
      string,
      T
    >
  } catch {
    return {}
  }
}

function writeAccountRecords<T>(
  storageKey: string,
  records: Record<string, T>
) {
  localStorage.setItem(storageKey, JSON.stringify(records))
}

function catalog() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CATALOG_STORAGE_KEY) ?? 'null'
    ) as typeof mockCatalog | null
    if (saved?.length) mockCatalog = saved
  } catch {
    /* use deterministic fixtures */
  }
  return mockCatalog
}
function persistCatalog() {
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(mockCatalog))
}
function ordersFor(userId: string) {
  if (!orders.size) {
    const saved = readAccountRecords<Order[]>(ORDERS_STORAGE_KEY)
    Object.values(saved)
      .flat()
      .forEach(order => orders.set(order.id, order))
  }
  resolveDueOrders()
  return [...orders.values()].filter(order => order.userId === userId)
}
function persistOrders() {
  const grouped: Record<string, Order[]> = {}
  orders.forEach(order => {
    ;(grouped[order.userId] ??= []).push(order)
  })
  writeAccountRecords(ORDERS_STORAGE_KEY, grouped)
}
function resolveDueOrders() {
  let changed = false
  orders.forEach(order => {
    if (order.status !== 'pending' || !order.resolveAt || new Date(order.resolveAt) > mockNow()) return
    order.status = 'confirmed'
    order.version += 1
    order.transactionReference = `0x${crypto.randomUUID().replaceAll('-', '')}`
    order.receipt.items.forEach(line => {
      const nft = catalog().find(candidate => candidate.id === line.id)
      if (nft) nft.availability = Math.max(0, nft.availability - line.quantity)
    })
    emitMockOrderUpdate({ orderId: order.id, userId: order.userId, status: order.status, version: order.version, transactionReference: order.transactionReference })
    changed = true
  })
  if (changed) { persistOrders(); persistCatalog() }
}

/** Test/demo control surface. It only changes the network-owned mock database. */
export function resetMockScenario() {
  ;[
    USERS_STORAGE_KEY,
    FAVORITES_STORAGE_KEY,
    PROFILES_STORAGE_KEY,
    WALLETS_STORAGE_KEY,
    ORDERS_STORAGE_KEY,
    CARTS_STORAGE_KEY,
    CATALOG_STORAGE_KEY,
    SESSIONS_STORAGE_KEY
  ].forEach(key => localStorage.removeItem(key))
  sessions.clear()
  favorites.clear()
  profiles.clear()
  wallets.clear()
  orders.clear()
  socketUsers.clear()
  resourceVersions.clear()
  mockCatalog = initialCatalog.map(nft => ({ ...nft }))
  mockState.scenario = 'success'
  mockState.latencyMs = 0
  mockState.now = null
  mockState.oneShotFailures = []
  mockState.autoConfirmPendingOrders = true
}
export function configureMockScenario(config: Partial<{
  scenario: MockScenario
  latencyMs: number
  now: string | null
  autoConfirmPendingOrders: boolean
}>) {
  Object.assign(mockState, config)
}
export function failNextMockRequest(failure: OneShotFailure) {
  mockState.oneShotFailures.push(failure)
}
export function updateMockNft(
  id: string,
  update: { priceEth?: string; availability?: number }
) {
  const nft = catalog().find(item => item.id === id)
  if (!nft) return null
  Object.assign(nft, update)
  persistCatalog()
  const version = nextVersion(`nft:${nft.id}`)
  resourceVersions.set(`nft:${nft.id}`, version)
  const payload = {
    nftId: nft.id,
    priceEth: nft.priceEth,
    availability: nft.availability,
    version,
    userId: null
  }
  emitToUser(null, 'nft.updated', payload)
  return payload
}
export function emitMockNftUpdate(payload: {
  nftId: string
  priceEth: string
  availability: number
  version: number
}) {
  resourceVersions.set(`nft:${payload.nftId}`, payload.version)
  emitToUser(null, 'nft.updated', { ...payload, userId: null })
}
export function emitMockOrderUpdate(payload: {
  orderId: string
  userId: string
  status: Order['status']
  version: number
  reason?: string
  transactionReference?: string
}) {
  emitToUser(payload.userId, 'order.updated', payload)
}
export function confirmMockOrder(orderId: string) {
  const order = orders.get(orderId)
  if (!order || order.status !== 'pending') return null
  order.status = 'confirmed'
  order.version += 1
  order.transactionReference = `0x${crypto.randomUUID().replaceAll('-', '')}`
  persistOrders()
  emitMockOrderUpdate({
    orderId: order.id,
    userId: order.userId,
    status: order.status,
    version: order.version,
    transactionReference: order.transactionReference
  })
  return order
}

function favoritesFor(userId: string) {
  const inMemory = favorites.get(userId)
  if (inMemory) return inMemory
  try {
    const saved = JSON.parse(
      localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '{}'
    ) as Record<string, string[]>
    const restored = new Set(saved[userId] ?? [])
    favorites.set(userId, restored)
    return restored
  } catch {
    const empty = new Set<string>()
    favorites.set(userId, empty)
    return empty
  }
}

function persistFavorites(userId: string) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '{}'
    ) as Record<string, string[]>
    saved[userId] = [...favoritesFor(userId)]
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(saved))
  } catch {
    // Favoritos continuam disponíveis na sessão atual caso o armazenamento falhe.
  }
}

function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email }
}
function sessionResponse(token: string, user: User) {
  return {
    session: {
      token,
      user: publicUser(user),
      expiresAt: sessions.get(token)?.expiresAt
    }
  }
}
function bearer(request: Request) {
  return request.headers.get('Authorization')?.replace('Bearer ', '')
}
function requireSession(request: Request) {
  loadSessions()
  const token = bearer(request)
  const session = token ? sessions.get(token) : undefined
  if (!session || new Date(session.expiresAt) <= mockNow()) return undefined
  const user = readUsers().find(candidate => candidate.id === session.userId)
  return user ? { token, session, user } : undefined
}
function activeUser(request: Request) {
  return requireSession(request)?.user
}
function profileFor(user: User): Profile {
  const existing = profiles.get(user.id)
  if (existing) return existing
  const saved = readAccountRecords<Profile>(PROFILES_STORAGE_KEY)[user.id]
  if (saved) {
    profiles.set(user.id, saved)
    return saved
  }
  const profile = {
    displayName: user.name,
    username: user.email.split('@')[0],
    email: user.email,
    ens: '',
    walletAlias: 'Carteira principal'
  }
  profiles.set(user.id, profile)
  return profile
}

function persistProfile(userId: string, profile: Profile) {
  const records = readAccountRecords<Profile>(PROFILES_STORAGE_KEY)
  records[userId] = profile
  writeAccountRecords(PROFILES_STORAGE_KEY, records)
}

function walletsFor(userId: string) {
  const existing = wallets.get(userId)
  if (existing) return existing
  const records = readAccountRecords<Wallet[]>(WALLETS_STORAGE_KEY)
  const saved = records[userId] ?? (userId === DEMO_USER.id ? [{
    id: 'primary', displayName: 'Carteira principal', alias: 'Principal', network: 'Ethereum',
    profileName: 'Demo Kurio', address: '0x8aC4bE7d912a0000', type: 'MetaMask', referralCode: '', email: DEMO_USER.email, ens: 'demo'
  }] : [])
  wallets.set(userId, saved)
  if (!records[userId] && saved.length) persistWallets(userId, saved)
  return saved
}

function persistWallets(userId: string, list: Wallet[]) {
  const records = readAccountRecords<Wallet[]>(WALLETS_STORAGE_KEY)
  records[userId] = list
  writeAccountRecords(WALLETS_STORAGE_KEY, records)
}

function cartScope(request: Request) {
  const user = activeUser(request)
  return user ? `user:${user.id}` : `visitor:${request.headers.get('X-Cart-Id') ?? 'anonymous'}`
}
function cartRecords() { return readAccountRecords<MockCart>(CARTS_STORAGE_KEY) }
function initialCart(): MockCart {
  return {
    coupon: null,
    revision: 1,
    items: [
      { lineId: 'emerald-ape-042:1/10', id: 'emerald-ape-042', editionId: '1/10', editionLabel: '1/10', quantity: 2, stock: 2 },
      { lineId: 'violet-nomad-314:1/50', id: 'violet-nomad-314', editionId: '1/50', editionLabel: '1/50', quantity: 6, stock: 6 },
      { lineId: 'ivory-baron-088:ABERTA', id: 'ivory-baron-088', editionId: 'ABERTA', editionLabel: 'ABERTA', quantity: 9, stock: 9 }
    ]
  }
}
function readCart(scope: string) {
  const records = cartRecords()
  const cart = records[scope] ?? initialCart()
  records[scope] = cart
  writeAccountRecords(CARTS_STORAGE_KEY, records)
  return cart
}
function writeCart(scope: string, cart: MockCart) {
  const records = cartRecords()
  records[scope] = { ...cart, revision: cart.revision + 1 }
  writeAccountRecords(CARTS_STORAGE_KEY, records)
  return records[scope]
}
function cartResponse(cart: MockCart) {
  return {
    items: cart.items.flatMap(line => {
      const nft = catalog().find(candidate => candidate.id === line.id)
      return nft ? [{ ...line, image: nft.image, name: nft.name, tokenId: nft.tokenId, priceEth: nft.priceEth }] : []
    }),
    coupon: cart.coupon,
    revision: cart.revision
  }
}

export const handlers = [
  realtime.addEventListener('connection', connection => {
    const io = toSocketIo(connection) as unknown as { client: MockSocket }
    io.client.on('session.identify', (_event, body) => {
      const token = (body as { token?: string } | undefined)?.token
      const session = token ? sessions.get(token) : undefined
      if (session) socketUsers.set(io.client, session.userId)
    })
    io.client.on('disconnect', () => socketUsers.delete(io.client))
  }),
  http.all('/api/*', async ({ request }) => {
    const path = new URL(request.url).pathname
    const failure = mockState.oneShotFailures.findIndex(item => item.path === path)
    if (failure >= 0) {
      const [next] = mockState.oneShotFailures.splice(failure, 1)
      if (next.networkError) return HttpResponse.error()
      return HttpResponse.json({ message: 'Falha temporária simulada.' }, { status: next.status ?? 503 })
    }
    if (mockState.scenario === 'offline') return HttpResponse.error()
    if (mockState.scenario === 'server-error')
      return HttpResponse.json(
        { message: 'Indisponibilidade temporária simulada.' },
        { status: 503 }
      )
    const latency = mockState.latencyMs ||
      (mockState.scenario === 'slow' ? 1_500 : mockState.scenario === 'variable-latency' ? 300 : 0)
    if (latency) await delay(latency)
  }),
  http.get('/api/favorites', ({ request }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    const nfts = [...favoritesFor(user.id)].flatMap(id => {
      const nft = getNftDetailFixture(id)
      return nft ? [{ ...nft, isFavorite: true }] : []
    })
    return HttpResponse.json({ nfts })
  }),
  http.get('/api/profile', ({ request }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    return HttpResponse.json({ profile: profileFor(user) })
  }),
  http.get('/api/cart', ({ request }) => HttpResponse.json(cartResponse(readCart(cartScope(request))))),
  http.post('/api/cart/items', async ({ request }) => {
    const scope = cartScope(request)
    const cart = readCart(scope)
    const body = (await request.json()) as { id?: string; nftId?: string; editionId?: string; quantity?: number }
    const id = body.id ?? body.nftId ?? ''
    const editionId = body.editionId ?? 'ABERTA'
    const quantity = body.quantity
    const nft = catalog().find(candidate => candidate.id === id)
    if (!nft || !Number.isInteger(quantity) || (quantity ?? 0) < 1)
      return HttpResponse.json({ message: 'NFT ou quantidade inválida.' }, { status: 400 })
    const lineId = `${id}:${editionId}`
    const existing = cart.items.find(item => item.lineId === lineId)
    if (existing) existing.quantity = Math.min(existing.stock, existing.quantity + quantity!)
    else cart.items.push({ lineId, id, editionId, editionLabel: editionId, quantity: Math.min(quantity!, nft.availability), stock: nft.availability })
    return HttpResponse.json(cartResponse(writeCart(scope, cart)), { status: 201 })
  }),
  http.patch('/api/cart/items/:lineId', async ({ request, params }) => {
    const scope = cartScope(request)
    const cart = readCart(scope)
    const body = (await request.json()) as { quantity?: number }
    const quantity = body.quantity
    const line = cart.items.find(item => item.lineId === String(params.lineId))
    if (!line || !Number.isInteger(quantity) || (quantity ?? 0) < 1 || (quantity ?? 0) > line.stock)
      return HttpResponse.json({ message: 'Quantidade indisponível.' }, { status: 409 })
    line.quantity = quantity!
    return HttpResponse.json(cartResponse(writeCart(scope, cart)))
  }),
  http.delete('/api/cart/items/:lineId', ({ request, params }) => {
    const scope = cartScope(request)
    const cart = readCart(scope)
    cart.items = cart.items.filter(item => item.lineId !== String(params.lineId))
    return HttpResponse.json(cartResponse(writeCart(scope, cart)))
  }),
  http.put('/api/cart/coupon', async ({ request }) => {
    const code = String(((await request.json()) as { code?: string }).code ?? '').trim().toUpperCase()
    if (code === 'KURIO2024') return HttpResponse.json({ message: 'Este cupom expirou.' }, { status: 410 })
    if (code !== 'KURIO10') return HttpResponse.json({ message: 'Código promocional inválido.' }, { status: 422 })
    const scope = cartScope(request)
    const cart = readCart(scope)
    cart.coupon = code
    return HttpResponse.json(cartResponse(writeCart(scope, cart)))
  }),
  http.delete('/api/cart/coupon', ({ request }) => {
    const scope = cartScope(request)
    const cart = readCart(scope)
    cart.coupon = null
    return HttpResponse.json(cartResponse(writeCart(scope, cart)))
  }),
  http.post('/api/cart/merge', async ({ request }) => {
    const user = activeUser(request)
    if (!user) return HttpResponse.json({ message: 'Autenticação necessária.' }, { status: 401 })
    const body = (await request.json()) as { visitorId?: string }
    const visitorScope = `visitor:${body.visitorId ?? ''}`
    const userScope = `user:${user.id}`
    const visitor = readCart(visitorScope)
    const target = readCart(userScope)
    const adjustments: string[] = []
    visitor.items.forEach(incoming => {
      const existing = target.items.find(item => item.id === incoming.id && item.editionId === incoming.editionId)
      if (existing) {
        const previous = existing.quantity
        existing.quantity = Math.min(existing.stock, existing.quantity + incoming.quantity)
        if (existing.quantity < previous + incoming.quantity) adjustments.push(`${incoming.id}:${incoming.editionId}`)
      } else target.items.push({ ...incoming, quantity: Math.min(incoming.quantity, incoming.stock) })
    })
    const records = cartRecords()
    records[userScope] = { ...target, revision: target.revision + 1 }
    delete records[visitorScope]
    writeAccountRecords(CARTS_STORAGE_KEY, records)
    return HttpResponse.json({ ...cartResponse(records[userScope]), adjustments })
  }),
  http.put('/api/profile', async ({ request }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    const body = (await request.json()) as Profile
    if (
      !body.displayName?.trim() ||
      !body.username?.trim() ||
      !body.email?.includes('@') ||
      !body.walletAlias?.trim()
    )
      return HttpResponse.json(
        {
          message: 'Revise os campos obrigatórios.',
          fieldErrors: { form: 'Revise os campos obrigatórios.' }
        },
        { status: 400 }
      )
    const users = readUsers()
    const index = users.findIndex(candidate => candidate.id === user.id)
    users[index] = {
      ...user,
      name: body.displayName.trim(),
      email: body.email.trim().toLowerCase()
    }
    writeUsers(users)
    const profile = {
      ...body,
      displayName: body.displayName.trim(),
      email: body.email.trim().toLowerCase()
    }
    profiles.set(user.id, profile)
    persistProfile(user.id, profile)
    return HttpResponse.json({ profile, user: publicUser(users[index]) })
  }),
  http.put('/api/profile/password', async ({ request }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    const body = (await request.json()) as {
      currentPassword?: string
      password?: string
      confirmPassword?: string
    }
    if (user.passwordHash !== hashPassword(body.currentPassword ?? ''))
      return HttpResponse.json(
        { message: 'A senha atual está incorreta.' },
        { status: 400 }
      )
    if (
      !body.password ||
      body.password.length < 8 ||
      body.password !== body.confirmPassword
    )
      return HttpResponse.json(
        { message: 'Revise a nova senha.' },
        { status: 400 }
      )
    const users = readUsers()
    const index = users.findIndex(candidate => candidate.id === user.id)
    users[index] = { ...user, passwordHash: hashPassword(body.password) }
    writeUsers(users)
    return HttpResponse.json({ ok: true })
  }),
  http.get('/api/wallets', ({ request }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    return HttpResponse.json({ wallets: walletsFor(user.id) })
  }),
  http.put('/api/wallets/:id', async ({ request, params }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    const wallet = {
      ...((await request.json()) as Wallet),
      id: String(params.id)
    }
    if (!wallet.address?.match(/^0x[a-fA-F0-9]{8,}$/))
      return HttpResponse.json(
        { message: 'Use um endereço 0x válido.' },
        { status: 400 }
      )
    const list = walletsFor(user.id)
    if (wallet.id === 'secondary' && list.some(item => item.id === 'primary' && item.address === wallet.address))
      return HttpResponse.json({ message: 'A carteira secundária precisa ter um endereço diferente.' }, { status: 409 })
    const index = list.findIndex(item => item.id === wallet.id)
    if (index >= 0) list[index] = wallet
    else list.push(wallet)
    wallets.set(user.id, list)
    persistWallets(user.id, list)
    return HttpResponse.json({ wallet })
  }),
  http.get('/api/nfts', ({ request }) => {
    const params = new URL(request.url).searchParams
    const minPrice = Number(params.get('minPrice'))
    const maxPrice = Number(params.get('maxPrice'))
    const sort = params.get('sort')
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const pageSize = Math.max(1, Number(params.get('pageSize') ?? 1000))
    const query = {
      search: params.get('search') ?? '',
      category: params.get('category') as CatalogCategory | null,
      network: params.get('network') as CatalogNetwork | null,
      minPrice: Number.isFinite(minPrice) ? minPrice : 0.02,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : 12.3,
      sort: (sort === 'price-asc' || sort === 'price-desc'
        ? sort
        : 'recent') as CatalogSort
    }
    const filtered = filterCatalog(catalog(), query)
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    return HttpResponse.json({ items: filtered.slice((page - 1) * pageSize, page * pageSize), totalItems: filtered.length, totalPages, page, pageSize })
  }),
  http.get('/api/nfts/:id', ({ request, params }) => {
    const nft = getNftDetailFixture(String(params.id))
    if (!nft)
      return HttpResponse.json(
        { message: 'NFT não encontrado.' },
        { status: 404 }
      )
    const token = bearer(request)
    const session = token ? sessions.get(token) : undefined
    const isFavorite = session
      ? favoritesFor(session.userId).has(nft.id)
      : undefined
    const live = catalog().find(candidate => candidate.id === nft.id)
    return HttpResponse.json({
      nft: {
        ...nft,
        priceEth: live?.priceEth ?? nft.priceEth,
        availability: live?.availability ?? nft.availability,
        isFavorite
      }
    })
  }),
  http.post('/api/cart/coupons', async ({ request }) => {
    const code = String(
      ((await request.json()) as { code?: string }).code ?? ''
    )
      .trim()
      .toUpperCase()
    if (code === 'KURIO2024')
      return HttpResponse.json(
        { message: 'Este cupom expirou.' },
        { status: 410 }
      )
    if (code !== 'KURIO10')
      return HttpResponse.json(
        { message: 'Código promocional inválido.' },
        { status: 422 }
      )
    return HttpResponse.json({ coupon: { code } })
  }),
  http.post('/api/cart/quote', async ({ request }) => {
    const body = (await request.json()) as {
      coupon?: string | null
      items?: Array<{ id: string; editionId: string; quantity: number }>
    }
    const coupon = body.coupon?.trim().toUpperCase() ?? null
    if (coupon && coupon !== 'KURIO10')
      return HttpResponse.json(
        { message: 'Código promocional inválido ou expirado.' },
        { status: 422 }
      )
    const quotedItems = (body.items ?? []).flatMap(line => {
      const nft = catalog().find(candidate => candidate.id === line.id)
      if (!nft) return []
      return [
        {
          id: line.id,
          editionId: line.editionId,
          availability: nft.availability,
          priceEth: nft.priceEth,
          quantity: Math.max(
            0,
            Math.min(Math.trunc(line.quantity), nft.availability)
          )
        }
      ]
    })
    const subtotal = quotedItems.reduce(
      (sum, item) => sum.plus(new Decimal(item.priceEth).mul(item.quantity)),
      new Decimal(0)
    )
    const discount =
      coupon === 'KURIO10' ? subtotal.mul('0.10') : new Decimal(0)
    const networkFee = subtotal.isZero() ? new Decimal(0) : new Decimal('0.016')
    return HttpResponse.json({
      coupon: coupon
        ? { code: coupon, discountEth: discount.toFixed(18) }
        : null,
      items: quotedItems.map(
        ({ id, editionId, availability, priceEth, quantity }) => ({
          id,
          editionId,
          availability,
          priceEth,
          quantity
        })
      ),
      totals: {
        subtotalEth: subtotal.toFixed(18),
        discountEth: discount.toFixed(18),
        networkFeeEth: networkFee.toFixed(18),
        totalEth: subtotal.minus(discount).plus(networkFee).toFixed(18)
      }
    })
  }),
  http.post('/api/favorites/:nftId', ({ request, params }) => {
    const token = bearer(request)
    const session = token ? sessions.get(token) : undefined
    if (!session)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    const nftId = String(params.nftId)
    const userFavorites = favoritesFor(session.userId)
    userFavorites.add(nftId)
    favorites.set(session.userId, userFavorites)
    persistFavorites(session.userId)
    return HttpResponse.json({ isFavorite: true })
  }),
  http.delete('/api/favorites/:nftId', ({ request, params }) => {
    const token = bearer(request)
    const session = token ? sessions.get(token) : undefined
    if (!session)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    favoritesFor(session.userId).delete(String(params.nftId))
    persistFavorites(session.userId)
    return HttpResponse.json({ isFavorite: false })
  }),
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
    }
    const users = readUsers()
    const email = body.email?.trim().toLowerCase() ?? ''
    if (!body.name || !email || !body.password)
      return HttpResponse.json(
        {
          message: 'Revise os campos informados.',
          fieldErrors: { form: 'Revise os campos informados.' }
        },
        { status: 400 }
      )
    if (users.some(user => user.email === email))
      return HttpResponse.json(
        {
          message: 'Este e-mail já está cadastrado.',
          fieldErrors: { email: 'Este e-mail já está cadastrado.' }
        },
        { status: 409 }
      )
    const user: User = {
      id: `user-${crypto.randomUUID()}`,
      name: body.name.trim(),
      email,
      passwordHash: hashPassword(body.password)
    }
    users.push(user)
    writeUsers(users)
    const token = `mock-token-${user.id}`
    sessions.set(token, {
      userId: user.id,
      expiresAt: new Date(mockNow().getTime() + 86_400_000).toISOString()
    })
    persistSessions()
    return HttpResponse.json(sessionResponse(token, user), { status: 201 })
  }),
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }
    const user = readUsers().find(
      candidate =>
        candidate.email === body.email?.trim().toLowerCase() &&
        candidate.passwordHash === hashPassword(body.password ?? '')
    )
    if (!user)
      return HttpResponse.json(
        { message: 'E-mail ou senha inválidos.' },
        { status: 401 }
      )
    const token = `mock-token-${user.id}`
    sessions.set(token, {
      userId: user.id,
      expiresAt: new Date(mockNow().getTime() + 86_400_000).toISOString()
    })
    persistSessions()
    return HttpResponse.json(sessionResponse(token, user))
  }),
  http.get('/api/auth/session', ({ request }) => {
    loadSessions()
    const token = bearer(request)
    const userId = token?.replace('mock-token-', '')
    const user = userId
      ? readUsers().find(candidate => candidate.id === userId)
      : undefined
    const active = token ? sessions.get(token) : undefined
    if (
      !token ||
      !user ||
      (active && new Date(active.expiresAt) <= mockNow()) ||
      new URL(request.url).searchParams.get('expired') === '1'
    )
      return HttpResponse.json({ message: 'Sessão expirada.' }, { status: 401 })
    if (!active) return HttpResponse.json({ message: 'Sessão expirada.' }, { status: 401 })
    return HttpResponse.json(sessionResponse(token, user))
  }),
  http.post('/api/auth/logout', ({ request }) => {
    loadSessions()
    const token = bearer(request)
    if (token) { sessions.delete(token); persistSessions() }
    return new HttpResponse(null, { status: 204 })
  }),
  http.get('/api/orders', ({ request }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    return HttpResponse.json({
      orders: ordersFor(user.id).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )
    })
  }),
  http.get('/api/orders/:id', ({ request, params }) => {
    const user = activeUser(request)
    if (user) ordersFor(user.id)
    const order = orders.get(String(params.id))
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    if (!order || order.userId !== user.id)
      return HttpResponse.json(
        { message: 'Pedido não encontrado.' },
        { status: 404 }
      )
    return HttpResponse.json({ order })
  }),
  http.post('/api/orders', async ({ request }) => {
    const user = activeUser(request)
    if (!user)
      return HttpResponse.json(
        { message: 'Autenticação necessária.' },
        { status: 401 }
      )
    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey)
      return HttpResponse.json(
        { message: 'A chave de idempotência é obrigatória.' },
        { status: 400 }
      )
    const body = (await request.json()) as {
      items?: Array<{ id: string; editionId: string; quantity: number }>
      coupon?: string | null
      quote?: CartQuote
      checkout?: {
        displayName?: string
        network?: string
        walletAddress?: string
        walletType?: string
        email?: string
      }
    }
    if (
      body.checkout &&
      (!body.checkout.displayName?.trim() ||
        !body.checkout.network ||
        !body.checkout.walletType ||
        !body.checkout.walletAddress?.match(/^0x[a-fA-F0-9]{8,}$/) ||
        !body.checkout.email?.includes('@'))
    )
      return HttpResponse.json(
        { message: 'Revise os dados do colecionador e da carteira.' },
        { status: 400 }
      )
    const normalizedItems = [...(body.items ?? [])]
      .map(line => ({ id: line.id, editionId: line.editionId, quantity: line.quantity }))
      .sort((a, b) => `${a.id}:${a.editionId}`.localeCompare(`${b.id}:${b.editionId}`))
    const fingerprint = JSON.stringify({
      items: normalizedItems,
      coupon: body.coupon?.trim().toUpperCase() ?? null,
      checkout: body.checkout,
      quote: body.quote
    })
    const previous = ordersFor(user.id).find(
      order => order.idempotencyKey === idempotencyKey
    )
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        return HttpResponse.json(
          {
            message: 'Chave de idempotência reutilizada com conteúdo diferente.'
          },
          { status: 409 }
        )
      return HttpResponse.json({ order: previous })
    }
    const liveItems = (body.items ?? []).map(line => ({
      ...line,
      nft: catalog().find(nft => nft.id === line.id)
    }))
    if (
      liveItems.some(
        line =>
          !line.nft ||
          !line.editionId ||
          !Number.isInteger(line.quantity) ||
          line.quantity < 1 ||
          line.quantity > line.nft.availability
      )
    )
      return HttpResponse.json(
        { message: 'Uma edição ficou indisponível. Atualize a cotação.' },
        { status: 409 }
      )
    const subtotal = liveItems.reduce(
      (sum, line) =>
        sum.plus(new Decimal(line.nft!.priceEth).mul(line.quantity)),
      new Decimal(0)
    )
    const discount =
      body.coupon?.toUpperCase() === 'KURIO10'
        ? subtotal.mul('0.10')
        : new Decimal(0)
    if (body.coupon && body.coupon.trim().toUpperCase() !== 'KURIO10')
      return HttpResponse.json({ message: 'Código promocional inválido ou expirado.' }, { status: 422 })
    const networkFee = subtotal.isZero() ? new Decimal(0) : new Decimal('0.016')
    const total = subtotal
      .minus(discount)
      .plus(networkFee)
      .toFixed(18)
    const canonicalQuote: CartQuote = {
      items: liveItems.map(line => ({ id: line.id, editionId: line.editionId, quantity: line.quantity, priceEth: line.nft!.priceEth, availability: line.nft!.availability })),
      coupon: discount.isZero() ? null : { code: body.coupon!.trim().toUpperCase(), discountEth: discount.toFixed(18) },
      totals: { subtotalEth: subtotal.toFixed(18), discountEth: discount.toFixed(18), networkFeeEth: networkFee.toFixed(18), totalEth: total }
    }
    if (!body.quote || body.quote.totals.totalEth !== total)
      return HttpResponse.json(
        {
          message:
            'O preço ou a taxa mudou. Atualize a cotação antes de confirmar.'
        },
        { status: 409 }
      )
    const status: Order['status'] =
      mockState.scenario === 'payment-declined'
        ? 'declined'
        : mockState.scenario === 'payment-pending' || mockState.scenario === 'order-timeout'
          ? 'pending'
          : 'confirmed'
    const order: Order = {
      id: `ord-${crypto.randomUUID()}`,
      userId: user.id,
      status,
      version: 1,
      receipt: canonicalQuote,
      createdAt: mockNow().toISOString(),
      reason:
        status === 'declined'
          ? 'Pagamento recusado pela carteira simulada.'
          : undefined,
      transactionReference:
        status === 'confirmed'
          ? `0x${crypto.randomUUID().replaceAll('-', '')}`
          : undefined,
      idempotencyKey,
      fingerprint,
      resolveAt:
        status === 'pending' && mockState.autoConfirmPendingOrders
          ? new Date(mockNow().getTime() + 800).toISOString()
          : undefined
    }
    orders.set(order.id, order)
    persistOrders()
    if (status === 'confirmed')
      liveItems.forEach(line => {
        line.nft!.availability -= line.quantity
      })
    persistCatalog()
    emitToUser(user.id, 'order.updated', {
      orderId: order.id,
      userId: user.id,
      status: order.status,
      version: order.version,
      reason: order.reason,
      transactionReference: order.transactionReference
    })
    if (status === 'confirmed')
      liveItems.forEach(line => {
        const version = nextVersion(`nft:${line.nft!.id}`)
        resourceVersions.set(`nft:${line.nft!.id}`, version)
        emitToUser(null, 'nft.updated', {
          nftId: line.nft!.id,
          userId: null,
          priceEth: line.nft!.priceEth,
          availability: line.nft!.availability,
          version
        })
      })
    if (status === 'pending' && mockState.autoConfirmPendingOrders)
      setTimeout(() => {
        const active = orders.get(order.id)
        if (!active || active.status !== 'pending') return
        active.status = 'confirmed'
        active.version += 1
        active.transactionReference = `0x${crypto.randomUUID().replaceAll('-', '')}`
        persistOrders()
        liveItems.forEach(line => {
          line.nft!.availability -= line.quantity
        })
        persistCatalog()
        emitToUser(user.id, 'order.updated', {
          orderId: active.id,
          userId: user.id,
          status: active.status,
          version: active.version,
          transactionReference: active.transactionReference
        })
        liveItems.forEach(line => {
          const version = nextVersion(`nft:${line.nft!.id}`)
          resourceVersions.set(`nft:${line.nft!.id}`, version)
          emitToUser(null, 'nft.updated', {
            nftId: line.nft!.id,
            userId: null,
            priceEth: line.nft!.priceEth,
            availability: line.nft!.availability,
            version
          })
        })
      }, 800)
    if (mockState.scenario === 'order-timeout') return HttpResponse.error()
    return HttpResponse.json({ order }, { status: 201 })
  })
]
