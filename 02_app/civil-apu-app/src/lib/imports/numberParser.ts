export function parseDecimalString(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number(value)
  let s = String(value).trim()
  if (s === '') return null

  // Remove non-breaking spaces
  s = s.replace(/\u00A0/g, ' ')
  // Keep only digits, separators, minus and plus
  s = s.replace(/[^0-9,\.\-+]/g, '')

  // Heuristic: if both '.' and ',' are present, decide which is decimal
  const hasDot = s.indexOf('.') !== -1
  const hasComma = s.indexOf(',') !== -1

  if (hasDot && hasComma) {
    // If last separator is comma, treat comma as decimal
    const lastDot = s.lastIndexOf('.')
    const lastComma = s.lastIndexOf(',')
    if (lastComma > lastDot) {
      // remove dots as thousands
      s = s.replace(/\./g, '')
      s = s.replace(/,/g, '.')
    } else {
      // remove commas as thousands
      s = s.replace(/,/g, '')
    }
  } else if (hasComma) {
    // Only comma present -> treat comma as decimal
    s = s.replace(/\./g, '')
    s = s.replace(/,/g, '.')
  } else {
    // Only dots or neither -> remove thousands separators (commas already gone)
    s = s.replace(/,/g, '')
  }

  const n = Number(s)
  if (Number.isNaN(n)) return null
  return n
}

export default parseDecimalString
