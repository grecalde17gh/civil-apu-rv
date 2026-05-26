import { describe, it, expect } from 'vitest'
import { assertValidNumber, assertNonNegative, assertPercentage, assertPositive } from '../validation'

describe('validation assertions', () => {
  it('assertValidNumber accepts finite numbers and throws on invalid', () => {
    expect(assertValidNumber(5, 'x')).toBe(5)
    expect(() => assertValidNumber(NaN, 'x')).toThrow()
    expect(() => assertValidNumber(Infinity, 'x')).toThrow()
    expect(() => assertValidNumber(undefined, 'x')).toThrow()
  })

  it('assertNonNegative rejects negatives', () => {
    expect(assertNonNegative(0, 'n')).toBe(0)
    expect(() => assertNonNegative(-1, 'n')).toThrow()
  })

  it('assertPercentage validates 0..100', () => {
    expect(assertPercentage(0, 'p')).toBe(0)
    expect(assertPercentage(100, 'p')).toBe(100)
    expect(() => assertPercentage(150, 'p')).toThrow()
    expect(() => assertPercentage(-1, 'p')).toThrow()
  })

  it('assertPositive requires > 0', () => {
    expect(assertPositive(1, 'pos')).toBe(1)
    expect(() => assertPositive(0, 'pos')).toThrow()
    expect(() => assertPositive(-1, 'pos')).toThrow()
  })
})
