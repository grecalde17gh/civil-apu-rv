import { describe, expect, it } from 'vitest'
import { consolidateBudgetComponents } from '../budgetConsolidation'

describe('budget component consolidation', () => {
  it('consolidates one budget item with one material', () => {
    const result = consolidateBudgetComponents({
      items: [
        {
          quantity: 3,
          rubro: {
            materials: [
              {
                id: 'rubro-material-1',
                materialId: 'material-1',
                quantity: 2,
                unit: 'kg',
                unitCostSnapshot: 5,
                material: {
                  code: 'MAT-001',
                  description: 'Cemento',
                  unit: 'kg',
                  usesCategory1: true,
                  usesCategory2: false,
                },
              },
            ],
          },
        },
      ],
    })

    expect(result.materials).toHaveLength(1)
    expect(result.materials[0]).toMatchObject({
      code: 'MAT-001',
      totalQuantity: 6,
      unitCost: 5,
      totalCost: 30,
      usesCategory1: true,
      usesCategory2: false,
    })
    expect(result.totals.materials).toBe(30)
  })

  it('groups the same material across two rubros', () => {
    const result = consolidateBudgetComponents({
      items: [
        {
          quantity: 2,
          rubro: {
            materials: [
              {
                id: 'rubro-material-1',
                materialId: 'material-1',
                quantity: 1.5,
                unit: 'kg',
                unitCostSnapshot: 4,
                material: {
                  code: 'MAT-001',
                  description: 'Cemento',
                  unit: 'kg',
                  usesCategory1: false,
                  usesCategory2: true,
                },
              },
            ],
          },
        },
        {
          quantity: 5,
          rubro: {
            materials: [
              {
                id: 'rubro-material-2',
                materialId: 'material-1',
                quantity: 2,
                unit: 'kg',
                unitCostSnapshot: 4,
                material: {
                  code: 'MAT-001',
                  description: 'Cemento',
                  unit: 'kg',
                  usesCategory1: false,
                  usesCategory2: true,
                },
              },
            ],
          },
        },
      ],
    })

    expect(result.materials).toHaveLength(1)
    expect(result.materials[0].totalQuantity).toBe(13)
    expect(result.materials[0].totalCost).toBe(52)
    expect(result.totals.materials).toBe(52)
  })

  it('consolidates labor by labor item', () => {
    const result = consolidateBudgetComponents({
      items: [
        {
          quantity: 4,
          rubro: {
            labor: [
              {
                id: 'rubro-labor-1',
                laborItemId: 'labor-1',
                workerQuantity: 2,
                hourlyCostSnapshot: 6,
                laborItem: { code: 'MO-001', roleName: 'Albanil' },
              },
            ],
          },
        },
      ],
    })

    expect(result.labor).toHaveLength(1)
    expect(result.labor[0]).toMatchObject({
      code: 'MO-001',
      description: 'Albanil',
      unit: 'hora',
      totalQuantity: 8,
      unitCost: 6,
      totalCost: 48,
    })
    expect(result.totals.labor).toBe(48)
  })

  it('consolidates equipment by equipment item', () => {
    const result = consolidateBudgetComponents({
      items: [
        {
          quantity: 3,
          rubro: {
            equipment: [
              {
                id: 'rubro-equipment-1',
                equipmentItemId: 'equipment-1',
                equipmentQuantity: 1.5,
                rateSnapshot: 10,
                equipmentItem: { code: 'EQ-001', description: 'Concretera' },
              },
            ],
          },
        },
      ],
    })

    expect(result.equipment).toHaveLength(1)
    expect(result.equipment[0].totalQuantity).toBe(4.5)
    expect(result.equipment[0].totalCost).toBe(45)
    expect(result.totals.equipment).toBe(45)
  })

  it('consolidates transport by description, unit and tariff', () => {
    const result = consolidateBudgetComponents({
      items: [
        {
          quantity: 2,
          rubro: {
            transport: [
              {
                id: 'transport-1',
                code: 'TR-001',
                description: 'Acarreo',
                unit: 'm3',
                quantity: 3,
                unitCost: 8,
              },
            ],
          },
        },
        {
          quantity: 1,
          rubro: {
            transport: [
              {
                id: 'transport-2',
                code: 'TR-002',
                description: 'Acarreo',
                unit: 'm3',
                quantity: 4,
                unitCost: 8,
              },
            ],
          },
        },
      ],
    })

    expect(result.transport).toHaveLength(1)
    expect(result.transport[0].code).toBe('TR-001')
    expect(result.transport[0].totalQuantity).toBe(10)
    expect(result.transport[0].totalCost).toBe(80)
    expect(result.totals.transport).toBe(80)
  })

  it('uses budget IPCO overrides to split consolidation groups by effective denomination', () => {
    const result = consolidateBudgetComponents({
      ipcoOverrides: [
        {
          componentType: 'MATERIAL',
          componentId: 'rubro-material-2',
          originalDenomination: { id: 'den-1', code: 'D1', name: 'Original' },
          overrideDenomination: { id: 'den-2', code: 'D2', name: 'Manual' },
        },
      ],
      items: [
        {
          quantity: 1,
          rubro: {
            materials: [
              {
                id: 'rubro-material-1',
                materialId: 'material-1',
                quantity: 2,
                unit: 'kg',
                unitCostSnapshot: 5,
                material: {
                  code: 'MAT-001',
                  description: 'Cemento',
                  unit: 'kg',
                  usesCategory1: false,
                  usesCategory2: false,
                  denomination: { id: 'den-1', code: 'D1', name: 'Original' },
                },
              },
              {
                id: 'rubro-material-2',
                materialId: 'material-1',
                quantity: 3,
                unit: 'kg',
                unitCostSnapshot: 5,
                material: {
                  code: 'MAT-001',
                  description: 'Cemento',
                  unit: 'kg',
                  usesCategory1: false,
                  usesCategory2: false,
                  denomination: { id: 'den-1', code: 'D1', name: 'Original' },
                },
              },
            ],
          },
        },
      ],
    })

    expect(result.materials).toHaveLength(2)
    expect(result.materials.map((row) => row.denomination)).toEqual(['D1 - Original', 'D2 - Manual'])
    expect(result.materials.find((row) => row.denomination === 'D2 - Manual')).toMatchObject({
      totalQuantity: 3,
      totalCost: 15,
      isDenominationOverride: true,
      originalDenomination: 'D1 - Original',
    })
    expect(result.totals.materials).toBe(25)
  })
})
