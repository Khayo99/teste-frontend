import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import emeraldApe from '@/assets/cart/emerald-ape.png'
import violetNomad from '@/assets/cart/violet-nomad.png'
import ivoryBaron from '@/assets/cart/ivory-baron.png'
import type { CartQuoteItem } from '@/features/cart/cart-api'

export type CartItem = {
  editionId: string
  editionLabel: string
  id: string
  image: string
  name: string
  priceEth: string
  quantity: number
  stock: number
  tokenId: string
}

const initialItems: CartItem[] = [
  { id: 'emerald-ape-042', image: emeraldApe, name: 'Emerald Ape', tokenId: '#0042', editionId: '1/10', editionLabel: '1/10', priceEth: '1.19', quantity: 2, stock: 2 },
  { id: 'violet-nomad-314', image: violetNomad, name: 'Violet Nomad', tokenId: '#0009', editionId: '1/50', editionLabel: '1/50', priceEth: '1.39', quantity: 6, stock: 6 },
  { id: 'ivory-baron-088', image: ivoryBaron, name: 'Ivory Baron', tokenId: '#0552', editionId: 'ABERTA', editionLabel: 'ABERTA', priceEth: '1.79', quantity: 9, stock: 9 }
]

type CartStore = {
  coupon: string | null
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeCoupon: () => void
  removeItem: (id: string, editionId: string) => void
  setCoupon: (coupon: string) => void
  syncQuote: (items: CartQuoteItem[]) => void
  updateQuantity: (id: string, editionId: string, quantity: number) => void
}

const clampQuantity = (quantity: number, stock: number) => stock <= 0 ? 0 : Math.min(Math.max(Math.trunc(quantity), 1), stock)

export const useCartStore = create<CartStore>()(persist(set => ({
  items: initialItems,
  coupon: null,
  addItem: incoming => set(state => {
    const existing = state.items.find(item => item.id === incoming.id && item.editionId === incoming.editionId)
    if (!existing) return { items: [...state.items, { ...incoming, quantity: clampQuantity(incoming.quantity, incoming.stock) }] }
    return { items: state.items.map(item => item === existing ? { ...item, quantity: clampQuantity(item.quantity + incoming.quantity, item.stock) } : item) }
  }),
  removeCoupon: () => set({ coupon: null }),
  removeItem: (id, editionId) => set(state => ({ items: state.items.filter(item => item.id !== id || item.editionId !== editionId) })),
  setCoupon: coupon => set({ coupon }),
  syncQuote: quoteItems => set(state => {
    let changed = false
    const items = state.items.map(item => {
      const quote = quoteItems.find(candidate => candidate.id === item.id && candidate.editionId === item.editionId)
      if (!quote) return item
      const quantity = clampQuantity(item.quantity, quote.availability)
      if (item.priceEth === quote.priceEth && item.stock === quote.availability && item.quantity === quantity) return item
      changed = true
      return { ...item, priceEth: quote.priceEth, stock: quote.availability, quantity }
    })
    return changed ? { items } : state
  }),
  updateQuantity: (id, editionId, quantity) => set(state => ({ items: state.items.map(item => item.id === id && item.editionId === editionId ? { ...item, quantity: clampQuantity(quantity, item.stock) } : item) }))
}), { name: 'kurio.cart.v2', version: 2 }))
