/**
 * Clamps a desired purchase quantity to a valid range: never below 1 and
 * never above the available stock (`availability`). When `availability`
 * is 0, returns 0 so callers can disable the selector and action buttons.
 */
export function clampQuantity(quantity: number, availability: number): number {
  if (availability <= 0) return 0;
  if (!Number.isFinite(quantity)) return 1;
  const rounded = Math.round(quantity);
  return Math.min(Math.max(rounded, 1), availability);
}
