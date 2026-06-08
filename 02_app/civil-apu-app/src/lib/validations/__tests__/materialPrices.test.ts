import { describe, expect, it } from 'vitest'
import { validateMaterialInput } from '../material'

describe('material price validation', () => {
  it('creates a material with required Precio 1', () => {
    const parsed = validateMaterialInput({
      code: 'MAT-001',
      description: 'Cemento',
      unit: 'saco',
      price1: '8,50',
    })

    expect(parsed.price1).toBe(8.5)
    expect(parsed.price2).toBeUndefined()
    expect(parsed.price3).toBeUndefined()
  })

  it('creates a material with Precio 1, Precio 2 and Precio 3', () => {
    const parsed = validateMaterialInput({
      code: 'MAT-002',
      description: 'Arena',
      unit: 'm3',
      price1: '12.25',
      price2: '13,50',
      price3: '14',
    })

    expect(parsed.price1).toBe(12.25)
    expect(parsed.price2).toBe(13.5)
    expect(parsed.price3).toBe(14)
  })

  it('requires Precio 1 and rejects negative prices', () => {
    expect(() =>
      validateMaterialInput({
        code: 'MAT-003',
        description: 'Ripio',
        unit: 'm3',
      }),
    ).toThrow()

    expect(() =>
      validateMaterialInput({
        code: 'MAT-004',
        description: 'Acero',
        unit: 'kg',
        price1: '-1',
      }),
    ).toThrow()

    expect(() =>
      validateMaterialInput({
        code: 'MAT-005',
        description: 'Pintura',
        unit: 'gal',
        price1: '10',
        price2: '-2',
      }),
    ).toThrow()
  })
})
