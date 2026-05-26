import { assertNonNegative, assertPercentage, assertValidNumber, roundCurrency } from './validation'

export function calculateBudgetItemTotal(quantity: number, unitPrice: number): number {
  assertValidNumber(quantity, 'quantity')
  assertValidNumber(unitPrice, 'unitPrice')
  assertNonNegative(quantity, 'quantity')
  assertNonNegative(unitPrice, 'unitPrice')

  return roundCurrency(quantity * unitPrice)
}

export function calculateBudgetTotal(items: { quantity: number; unitPrice: number }[]): number {
  if (!Array.isArray(items)) {
    throw new Error('items must be an array')
  }

  const total = items.reduce((sum, item) => {
    const itemTotal = calculateBudgetItemTotal(item.quantity, item.unitPrice)
    return sum + itemTotal
  }, 0)

  return roundCurrency(total)
}

export function calculateTaxAmount(subtotal: number, taxPercentage: number): number {
  assertValidNumber(subtotal, 'subtotal')
  assertPercentage(taxPercentage, 'taxPercentage')

  return roundCurrency(subtotal * (taxPercentage / 100))
}

export function calculateBudgetGrandTotal(subtotal: number, taxPercentage: number): number {
  const taxAmount = calculateTaxAmount(subtotal, taxPercentage)
  return roundCurrency(subtotal + taxAmount)
}
