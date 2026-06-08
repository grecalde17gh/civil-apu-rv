import { describe, expect, it } from 'vitest'
import { calculateEquipmentCost } from '../equipment'
import { calculateLaborCost } from '../labor'
import { resolveRubroTimeRequired } from '../rubroPerformance'

describe('rubro performance applied to labor and equipment', () => {
  it('uses rubro performance as the time factor for labor', () => {
    const timeRequired = resolveRubroTimeRequired({ rubroPerformanceValue: 10, lineTimeRequired: 2 })

    expect(timeRequired).toBe(10)
    expect(
      calculateLaborCost({
        workerQuantity: 2,
        hourlyCost: 5,
        timeRequired,
        performanceMode: 'MANUAL_TIME',
      }),
    ).toBe(100)
  })

  it('uses rubro performance as the time factor for equipment', () => {
    const timeRequired = resolveRubroTimeRequired({ rubroPerformanceValue: 20, lineTimeRequired: 3 })

    expect(timeRequired).toBe(20)
    expect(
      calculateEquipmentCost({
        equipmentQuantity: 1.5,
        rate: 8,
        timeRequired,
        performanceMode: 'MANUAL_TIME',
        rateType: 'HOURLY',
      }),
    ).toBe(240)
  })

  it('falls back to the line value when rubro performance is empty or zero', () => {
    expect(resolveRubroTimeRequired({ rubroPerformanceValue: null, lineTimeRequired: 4 })).toBe(4)
    expect(resolveRubroTimeRequired({ rubroPerformanceValue: 0, lineTimeRequired: 4 })).toBe(4)
    expect(resolveRubroTimeRequired({ rubroPerformanceValue: undefined, lineTimeRequired: undefined })).toBe(0)
  })
})

