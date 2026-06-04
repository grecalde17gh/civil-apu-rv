import { describe, expect, it } from 'vitest'
import { formatCatalogCode, generateNextCatalogCode, isValidCatalogCode } from '../catalogCodes'
import { validateEquipmentInput } from '../validations/equipment'
import { validateLaborInput } from '../validations/labor'
import { validateMaterialInput } from '../validations/material'
import { validateRubroTransportInput } from '../validations/rubroTransport'

describe('catalog codes', () => {
  it('generates the next MAT code', () => {
    expect(generateNextCatalogCode(['MAT-001', 'MAT-002'], 'MAT')).toBe('MAT-003')
  })

  it('generates the next MO code', () => {
    expect(generateNextCatalogCode(['MO-001', 'MO-002'], 'MO')).toBe('MO-003')
  })

  it('generates the next EQ code', () => {
    expect(generateNextCatalogCode(['EQ-009', 'EQ-010'], 'EQ')).toBe('EQ-011')
  })

  it('generates the next TR code', () => {
    expect(generateNextCatalogCode(['TR-001', 'TR-002'], 'TR')).toBe('TR-003')
  })

  it('keeps growing after 999 without truncating', () => {
    expect(generateNextCatalogCode(['MAT-999'], 'MAT')).toBe('MAT-1000')
  })

  it('ignores invalid and foreign-prefix codes when generating', () => {
    expect(generateNextCatalogCode(['MAT-001', 'MAT-ABC', 'MO-999', undefined], 'MAT')).toBe('MAT-002')
  })

  it('validates catalog code format by prefix and numeric suffix', () => {
    expect(isValidCatalogCode('MAT-001', 'MAT')).toBe(true)
    expect(isValidCatalogCode('MAT-ABC', 'MAT')).toBe(false)
    expect(isValidCatalogCode('M-001', 'MAT')).toBe(false)
    expect(isValidCatalogCode('001', 'MAT')).toBe(false)
  })

  it('formats copied catalog records with the next available prefix code', () => {
    expect(generateNextCatalogCode(['MAT-004'], 'MAT')).toBe('MAT-005')
    expect(generateNextCatalogCode(['MO-003'], 'MO')).toBe('MO-004')
    expect(generateNextCatalogCode(['EQ-010'], 'EQ')).toBe('EQ-011')
    expect(generateNextCatalogCode(['TR-002'], 'TR')).toBe('TR-003')
  })

  it('does not generate random-looking transport codes', () => {
    const nextCode = generateNextCatalogCode([], 'TR')

    expect(nextCode).toBe('TR-001')
    expect(nextCode).toMatch(/^TR-\d+$/)
  })

  it('rejects invalid manual codes in catalog forms', () => {
    expect(() =>
      validateMaterialInput({ code: 'MAT-ABC', description: 'Cemento', unit: 'kg', unitCost: '1' }),
    ).toThrow()
    expect(() => validateLaborInput({ code: 'M-001', roleName: 'Albanil', hourlyCost: '1' })).toThrow()
    expect(() => validateEquipmentInput({ code: '001', description: 'Concretera', hourlyRate: '1' })).toThrow()
    expect(() =>
      validateRubroTransportInput({
        rubroId: 'rubro-1',
        code: 'TR-ABC',
        description: 'Acarreo',
        unit: 'm3',
        quantity: '1',
        unitCost: '1',
      }),
    ).toThrow()
  })

  it('accepts valid manual codes in catalog forms', () => {
    expect(validateMaterialInput({ code: 'MAT-001', description: 'Cemento', unit: 'kg', unitCost: '1' }).code).toBe(
      'MAT-001',
    )
    expect(validateLaborInput({ code: 'MO-001', roleName: 'Albanil', hourlyCost: '1' }).code).toBe('MO-001')
    expect(validateEquipmentInput({ code: 'EQ-001', description: 'Concretera', hourlyRate: '1' }).code).toBe('EQ-001')
    expect(
      validateRubroTransportInput({
        rubroId: 'rubro-1',
        code: 'TR-001',
        description: 'Acarreo',
        unit: 'm3',
        quantity: '1',
        unitCost: '1',
      }).code,
    ).toBe('TR-001')
  })

  it('formats explicit numeric values with at least three digits', () => {
    expect(formatCatalogCode('EQ', 7)).toBe('EQ-007')
  })
})
