export function normalizeDecimalText(value: string): string {
  return value.trim().replace(',', '.')
}

export function decimalInputPreprocess(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }

  const normalized = normalizeDecimalText(value)
  if (normalized === '') return value
  if (!/^\d+(\.\d+)?$/.test(normalized)) return value

  return Number(normalized)
}
