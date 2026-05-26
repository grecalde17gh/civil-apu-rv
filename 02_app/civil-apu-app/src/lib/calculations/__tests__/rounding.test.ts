import { describe, it, expect } from 'vitest'
import { roundMoney } from '../rounding'

describe('roundMoney', () => {
  it('rounds values to 2 decimals by default', () => {
    expect(roundMoney(4.0911)).toBeCloseTo(4.09, 2)
    expect(roundMoney(6.1267)).toBeCloseTo(6.13, 2)
    expect(roundMoney(200.705)).toBeCloseTo(200.71, 2)
    expect(roundMoney(2.3)).toBeCloseTo(2.3, 2)
    expect(roundMoney(0)).toBeCloseTo(0, 2)
  })

  it('supports custom decimal places', () => {
    expect(roundMoney(123.456789, 4)).toBeCloseTo(123.4568, 4)
  })

  it('throws on NaN and Infinity', () => {
    expect(() => roundMoney(NaN)).toThrow()
    expect(() => roundMoney(Infinity)).toThrow()
  })

  it('handles negative numbers (returns rounded negative)', () => {
    expect(roundMoney(-4.0911)).toBeCloseTo(-4.09, 2)
  })
})
