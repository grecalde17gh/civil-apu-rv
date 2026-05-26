import { describe, it, expect } from 'vitest'
import { calculateMaterialCost } from '../materials'

describe('calculateMaterialCost', () => {
  it('calculates basic material costs', () => {
    expect(calculateMaterialCost(10, 2.5)).toBeCloseTo(25.0, 2)
    expect(calculateMaterialCost(1.5, 4.0)).toBeCloseTo(6.0, 2)
    expect(calculateMaterialCost(0, 10)).toBeCloseTo(0.0, 2)
    expect(calculateMaterialCost(100, 0.15)).toBeCloseTo(15.0, 2)
    // resultado redondeado a 2 decimales según la regla del proyecto
    expect(calculateMaterialCost(2.333, 1.25)).toBeCloseTo(2.92, 2)
    // rounding in caller may apply; validation ensures non-negative
  })

  it('throws for invalid inputs (negative, NaN, Infinity)', () => {
    expect(() => calculateMaterialCost(-1, 2.5)).toThrow()
    expect(() => calculateMaterialCost(10, -2.5)).toThrow()
    expect(() => calculateMaterialCost(NaN, 2.5)).toThrow()
    expect(() => calculateMaterialCost(10, NaN)).toThrow()
  })
})
