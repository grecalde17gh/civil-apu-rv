import { describe, expect, it } from 'vitest'
import { filterCatalogOptions, formatCatalogOption, type CatalogSearchOption } from '../catalogSearch'

const options: CatalogSearchOption[] = [
  { id: 'mat-1', label: formatCatalogOption(['MAT-001', 'Cemento Portland', 'kg'], '7.50'), searchText: 'MAT-001 Cemento Portland kg 7.50' },
  { id: 'mat-2', label: formatCatalogOption(['MAT-002', 'Arena fina', 'm3'], '12.00'), searchText: 'MAT-002 Arena fina m3 12.00' },
  { id: 'mo-1', label: formatCatalogOption(['MO-003', 'Maestro albanil', 'hora'], '4.25'), searchText: 'MO-003 Maestro albanil hora 4.25' },
  { id: 'eq-1', label: formatCatalogOption(['EQ-002', 'Concretera', 'hora'], '12.00'), searchText: 'EQ-002 Concretera hora 12.00' },
]

describe('catalog search options', () => {
  it('finds a material by code', () => {
    expect(filterCatalogOptions(options, 'MAT-001').map((option) => option.id)).toEqual(['mat-1'])
  })

  it('finds a material by description', () => {
    expect(filterCatalogOptions(options, 'cemento').map((option) => option.id)).toEqual(['mat-1'])
  })

  it('finds labor by role', () => {
    expect(filterCatalogOptions(options, 'maestro').map((option) => option.id)).toEqual(['mo-1'])
  })

  it('finds equipment by description', () => {
    expect(filterCatalogOptions(options, 'concretera').map((option) => option.id)).toEqual(['eq-1'])
  })

  it('limits results so large catalogs do not render every option', () => {
    expect(filterCatalogOptions(options, '', 2)).toHaveLength(2)
  })
})
