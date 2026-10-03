export function clampQuantity(quantity: number, availability: number): number {
  if (availability <= 0) return 0
  if (!Number.isFinite(quantity)) return 1
  const rounded = Math.round(quantity)
  return Math.min(Math.max(rounded, 1), availability)
}
