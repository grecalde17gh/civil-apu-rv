import { describe, it, expect } from 'vitest'
import { calculateEquipmentCost } from '../equipment'

// Nota: La conversión diaria->hora y las interpretaciones de rendimiento están marcadas como pendientes de validación con Franklin.

describe('calculateEquipmentCost', () => {
  it('hourly rate with manual time', () => {
    expect(
      calculateEquipmentCost({
        equipmentQuantity: 1,
        rate: 10,
        timeRequired: 2,
        performanceMode: 'MANUAL_TIME',
        rateType: 'HOURLY',
      })
    ).toBeCloseTo(20.0, 2)

    expect(
      calculateEquipmentCost({
        equipmentQuantity: 2,
        rate: 15,
        timeRequired: 3,
        performanceMode: 'MANUAL_TIME',
        rateType: 'HOURLY',
      })
    ).toBeCloseTo(90.0, 2)
  })

  it('daily rate converted to hourly', () => {
    expect(
      calculateEquipmentCost({
        equipmentQuantity: 1,
        rate: 80,
        timeRequired: 2,
        performanceMode: 'MANUAL_TIME',
        rateType: 'DAILY',
        hoursPerDay: 8,
      })
    ).toBeCloseTo(20.0, 2)

    expect(
      calculateEquipmentCost({
        equipmentQuantity: 2,
        rate: 160,
        timeRequired: 1,
        performanceMode: 'MANUAL_TIME',
        rateType: 'DAILY',
        hoursPerDay: 8,
      })
    ).toBeCloseTo(40.0, 2)
  })

  it('fixed rate', () => {
    expect(
      calculateEquipmentCost({
        equipmentQuantity: 1,
        rate: 50,
        performanceMode: 'MANUAL_TIME',
        rateType: 'FIXED',
      })
    ).toBeCloseTo(50.0, 2)

    expect(
      calculateEquipmentCost({
        equipmentQuantity: 0.5,
        rate: 80,
        performanceMode: 'MANUAL_TIME',
        rateType: 'FIXED',
      })
    ).toBeCloseTo(40.0, 2)
  })

  it('throws on invalid inputs', () => {
    expect(() =>
      calculateEquipmentCost({
        equipmentQuantity: -1,
        rate: 10,
        performanceMode: 'MANUAL_TIME',
        rateType: 'HOURLY',
      })
    ).toThrow()

    expect(() =>
      calculateEquipmentCost({
        equipmentQuantity: 1,
        rate: -10,
        performanceMode: 'MANUAL_TIME',
        rateType: 'HOURLY',
      })
    ).toThrow()

    expect(() =>
      calculateEquipmentCost({
        equipmentQuantity: 1,
        rate: 10,
        performanceMode: 'MANUAL_TIME',
        rateType: 'UNKNOWN' as unknown as Parameters<typeof calculateEquipmentCost>[0]['rateType'],
      })
    ).toThrow()
  })
})
