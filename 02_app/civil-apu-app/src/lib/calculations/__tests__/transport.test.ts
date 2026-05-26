import { describe, it, expect } from 'vitest'
import { calculateTransportCost } from '../transport'

describe('calculateTransportCost', () => {
  it('calculates transport costs', () => {
    expect(calculateTransportCost(1, 25)).toBeCloseTo(25.0, 2)
    expect(calculateTransportCost(3, 10)).toBeCloseTo(30.0, 2)
    expect(calculateTransportCost(0, 15)).toBeCloseTo(0.0, 2)
    expect(calculateTransportCost(2.5, 8)).toBeCloseTo(20.0, 2)
  })

  it('throws on invalid inputs', () => {
    expect(() => calculateTransportCost(-1, 10)).toThrow()
    expect(() => calculateTransportCost(1, -10)).toThrow()
    expect(() => calculateTransportCost(NaN, 10)).toThrow()
  })
})
