export type CatalogCodePrefix = 'MAT' | 'MO' | 'EQ' | 'TR'

export function isValidCatalogCode(code: string | null | undefined, prefix: CatalogCodePrefix): boolean {
  if (!code) return false
  return new RegExp(`^${prefix}-\\d+$`).test(code.trim())
}

export function assertValidCatalogCode(code: string | null | undefined, prefix: CatalogCodePrefix): void {
  if (!code?.trim()) return

  if (!isValidCatalogCode(code, prefix)) {
    throw new Error(`El codigo debe tener el formato ${prefix}-001`)
  }
}

function getCatalogCodeNumber(code: string, prefix: CatalogCodePrefix): number | null {
  if (!isValidCatalogCode(code, prefix)) return null

  const value = Number(code.trim().slice(prefix.length + 1))
  return Number.isInteger(value) && value >= 0 ? value : null
}

export function formatCatalogCode(prefix: CatalogCodePrefix, value: number): string {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('El numero de codigo debe ser un entero no negativo')
  }

  return `${prefix}-${String(value).padStart(3, '0')}`
}

export function generateNextCatalogCode(existingCodes: Array<string | null | undefined>, prefix: CatalogCodePrefix): string {
  const maxValue = existingCodes.reduce((max, code) => {
    if (!code) return max
    const value = getCatalogCodeNumber(code, prefix)
    return value === null ? max : Math.max(max, value)
  }, 0)

  return formatCatalogCode(prefix, maxValue + 1)
}
