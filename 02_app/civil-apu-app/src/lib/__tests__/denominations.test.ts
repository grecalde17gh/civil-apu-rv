import { describe, expect, it } from 'vitest'
import { filterCatalogOptions } from '../catalogSearch'
import { validateEquipmentInput } from '../validations/equipment'
import { validateLaborInput } from '../validations/labor'
import { validateMaterialInput } from '../validations/material'

describe('IPCO denominations', () => {
  it('searches denominations by text', () => {
    const results = filterCatalogOptions(
      [
        { id: 'den-1', label: 'Cemento Portland', searchText: 'Cemento Portland' },
        { id: 'den-2', label: 'Acero en barras', searchText: 'Acero en barras' },
      ],
      'cemento',
      10,
    )

    expect(results.map((item) => item.id)).toEqual(['den-1'])
  })

  it('assigns and clears a denomination on material input', () => {
    expect(
      validateMaterialInput({
        description: 'Cemento',
        unit: 'saco',
        price1: '8.5',
        denominationId: 'den-1',
      }).denominationId,
    ).toBe('den-1')

    expect(
      validateMaterialInput({
        description: 'Cemento',
        unit: 'saco',
        price1: '8.5',
        denominationId: '',
      }).denominationId,
    ).toBe('')
  })

  it('assigns and clears a denomination on labor input', () => {
    expect(
      validateLaborInput({
        roleName: 'Peon',
        hourlyCost: '4',
        denominationId: 'den-2',
      }).denominationId,
    ).toBe('den-2')

    expect(
      validateLaborInput({
        roleName: 'Peon',
        hourlyCost: '4',
        denominationId: '',
      }).denominationId,
    ).toBe('')
  })

  it('assigns and clears a denomination on equipment input', () => {
    expect(
      validateEquipmentInput({
        description: 'Concretera',
        hourlyRate: '8',
        denominationId: 'den-3',
      }).denominationId,
    ).toBe('den-3')

    expect(
      validateEquipmentInput({
        description: 'Concretera',
        hourlyRate: '8',
        denominationId: '',
      }).denominationId,
    ).toBe('')
  })
})
