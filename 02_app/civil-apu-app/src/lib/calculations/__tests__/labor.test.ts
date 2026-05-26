import { describe, it, expect } from 'vitest'
import { calculateLaborCost } from '../labor'

// Nota: Las interpretaciones de rendimiento están marcadas como pendientes de validación con Franklin.

describe('calculateLaborCost', () => {
  it('MANUAL_TIME mode calculations', () => {
    expect(
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 5,
        timeRequired: 2,
        performanceMode: 'MANUAL_TIME',
      })
    ).toBeCloseTo(10.0, 2)

    expect(
      calculateLaborCost({
        workerQuantity: 2,
        hourlyCost: 4.5,
        timeRequired: 3,
        performanceMode: 'MANUAL_TIME',
      })
    ).toBeCloseTo(27.0, 2)

    expect(
      calculateLaborCost({
        workerQuantity: 1.5,
        hourlyCost: 6,
        timeRequired: 2,
        performanceMode: 'MANUAL_TIME',
      })
    ).toBeCloseTo(18.0, 2)

    expect(
      calculateLaborCost({
        workerQuantity: 0,
        hourlyCost: 5,
        timeRequired: 2,
        performanceMode: 'MANUAL_TIME',
      })
    ).toBeCloseTo(0.0, 2)
  })

  it('UNITS_PER_HOUR mode calculations (assumed 1 / rendimiento)', () => {
    expect(
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 5,
        performanceValue: 2,
        performanceMode: 'UNITS_PER_HOUR',
      })
    ).toBeCloseTo(2.5, 2)

    expect(
      calculateLaborCost({
        workerQuantity: 2,
        hourlyCost: 5,
        performanceValue: 4,
        performanceMode: 'UNITS_PER_HOUR',
      })
    ).toBeCloseTo(2.5, 2)

    expect(
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 8,
        performanceValue: 0.5,
        performanceMode: 'UNITS_PER_HOUR',
      })
    ).toBeCloseTo(16.0, 2)
  })

  it('UNITS_PER_DAY mode calculations (assumed horasPorJornada/ rendimiento)', () => {
    expect(
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 5,
        performanceValue: 8,
        performanceMode: 'UNITS_PER_DAY',
      })
    ).toBeCloseTo(5.0, 2)

    expect(
      calculateLaborCost({
        workerQuantity: 2,
        hourlyCost: 5,
        performanceValue: 8,
        performanceMode: 'UNITS_PER_DAY',
      })
    ).toBeCloseTo(10.0, 2)

    expect(
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 6,
        performanceValue: 4,
        performanceMode: 'UNITS_PER_DAY',
      })
    ).toBeCloseTo(12.0, 2)
  })

  it('HOURS_PER_UNIT mode calculations', () => {
    expect(
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 5,
        performanceValue: 2,
        performanceMode: 'HOURS_PER_UNIT',
      })
    ).toBeCloseTo(10.0, 2)
  })

  it('throws on invalid inputs', () => {
    expect(() =>
      calculateLaborCost({
        workerQuantity: -1,
        hourlyCost: 5,
        timeRequired: 1,
        performanceMode: 'MANUAL_TIME',
      })
    ).toThrow()

    expect(() =>
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: -5,
        timeRequired: 1,
        performanceMode: 'MANUAL_TIME',
      })
    ).toThrow()

    expect(() =>
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 5,
        performanceMode: 'MANUAL_TIME',
      })
    ).toThrow()

    expect(() =>
      calculateLaborCost({
        workerQuantity: 1,
        hourlyCost: 5,
        performanceValue: 0,
        performanceMode: 'UNITS_PER_HOUR',
      })
    ).toThrow()
  })
})
