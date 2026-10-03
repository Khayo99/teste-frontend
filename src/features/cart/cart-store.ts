import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartQuoteItem } from '@/features/cart/cart-api'
import type { NftUpdateEvent } from '@/lib/contracts'

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

const initialItems: CartItem[] = []

type CartStore = {
  coupon: string | null
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeCoupon: () => void
  removeItem: (id: string, editionId: string) => void
  removePurchasedQuantity: (
    id: string,
    editionId: string,
    quantity: number
  ) => void
  replaceItems: (items: CartItem[], coupon?: string | null) => void
  setCoupon: (coupon: string) => void
  syncNftUpdate: (event: NftUpdateEvent) => boolean
  syncQuote: (items: CartQuoteItem[]) => void
  updateQuantity: (id: string, editionId: string, quantity: number) => void
}

const clampQuantity = (quantity: number, stock: number) =>
  stock <= 0 ? 0 : Math.min(Math.max(Math.trunc(quantity), 1), stock)

export const useCartStore = create<CartStore>()(
  persist(
    set => ({
      items: initialItems,
      coupon: null,
      addItem: incoming =>
        set(state => {
          const existing = state.items.find(
            item =>
              item.id === incoming.id && item.editionId === incoming.editionId
          )
          if (!existing)
            return {
              items: [
                ...state.items,
                {
                  ...incoming,
                  quantity: clampQuantity(incoming.quantity, incoming.stock)
                }
              ]
            }
          return {
            items: state.items.map(item =>
              item === existing
                ? {
                    ...item,
                    quantity: clampQuantity(
                      item.quantity + incoming.quantity,
                      item.stock
                    )
                  }
                : item
            )
          }
        }),
      removeCoupon: () => set({ coupon: null }),
      removeItem: (id, editionId) =>
        set(state => ({
          items: state.items.filter(
            item => item.id !== id || item.editionId !== editionId
          )
        })),
      removePurchasedQuantity: (id, editionId, quantity) =>
        set(state => ({
          items: state.items.flatMap(item => {
            if (item.id !== id || item.editionId !== editionId) return [item]
            const remaining = item.quantity - Math.max(0, Math.trunc(quantity))
            return remaining > 0 ? [{ ...item, quantity: remaining }] : []
          })
        })),
      replaceItems: (items, coupon) => set({ items, ...(coupon !== undefined ? { coupon } : {}) }),
      setCoupon: coupon => set({ coupon }),
      syncNftUpdate: event => {
        let changed = false
        set(state => {
          const items = state.items.map(item => {
            if (item.id !== event.nftId) return item
            const quantity = clampQuantity(item.quantity, event.availability)
            if (
              item.priceEth === event.priceEth &&
              item.stock === event.availability &&
              item.quantity === quantity
            )
              return item
            changed = true
            return {
              ...item,
              priceEth: event.priceEth,
              stock: event.availability,
              quantity
            }
          })
          return changed ? { items } : state
        })
        return changed
      },
      syncQuote: quoteItems =>
        set(state => {
          let changed = false
          const items = state.items.map(item => {
            const quote = quoteItems.find(
              candidate =>
                candidate.id === item.id &&
                candidate.editionId === item.editionId
            )
            if (!quote) return item
            const quantity = clampQuantity(item.quantity, quote.availability)
            if (
              item.priceEth === quote.priceEth &&
              item.stock === quote.availability &&
              item.quantity === quantity
            )
              return item
            changed = true
            return {
              ...item,
              priceEth: quote.priceEth,
              stock: quote.availability,
              quantity
            }
          })
          return changed ? { items } : state
        }),
      updateQuantity: (id, editionId, quantity) =>
        set(state => ({
          items: state.items.map(item =>
            item.id === id && item.editionId === editionId
              ? { ...item, quantity: clampQuantity(quantity, item.stock) }
              : item
          )
        }))
    }),
    { name: 'kurio.cart.v3', version: 3 }
  )
)
