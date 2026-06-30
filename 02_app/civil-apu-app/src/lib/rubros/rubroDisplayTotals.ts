import { calculateRelativeWeight, calculateVaeElement } from '../calculations/rubroComponentParticipation'

export type DecimalLike = number | string | null | undefined | { toString(): string }

export type RubroComponentSubtotal = {
  totalCost: number
  relativeWeight: number
  vaeElement: number
}

export type RubroFinalSummary = {
  directCost: number
  indirectCost: number
  unitPrice: number
  totalVaeElement: number
  totalRelativeWeight: number
}

export function toFiniteNumber(value: DecimalLike): number | null {
  if (value === null || value === undefined) return null
  const numeric = typeof value === 'number' ? value : Number(value.toString())
  return Number.isFinite(numeric) ? numeric : null
}

export function formatMoney2(value: DecimalLike): string {
  const numeric = toFiniteNumber(value)
  return numeric === null ? '-' : numeric.toFixed(2)
}

export function formatRatio5(value: DecimalLike): string {
  const numeric = toFiniteNumber(value)
  return numeric === null ? '-' : numeric.toFixed(5)
}

export function formatOptionalRatio5(value: DecimalLike): string {
  const numeric = toFiniteNumber(value)
  return numeric === null ? '-' : numeric.toFixed(5)
}

export function sumComponentSubtotal(
  rows: Array<{ totalCost: DecimalLike; vae?: DecimalLike }>,
  rubroDirectTotal: number,
): RubroComponentSubtotal {
  return rows.reduce<RubroComponentSubtotal>(
    (subtotal, row) => {
      const totalCost = toFiniteNumber(row.totalCost) ?? 0
      const relativeWeight = calculateRelativeWeight(totalCost, rubroDirectTotal)
      const vaeElement = calculateVaeElement(relativeWeight, row.vae)

      return {
        totalCost: subtotal.totalCost + totalCost,
        relativeWeight: subtotal.relativeWeight + relativeWeight,
        vaeElement: subtotal.vaeElement + vaeElement,
      }
    },
    { totalCost: 0, relativeWeight: 0, vaeElement: 0 },
  )
}

export function sumRubroFinalSummary(subtotals: RubroComponentSubtotal[], indirectCost: number, unitPrice: number): RubroFinalSummary {
  const directCost = subtotals.reduce((sum, subtotal) => sum + subtotal.totalCost, 0)

  return {
    directCost,
    indirectCost,
    unitPrice,
    totalVaeElement: subtotals.reduce((sum, subtotal) => sum + subtotal.vaeElement, 0),
    totalRelativeWeight: subtotals.reduce((sum, subtotal) => sum + subtotal.relativeWeight, 0),
  }
}
