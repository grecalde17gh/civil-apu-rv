import { describe, it, expect } from 'vitest'
import { calculateBudgetItemTotal, calculateBudgetTotal, calculateTaxAmount, calculateBudgetGrandTotal } from '../budget'

describe('Budget calculations', () => {
  it('calculates item totals', () => {
    expect(calculateBudgetItemTotal(100, 4.09)).toBeCloseTo(409.0, 2)
    expect(calculateBudgetItemTotal(50, 6.13)).toBeCloseTo(306.5, 2)
    expect(calculateBudgetItemTotal(80, 6.32)).toBeCloseTo(505.6, 2)
    expect(calculateBudgetItemTotal(120, 11.31)).toBeCloseTo(1357.2, 2)
    expect(calculateBudgetItemTotal(500, 2.3)).toBeCloseTo(1150.0, 2)
  })

  it('calculates full budget total (case expects 3728.30)', () => {
    const items = [
      { quantity: 100, unitPrice: 4.09 },
      { quantity: 50, unitPrice: 6.13 },
      { quantity: 80, unitPrice: 6.32 },
      { quantity: 120, unitPrice: 11.31 },
      { quantity: 500, unitPrice: 2.3 },
    ]

    const total = calculateBudgetTotal(items)
    expect(total).toBeCloseTo(3728.3, 2)
  })

  it('calculates IVA and grand total', () => {
    expect(calculateTaxAmount(100, 15)).toBeCloseTo(15.0, 2)
    expect(calculateTaxAmount(1000, 15)).toBeCloseTo(150.0, 2)
    // IVA y total deben respetar redondeo a 2 decimales
    expect(calculateTaxAmount(3728.3, 15)).toBeCloseTo(559.25, 2)

    expect(calculateBudgetGrandTotal(100, 15)).toBeCloseTo(115.0, 2)
    expect(calculateBudgetGrandTotal(3728.3, 15)).toBeCloseTo(4287.55, 2)
  })

  it('throws on invalid inputs', () => {
    expect(() => calculateBudgetItemTotal(-1, 10)).toThrow()
    expect(() => calculateBudgetTotal([{ quantity: -1, unitPrice: 1 }])).toThrow()
    expect(() => calculateTaxAmount(-1, 15)).toThrow()
  })
})
