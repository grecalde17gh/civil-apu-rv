import { describe, expect, it } from 'vitest'
import { buildBudgetPolynomialTerms } from '../budgetPolynomialTerms'

describe('budget polynomial terms', () => {
  it('groups every labor denomination into the single B term and exposes crew rows', () => {
    const result = buildBudgetPolynomialTerms({
      materials: [],
      equipment: [],
      transport: [],
      totals: { materials: 0, labor: 40, equipment: 0, transport: 0 },
      labor: [
        { key: 'labor-1', componentType: 'LABOR', componentIds: ['one'], code: 'MO-1', description: 'C1 - Oficial', unit: 'hora', totalQuantity: 1, unitCost: 10, totalCost: 10, cpc: '', vae: '', denominationId: 'd1', denomination: 'A - Oficial', originalDenominationId: 'd1', originalDenomination: 'A - Oficial', isDenominationOverride: false },
        { key: 'labor-2', componentType: 'LABOR', componentIds: ['two'], code: 'MO-2', description: 'D2 - Peon', unit: 'hora', totalQuantity: 1, unitCost: 30, totalCost: 30, cpc: '', vae: '', denominationId: 'd2', denomination: 'B - Peon', originalDenominationId: 'd2', originalDenomination: 'B - Peon', isDenominationOverride: false },
      ],
    }, 100)

    expect(result.rows).toEqual([expect.objectContaining({ term: 'B', grouping: 'Mano de obra', totalCost: 40, percentage: 100 })])
    expect(result.laborBreakdown).toEqual([
      expect.objectContaining({ denomination: 'B - Peon', totalCost: 30, percentageWithinLabor: 75, percentageOfDirectCost: 30 }),
      expect.objectContaining({ denomination: 'A - Oficial', totalCost: 10, percentageWithinLabor: 25, percentageOfDirectCost: 10 }),
    ])
    expect(result.laborCrew).toEqual([
      expect.objectContaining({ description: 'ESTRUCTURA OCUPACIONAL D2', coefficient: 0.75 }),
      expect.objectContaining({ description: 'ESTRUCTURA OCUPACIONAL C1', coefficient: 0.25 }),
    ])
  })

  it('assigns X to componentes no principales and warns when it exceeds ten percent', () => {
    const result = buildBudgetPolynomialTerms({
      labor: [],
      equipment: [],
      transport: [],
      totals: { materials: 12, labor: 0, equipment: 0, transport: 0 },
      materials: [{ key: 'mat-1', componentType: 'MATERIAL', componentIds: ['one'], code: 'M-1', description: 'Varios', unit: 'u', totalQuantity: 1, unitCost: 12, totalCost: 12, usesCategory1: false, usesCategory2: false, cpc: '', vae: '', denominationId: 'x', denomination: 'Componentes no principales', originalDenominationId: 'x', originalDenomination: 'Componentes no principales', isDenominationOverride: false }],
    }, 100)

    expect(result.rows).toEqual([expect.objectContaining({ term: 'X', totalCost: 12, percentage: 100 })])
    expect(result.exceedsTermXLimit).toBe(true)
  })

  it('uses only A, C through I for non-labor denominations and flags a ninth group', () => {
    const materials = Array.from({ length: 9 }, (_, index) => ({
      key: `mat-${index}`, componentType: 'MATERIAL' as const, componentIds: [`component-${index}`], code: `M-${index}`, description: `Material ${index}`, unit: 'u', totalQuantity: 1, unitCost: 1, totalCost: 1, usesCategory1: false, usesCategory2: false, cpc: '', vae: '', denominationId: `d-${index}`, denomination: `Denominacion ${index}`, originalDenominationId: `d-${index}`, originalDenomination: `Denominacion ${index}`, isDenominationOverride: false,
    }))
    const result = buildBudgetPolynomialTerms({ materials, labor: [], equipment: [], transport: [], totals: { materials: 9, labor: 0, equipment: 0, transport: 0 } }, 9)

    expect(result.rows.map((row) => row.term)).toEqual(['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', null])
    expect(result.rows.map((row) => row.term)).not.toContain('J')
    expect(result.exceedsTermLimit).toBe(true)
  })

  it('orders terms as B, A, C through I, X', () => {
    const result = buildBudgetPolynomialTerms({
      totals: { materials: 20, labor: 10, equipment: 0, transport: 5 },
      labor: [{ key: 'labor-1', componentType: 'LABOR', componentIds: ['labor'], code: 'MO-1', description: 'D2 - Peon', unit: 'hora', totalQuantity: 1, unitCost: 10, totalCost: 10, cpc: '', vae: '', denominationId: 'labor', denomination: 'D2 - Peon', originalDenominationId: 'labor', originalDenomination: 'D2 - Peon', isDenominationOverride: false }],
      materials: [
        { key: 'mat-1', componentType: 'MATERIAL', componentIds: ['mat-1'], code: 'M-1', description: 'Cemento', unit: 'u', totalQuantity: 1, unitCost: 10, totalCost: 10, usesCategory1: false, usesCategory2: false, cpc: '', vae: '', denominationId: 'den-a', denomination: 'Cemento', originalDenominationId: 'den-a', originalDenomination: 'Cemento', isDenominationOverride: false },
        { key: 'mat-2', componentType: 'MATERIAL', componentIds: ['mat-2'], code: 'M-2', description: 'Varios', unit: 'u', totalQuantity: 1, unitCost: 10, totalCost: 10, usesCategory1: false, usesCategory2: false, cpc: '', vae: '', denominationId: 'x', denomination: 'Componentes no principales', originalDenominationId: 'x', originalDenomination: 'Componentes no principales', isDenominationOverride: false },
      ],
      equipment: [],
      transport: [{ key: 'tr-1', componentType: 'TRANSPORT', componentIds: ['tr-1'], code: 'TR-1', description: 'Transporte', unit: 'u', distance: '-', totalQuantity: 1, unitCost: 5, totalCost: 5, cpc: '', vae: '', denominationId: 'den-c', denomination: 'Transporte', originalDenominationId: 'den-c', originalDenomination: 'Transporte', isDenominationOverride: false }],
    }, 35)

    expect(result.rows.map((row) => row.term)).toEqual(['B', 'A', 'C', 'X'])
  })

  it('calculates coefficients from visible formula term totals instead of direct cost total', () => {
    const result = buildBudgetPolynomialTerms({
      totals: { materials: 100, labor: 50, equipment: 0, transport: 0 },
      labor: [{ key: 'labor-1', componentType: 'LABOR', componentIds: ['labor'], code: 'MO-1', description: 'D2 - Peon', unit: 'hora', totalQuantity: 1, unitCost: 50, totalCost: 50, cpc: '', vae: '', denominationId: 'labor', denomination: 'D2 - Peon', originalDenominationId: 'labor', originalDenomination: 'D2 - Peon', isDenominationOverride: false }],
      materials: [{ key: 'mat-1', componentType: 'MATERIAL', componentIds: ['mat-1'], code: 'M-1', description: 'Cemento', unit: 'u', totalQuantity: 1, unitCost: 100, totalCost: 100, usesCategory1: false, usesCategory2: false, cpc: '', vae: '', denominationId: 'den-a', denomination: 'Cemento', originalDenominationId: 'den-a', originalDenomination: 'Cemento', isDenominationOverride: false }],
      equipment: [],
      transport: [],
    }, 1000)

    expect(result.rows.map((row) => ({ term: row.term, totalCost: row.totalCost, percentage: row.percentage }))).toEqual([
      { term: 'B', totalCost: 50, percentage: 50 / 150 * 100 },
      { term: 'A', totalCost: 100, percentage: 100 / 150 * 100 },
    ])
    expect(result.rows.reduce((sum, row) => sum + row.percentage / 100, 0)).toBeCloseTo(1, 5)
  })

  it('keeps componentes no principales only in X and out of regular terms', () => {
    const result = buildBudgetPolynomialTerms({
      totals: { materials: 30, labor: 0, equipment: 0, transport: 0 },
      labor: [],
      materials: [
        { key: 'mat-main', componentType: 'MATERIAL', componentIds: ['main'], code: 'M-1', description: 'Cemento', unit: 'u', totalQuantity: 1, unitCost: 20, totalCost: 20, usesCategory1: false, usesCategory2: false, cpc: '', vae: '', denominationId: 'den-a', denomination: 'Cemento', originalDenominationId: 'den-a', originalDenomination: 'Cemento', isDenominationOverride: false },
        { key: 'mat-x', componentType: 'MATERIAL', componentIds: ['x'], code: 'M-2', description: 'Varios', unit: 'u', totalQuantity: 1, unitCost: 10, totalCost: 10, usesCategory1: false, usesCategory2: false, cpc: '', vae: '', denominationId: 'den-x', denomination: 'Componentes no principales', originalDenominationId: 'den-x', originalDenomination: 'Componentes no principales', isDenominationOverride: false },
      ],
      equipment: [],
      transport: [],
    }, 30)

    const regularComponentIds = result.rows.filter((row) => row.term !== 'X').flatMap((row) => row.components.flatMap((component) => component.componentIds))
    const xComponentIds = result.rows.find((row) => row.term === 'X')?.components.flatMap((component) => component.componentIds) ?? []

    expect(regularComponentIds).toEqual(['main'])
    expect(xComponentIds).toEqual(['x'])
  })

  it('splits labor crew rows by structure and exceptional rates', () => {
    const result = buildBudgetPolynomialTerms({
      materials: [],
      equipment: [],
      transport: [],
      totals: { materials: 0, labor: 30, equipment: 0, transport: 0 },
      labor: [
        { key: 'labor-1', componentType: 'LABOR', componentIds: ['one'], code: 'MO-002', description: 'D2 - Ayudante de maquinaria', unit: 'hora', totalQuantity: 1, unitCost: 4.36, totalCost: 10, cpc: '', vae: '', denominationId: 'd2', denomination: 'D2 - Mano de obra', originalDenominationId: 'd2', originalDenomination: 'D2 - Mano de obra', isDenominationOverride: false },
        { key: 'labor-2', componentType: 'LABOR', componentIds: ['two'], code: 'MO-004', description: 'D2 - Albanil', unit: 'hora', totalQuantity: 1, unitCost: 4.39, totalCost: 12, cpc: '', vae: '', denominationId: 'd2', denomination: 'D2 - Mano de obra', originalDenominationId: 'd2', originalDenomination: 'D2 - Mano de obra', isDenominationOverride: false },
        { key: 'labor-3', componentType: 'LABOR', componentIds: ['three'], code: 'MO-024', description: 'D2 - Jardinero', unit: 'hora', totalQuantity: 1, unitCost: 4.39, totalCost: 8, cpc: '', vae: '', denominationId: 'd2', denomination: 'D2 - Mano de obra', originalDenominationId: 'd2', originalDenomination: 'D2 - Mano de obra', isDenominationOverride: false },
      ],
    }, 30)

    expect(result.laborCrew).toEqual([
      expect.objectContaining({ description: 'ESTRUCTURA OCUPACIONAL D2', coefficient: 20 / 30 }),
      expect.objectContaining({ description: 'ESTRUCTURA OCUPACIONAL D2 - Ayudante de maquinaria', coefficient: 10 / 30 }),
    ])
  })
})
