import { describe, it, expect } from 'vitest'
import { calculateAPU, sumCosts, calculateDirectCost, calculateIndirectCost, calculateUnitPrice } from '../apu'

describe('APU calculations', () => {
  it('sums costs correctly', () => {
    expect(sumCosts([10, 20, 30])).toBeCloseTo(60.0, 2)
    expect(sumCosts([0, 5.5, 4.5])).toBeCloseTo(10.0, 2)
    expect(sumCosts([])).toBeCloseTo(0.0, 2)
    // suma redondeada a 2 decimales según la regla del proyecto
    expect(sumCosts([2.333, 1.111])).toBeCloseTo(3.44, 2)
  })

  it('direct cost examples', () => {
    expect(calculateDirectCost({ materialsSubtotal: 100, laborSubtotal: 50, equipmentSubtotal: 25, transportSubtotal: 0 })).toBeCloseTo(175, 2)
    expect(calculateDirectCost({ materialsSubtotal: 10.25, laborSubtotal: 5.25, equipmentSubtotal: 2.5, transportSubtotal: 1 })).toBeCloseTo(19, 2)
  })

  it('indirect cost and unit price', () => {
    expect(calculateIndirectCost(100, 15)).toBeCloseTo(15, 2)
    expect(calculateUnitPrice(100, 15)).toBeCloseTo(115, 2)
    // precio unitario incluye redondeo centralizado a 2 decimales
    expect(calculateUnitPrice(123.45, 15)).toBeCloseTo(141.97, 2)
  })

  it('calculateAPU base case', () => {
    const res = calculateAPU({
      materials: [60, 40],
      labor: [25, 25],
      equipment: [10],
      transport: [5],
      indirectPercentage: 15,
    })

    expect(res.materialsSubtotal).toBeCloseTo(100.0, 2)
    expect(res.laborSubtotal).toBeCloseTo(50.0, 2)
    expect(res.equipmentSubtotal).toBeCloseTo(10.0, 2)
    expect(res.transportSubtotal).toBeCloseTo(5.0, 2)
    expect(res.directCost).toBeCloseTo(165.0, 2)
    expect(res.indirectCost).toBeCloseTo(24.75, 2)
    expect(res.unitPrice).toBeCloseTo(189.75, 2)
  })

  it('APU without transport', () => {
    const res = calculateAPU({ materials: [100], labor: [50], equipment: [25], transport: [], indirectPercentage: 10 })
    expect(res.directCost).toBeCloseTo(175.0, 2)
    expect(res.indirectCost).toBeCloseTo(17.5, 2)
    expect(res.unitPrice).toBeCloseTo(192.5, 2)
  })

  it('APU only materials', () => {
    const res = calculateAPU({ materials: [100], labor: [], equipment: [], transport: [], indirectPercentage: 15 })
    expect(res.directCost).toBeCloseTo(100.0, 2)
    expect(res.indirectCost).toBeCloseTo(15.0, 2)
    expect(res.unitPrice).toBeCloseTo(115.0, 2)
  })
})
