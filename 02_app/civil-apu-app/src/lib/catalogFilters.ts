type DecimalLike = { toString(): string } | number | string | null | undefined

export type CatalogFilterParams = {
  q?: string
  unit?: string
  status?: string
  category?: string
  type?: string
  cat1?: string
  cat2?: string
  minCost?: string
  maxCost?: string
}

export type MaterialFilterItem = {
  code: string | null
  description: string
  unit: string
  unitCost: DecimalLike
  cpc?: string | null
  vae?: DecimalLike
  usesCategory1: boolean
  usesCategory2: boolean
  isActive: boolean
}

export type LaborFilterItem = {
  code: string | null
  roleName: string
  hourlyCost: DecimalLike
  cpc?: string | null
  vae?: DecimalLike
  category?: string | null
  isActive: boolean
}

export type EquipmentFilterItem = {
  code: string | null
  description: string
  hourlyRate: DecimalLike
  cpc?: string | null
  vae?: DecimalLike
  equipmentType?: string | null
  isActive: boolean
}

function normalize(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function decimalToNumber(value: DecimalLike): number | null {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const parsed = Number(value.toString().trim().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function matchesText(haystack: Array<unknown>, query: string | undefined): boolean {
  const needle = normalize(query)
  if (!needle) return true
  return haystack.some((value) => normalize(value).includes(needle))
}

function matchesSelect(value: unknown, filter: string | undefined): boolean {
  if (!filter || filter === 'all') return true
  return normalize(value) === normalize(filter)
}

function matchesStatus(isActive: boolean, status: string | undefined): boolean {
  if (!status || status === 'all') return true
  return status === 'active' ? isActive : !isActive
}

function matchesBoolean(value: boolean, filter: string | undefined): boolean {
  if (!filter || filter === 'all') return true
  return filter === 'yes' ? value : !value
}

function matchesRange(value: DecimalLike, min: string | undefined, max: string | undefined): boolean {
  const number = decimalToNumber(value) ?? 0
  const minNumber = decimalToNumber(min)
  const maxNumber = decimalToNumber(max)

  if (minNumber !== null && number < minNumber) return false
  if (maxNumber !== null && number > maxNumber) return false
  return true
}

export function filterMaterials<T extends MaterialFilterItem>(items: T[], filters: CatalogFilterParams): T[] {
  return items.filter((item) => {
    return (
      matchesText([item.code, item.description, item.cpc, item.vae], filters.q) &&
      matchesSelect(item.unit, filters.unit) &&
      matchesStatus(item.isActive, filters.status) &&
      matchesBoolean(item.usesCategory1, filters.cat1) &&
      matchesBoolean(item.usesCategory2, filters.cat2) &&
      matchesRange(item.unitCost, filters.minCost, filters.maxCost)
    )
  })
}

export function filterLabor<T extends LaborFilterItem>(items: T[], filters: CatalogFilterParams): T[] {
  return items.filter((item) => {
    return (
      matchesText([item.code, item.roleName, item.cpc, item.vae], filters.q) &&
      matchesSelect(item.category, filters.category) &&
      matchesStatus(item.isActive, filters.status) &&
      matchesRange(item.hourlyCost, filters.minCost, filters.maxCost)
    )
  })
}

export function filterEquipment<T extends EquipmentFilterItem>(items: T[], filters: CatalogFilterParams): T[] {
  return items.filter((item) => {
    return (
      matchesText([item.code, item.description, item.cpc, item.vae], filters.q) &&
      matchesSelect(item.equipmentType, filters.type) &&
      matchesStatus(item.isActive, filters.status) &&
      matchesRange(item.hourlyRate, filters.minCost, filters.maxCost)
    )
  })
}
