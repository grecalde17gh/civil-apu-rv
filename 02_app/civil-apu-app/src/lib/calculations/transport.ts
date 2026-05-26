import { assertNonNegative, assertValidNumber, roundCurrency } from './validation'

export function calculateTransportCost(quantity: number, unitCost: number): number {
  assertValidNumber(quantity, 'quantity')
  assertValidNumber(unitCost, 'unitCost')
  assertNonNegative(quantity, 'quantity')
  assertNonNegative(unitCost, 'unitCost')

  return roundCurrency(quantity * unitCost)
}
