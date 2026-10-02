import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { UiStore } from '@/@types/ui'

const initialState = {
  isCartDrawerOpen: false,
  postLoginRedirect: null,
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      ...initialState,
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      resetUiState: () => set(initialState),
      setPostLoginRedirect: (path) => set({ postLoginRedirect: path }),
    }),
    {
      name: 'jungle-nft-marketplace:ui',
      partialize: (state) => ({ postLoginRedirect: state.postLoginRedirect }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
