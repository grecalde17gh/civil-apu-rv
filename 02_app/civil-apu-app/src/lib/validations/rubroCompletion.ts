type DecimalLike = { toString(): string } | number | string | null | undefined

export const incompleteRubroMessage =
  'El rubro debe tener al menos un componente con costo mayor a cero antes de guardarse o usarse en un presupuesto.'

function decimalToNumber(value: DecimalLike): number {
  if (value === null || value === undefined) return 0
  const parsed = Number(value.toString())
  return Number.isFinite(parsed) ? parsed : 0
}

export function hasUsableDirectCost(value: DecimalLike): boolean {
  return decimalToNumber(value) > 0
}

export function isUsableRubroForBudget(rubro: { directCost: DecimalLike }): boolean {
  return hasUsableDirectCost(rubro.directCost)
}

export function requiresUsableRubroState(input: {
  status?: string
  calculationStatus?: string
}): boolean {
  return input.status === 'VALIDATED' || input.calculationStatus === 'CALCULATED'
}

export function assertRubroCanUseState(input: {
  status?: string
  calculationStatus?: string
  directCost: DecimalLike
}) {
  if (requiresUsableRubroState(input) && !hasUsableDirectCost(input.directCost)) {
    throw new Error(incompleteRubroMessage)
  }
}
