export type UiState = {
  isCartDrawerOpen: boolean
  postLoginRedirect: string | null
}

export type UiActions = {
  closeCartDrawer: () => void
  openCartDrawer: () => void
  resetUiState: () => void
  setPostLoginRedirect: (path: string | null) => void
}

export type UiStore = UiState & UiActions
