import { describe, expect, it } from 'vitest'
import { filterEquipment, filterLabor, filterMaterials } from '../catalogFilters'

const materials = [
  { code: 'MAT-001', description: 'Cemento Portland', unit: 'saco', unitCost: '8.50', cpc: '0.01', vae: '0.125', usesCategory1: true, usesCategory2: false, isActive: true },
  { code: 'MAT-002', description: 'Arena fina', unit: 'm3', unitCost: '12.25', cpc: null, vae: null, usesCategory1: false, usesCategory2: true, isActive: false },
]

const labor = [
  { code: 'MO-001', roleName: 'Peon', hourlyCost: '3.25', cpc: null, vae: null, category: 'obra', isActive: true },
  { code: 'MO-002', roleName: 'Maestro mayor', hourlyCost: '8.50', cpc: '0.01', vae: '0.125', category: 'supervision', isActive: true },
]

const equipment = [
  { code: 'EQ-001', description: 'Concretera', hourlyRate: '8.00', cpc: null, vae: null, equipmentType: 'equipo menor', isActive: true },
  { code: 'EQ-002', description: 'Bomba de agua', hourlyRate: '15.00', cpc: '0.01', vae: '0.125', equipmentType: 'herramienta', isActive: false },
]

describe('catalog filters', () => {
  it('filters materials by description', () => {
    expect(filterMaterials(materials, { q: 'cemento' }).map((item) => item.code)).toEqual(['MAT-001'])
  })

  it('filters materials by code', () => {
    expect(filterMaterials(materials, { q: 'MAT-002' }).map((item) => item.description)).toEqual(['Arena fina'])
  })

  it('clears material filters by using empty/all values', () => {
    expect(filterMaterials(materials, { q: '', unit: 'all', status: 'all', cat1: 'all', cat2: 'all' })).toHaveLength(2)
  })

  it('filters labor by role', () => {
    expect(filterLabor(labor, { q: 'maestro' }).map((item) => item.code)).toEqual(['MO-002'])
  })

  it('filters equipment by description', () => {
    expect(filterEquipment(equipment, { q: 'bomba' }).map((item) => item.code)).toEqual(['EQ-002'])
  })

  it('returns no results when filters do not match', () => {
    expect(filterEquipment(equipment, { q: 'inexistente' })).toEqual([])
  })
})
