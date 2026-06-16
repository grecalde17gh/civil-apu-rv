import { describe, expect, it } from 'vitest'
import { calculateNpEpNd, calculateRelativeWeight, calculateVaeElement } from '../rubroComponentParticipation'

describe('rubro component participation helpers', () => {
  it('calculates relative weight against the rubro direct total', () => {
    expect(calculateRelativeWeight(25, 100)).toBeCloseTo(0.25, 4)
    expect(calculateRelativeWeight(0, 100)).toBe(0)
  })

  it('avoids division by zero or invalid totals', () => {
    expect(calculateRelativeWeight(25, 0)).toBe(0)
    expect(calculateRelativeWeight(25, Number.NaN)).toBe(0)
    expect(calculateRelativeWeight(Number.NaN, 100)).toBe(0)
  })

  it('maps VAE values to NP, EP, or ND', () => {
    expect(calculateNpEpNd(1)).toBe('EP')
    expect(calculateNpEpNd('1')).toBe('EP')
    expect(calculateNpEpNd({ toString: () => '1' })).toBe('EP')
    expect(calculateNpEpNd(0)).toBe('NP')
    expect(calculateNpEpNd('0')).toBe('NP')
    expect(calculateNpEpNd(null)).toBe('ND')
    expect(calculateNpEpNd('')).toBe('ND')
    expect(calculateNpEpNd(0.5)).toBe('ND')
  })

  it('calculates VAE element with numeric VAE and treats empty values as zero', () => {
    expect(calculateVaeElement(0.25, 1)).toBeCloseTo(0.25, 4)
    expect(calculateVaeElement(0.25, 0)).toBe(0)
    expect(calculateVaeElement(0.25, '0.5')).toBeCloseTo(0.125, 4)
    expect(calculateVaeElement(0.25, null)).toBe(0)
    expect(calculateVaeElement(Number.NaN, 1)).toBe(0)
  })
})
