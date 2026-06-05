export function parseDecimalString(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  let input = String(value).trim()
  if (input === '') return null

  input = input.replace(/\u00A0/g, '').replace(/\s+/g, '')

  const sign = input.startsWith('-') || input.startsWith('+') ? input[0] : ''
  const unsigned = sign ? input.slice(1) : input
  if (unsigned === '') return null

  const plainInteger = /^\d+$/
  const plainDotDecimal = /^\d+\.\d+$/
  const plainCommaDecimal = /^\d+,\d+$/
  const latinGroupedDecimal = /^\d{1,3}(\.\d{3})+,\d+$/
  const latinGroupedInteger = /^\d{1,3}(\.\d{3})+$/
  const usGroupedDecimal = /^\d{1,3}(,\d{3})+\.\d+$/
  const usGroupedInteger = /^\d{1,3}(,\d{3})+$/

  let normalized: string | null = null

  if (plainInteger.test(unsigned) || plainDotDecimal.test(unsigned)) {
    normalized = `${sign}${unsigned}`
  } else if (plainCommaDecimal.test(unsigned)) {
    normalized = `${sign}${unsigned.replace(',', '.')}`
  } else if (latinGroupedDecimal.test(unsigned)) {
    normalized = `${sign}${unsigned.replace(/\./g, '').replace(',', '.')}`
  } else if (latinGroupedInteger.test(unsigned)) {
    normalized = `${sign}${unsigned.replace(/\./g, '')}`
  } else if (usGroupedDecimal.test(unsigned)) {
    normalized = `${sign}${unsigned.replace(/,/g, '')}`
  } else if (usGroupedInteger.test(unsigned)) {
    normalized = `${sign}${unsigned.replace(/,/g, '')}`
  }

  if (normalized === null) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export default parseDecimalString
