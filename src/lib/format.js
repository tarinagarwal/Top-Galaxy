/**
 * Safe number formatter — handles numbers, numeric strings, null, undefined, NaN.
 * Used across the UI to render USDT amounts without crashes.
 */
export function fmt(value, decimals = 2) {
  if (value === null || value === undefined) return (0).toFixed(decimals);
  if (typeof value === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) return (0).toFixed(decimals);
    return value.toFixed(decimals);
  }
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) return (0).toFixed(decimals);
  return parsed.toFixed(decimals);
}

/**
 * Safe number coercion — returns a real number, never NaN.
 */
export function num(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    return Number.isNaN(value) || !Number.isFinite(value) ? 0 : value;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
