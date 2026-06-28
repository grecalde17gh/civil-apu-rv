import type {
  BudgetConsolidation,
  ConsolidatedEquipment,
  ConsolidatedLabor,
  ConsolidatedMaterial,
  ConsolidatedTransport,
} from './budgetConsolidation'

type ConsolidatedComponent = ConsolidatedMaterial | ConsolidatedLabor | ConsolidatedEquipment | ConsolidatedTransport

export const POLYNOMIAL_TERMS = ['B', 'A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'X'] as const
const AVAILABLE_DENOMINATION_TERMS = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const
const NON_MAIN_DENOMINATION = 'componentes no principales'
const OCCUPATIONAL_STRUCTURE_FALLBACK = 'SN'

export type PolynomialTerm = (typeof POLYNOMIAL_TERMS)[number]
export type PolynomialComponentType = 'Material' | 'Mano de obra' | 'Equipo' | 'Transporte'

export type PolynomialTermComponent = {
  key: string
  type: PolynomialComponentType
  code: string
  description: string
  unit: string
  unitCost: number
  totalCost: number
  denomination: string
  denominationId: string
  originalDenomination: string
  originalDenominationId: string
  isDenominationOverride: boolean
  componentType: ConsolidatedComponent['componentType']
  componentIds: string[]
}

export type PolynomialTermRow = {
  key: string
  term: PolynomialTerm | null
  grouping: string
  type: string
  totalCost: number
  percentage: number
  componentCount: number
  components: PolynomialTermComponent[]
  requiresRecategorization: boolean
}

export type LaborDenominationBreakdownRow = {
  key: string
  denomination: string
  totalCost: number
  percentageWithinLabor: number
  percentageOfDirectCost: number
  componentCount: number
}

export type LaborCrewRow = {
  key: string
  description: string
  totalCost: number
  coefficient: number
  componentCount: number
}

export type BudgetPolynomialTerms = {
  rows: PolynomialTermRow[]
  laborBreakdown: LaborDenominationBreakdownRow[]
  laborCrew: LaborCrewRow[]
  termXPercentage: number
  exceedsTermXLimit: boolean
  exceedsTermLimit: boolean
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function toComponent(
  row: ConsolidatedComponent,
  type: PolynomialComponentType,
  key: string,
): PolynomialTermComponent {
  return {
    key,
    type,
    code: row.code,
    description: row.description,
    unit: row.unit,
    unitCost: row.unitCost,
    totalCost: row.totalCost,
    denomination: row.denomination || 'Sin denominación IPCO',
    denominationId: row.denominationId,
    originalDenomination: row.originalDenomination,
    originalDenominationId: row.originalDenominationId,
    isDenominationOverride: row.isDenominationOverride,
    componentType: row.componentType,
    componentIds: row.componentIds,
  }
}

function buildComponents(consolidation: BudgetConsolidation): PolynomialTermComponent[] {
  return [
    ...consolidation.materials.map((row) => toComponent(row, 'Material', `material-${row.key}`)),
    ...consolidation.labor.map((row) => toComponent(row, 'Mano de obra', `labor-${row.key}`)),
    ...consolidation.equipment.map((row) => toComponent(row, 'Equipo', `equipment-${row.key}`)),
    ...consolidation.transport.map((row) => toComponent(row, 'Transporte', `transport-${row.key}`)),
  ]
}

function isNonMainDenomination(denomination: string): boolean {
  return normalize(denomination).includes(NON_MAIN_DENOMINATION)
}

function percentage(total: number, whole: number): number {
  return whole > 0 ? (total / whole) * 100 : 0
}

function coefficient(total: number, whole: number): number {
  return whole > 0 ? total / whole : 0
}

function getTermOrder(term: PolynomialTerm | null): number {
  return term ? POLYNOMIAL_TERMS.indexOf(term) : POLYNOMIAL_TERMS.length
}

function extractOccupationalStructureCode(component: PolynomialTermComponent): string {
  const source = component.description.trim() || component.denomination.trim()
  const match = source.match(/[A-Za-z]\d/)
  return (match?.[0] ?? OCCUPATIONAL_STRUCTURE_FALLBACK).toUpperCase()
}

function cleanLaborDescription(component: PolynomialTermComponent, structureCode: string): string {
  const normalizedCode = structureCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return component.description
    .replace(new RegExp(`^\\s*${normalizedCode}\\s*[-–—:]?\\s*`, 'i'), '')
    .trim() || component.description
}

function createLaborCrew(laborComponents: PolynomialTermComponent[], laborTotal: number): LaborCrewRow[] {
  const byStructure = new Map<string, PolynomialTermComponent[]>()

  for (const component of laborComponents) {
    const structureCode = extractOccupationalStructureCode(component)
    byStructure.set(structureCode, [...(byStructure.get(structureCode) ?? []), component])
  }

  const rows: LaborCrewRow[] = []

  for (const [structureCode, components] of byStructure.entries()) {
    const byRate = new Map<string, PolynomialTermComponent[]>()

    for (const component of components) {
      const rate = component.unitCost.toFixed(4)
      byRate.set(rate, [
        ...(byRate.get(rate) ?? []),
        component,
      ])
    }

    const rateGroups = [...byRate.entries()]
      .map(([rate, group]) => ({
        rate,
        components: group,
        totalCost: roundMoney(group.reduce((sum, component) => sum + component.totalCost, 0)),
      }))
      .sort((a, b) => b.components.length - a.components.length || b.totalCost - a.totalCost || a.rate.localeCompare(b.rate))

    if (rateGroups.length === 1) {
      const group = rateGroups[0]
      rows.push({
        key: `structure-${structureCode}`,
        description: `ESTRUCTURA OCUPACIONAL ${structureCode}`,
        totalCost: group.totalCost,
        coefficient: coefficient(group.totalCost, laborTotal),
        componentCount: group.components.reduce((sum, component) => sum + component.componentIds.length, 0),
      })
      continue
    }

    const [commonGroup, ...differentGroups] = rateGroups
    rows.push({
      key: `structure-${structureCode}-common-${commonGroup.rate}`,
      description: `ESTRUCTURA OCUPACIONAL ${structureCode}`,
      totalCost: commonGroup.totalCost,
      coefficient: coefficient(commonGroup.totalCost, laborTotal),
      componentCount: commonGroup.components.reduce((sum, component) => sum + component.componentIds.length, 0),
    })

    for (const group of differentGroups) {
      for (const component of group.components) {
        rows.push({
          key: `structure-${structureCode}-${component.key}`,
          description: `ESTRUCTURA OCUPACIONAL ${structureCode} - ${cleanLaborDescription(component, structureCode)}`,
          totalCost: roundMoney(component.totalCost),
          coefficient: coefficient(component.totalCost, laborTotal),
          componentCount: component.componentIds.length,
        })
      }
    }
  }

  return rows.sort((a, b) => b.coefficient - a.coefficient || a.description.localeCompare(b.description))
}

function createRow(params: Omit<PolynomialTermRow, 'totalCost' | 'percentage' | 'componentCount'>): PolynomialTermRow {
  const totalCost = roundMoney(params.components.reduce((sum, component) => sum + component.totalCost, 0))

  return {
    ...params,
    totalCost,
    percentage: 0,
    componentCount: params.components.reduce((sum, component) => sum + component.componentIds.length, 0),
  }
}

function applyFormulaCoefficients(rows: PolynomialTermRow[]): PolynomialTermRow[] {
  const formulaTotal = roundMoney(rows.reduce((sum, row) => sum + row.totalCost, 0))

  return rows.map((row) => ({
    ...row,
    percentage: percentage(row.totalCost, formulaTotal),
  }))
}

export function buildBudgetPolynomialTerms(
  consolidation: BudgetConsolidation,
  directCostTotal: number,
): BudgetPolynomialTerms {
  const components = buildComponents(consolidation)
  const laborComponents = components.filter((component) => component.type === 'Mano de obra')
  const nonMainComponents = components.filter(
    (component) => component.type !== 'Mano de obra' && isNonMainDenomination(component.denomination),
  )
  const regularComponents = components.filter(
    (component) => component.type !== 'Mano de obra' && !isNonMainDenomination(component.denomination),
  )
  const regularGroups = new Map<string, PolynomialTermComponent[]>()

  for (const component of regularComponents) {
    const key = component.denominationId || normalize(component.denomination) || 'sin-ipco'
    regularGroups.set(key, [...(regularGroups.get(key) ?? []), component])
  }

  const sortedRegularGroups = [...regularGroups.entries()]
    .map(([key, groupComponents]) => ({ key, components: groupComponents, grouping: groupComponents[0].denomination }))
    .sort((a, b) => a.grouping.localeCompare(b.grouping))

  const rows: PolynomialTermRow[] = []

  if (laborComponents.length > 0) {
    rows.push(createRow({
      key: 'labor',
      term: 'B',
      grouping: 'Mano de obra',
      type: 'Mano de obra',
      components: laborComponents,
      requiresRecategorization: false,
    }))
  }

  if (nonMainComponents.length > 0) {
    rows.push(createRow({
      key: 'non-main',
      term: 'X',
      grouping: 'Componentes no principales',
      type: [...new Set(nonMainComponents.map((component) => component.type))].join(', '),
      components: nonMainComponents,
      requiresRecategorization: false,
    }))
  }

  for (const [index, group] of sortedRegularGroups.entries()) {
    const term = AVAILABLE_DENOMINATION_TERMS[index] ?? null
    rows.push(createRow({
      key: group.key,
      term,
      grouping: group.grouping,
      type: [...new Set(group.components.map((component) => component.type))].join(', '),
      components: group.components,
      requiresRecategorization: term === null,
    }))
  }

  const coefficientRows = applyFormulaCoefficients(rows)

  const laborByDenomination = new Map<string, PolynomialTermComponent[]>()
  for (const component of laborComponents) {
    const key = component.denominationId || normalize(component.denomination) || 'sin-ipco'
    laborByDenomination.set(key, [...(laborByDenomination.get(key) ?? []), component])
  }

  const laborTotal = coefficientRows.find((row) => row.term === 'B')?.totalCost ?? 0
  const laborBreakdown = [...laborByDenomination.entries()]
    .map(([key, group]) => {
      const totalCost = roundMoney(group.reduce((sum, component) => sum + component.totalCost, 0))
      return {
        key,
        denomination: group[0].denomination,
        totalCost,
        percentageWithinLabor: percentage(totalCost, laborTotal),
        percentageOfDirectCost: percentage(totalCost, directCostTotal),
        componentCount: group.reduce((sum, component) => sum + component.componentIds.length, 0),
      }
    })
    .sort((a, b) => b.totalCost - a.totalCost || a.denomination.localeCompare(b.denomination))
  const laborCrew = createLaborCrew(laborComponents, laborTotal)

  const termXPercentage = coefficientRows.find((row) => row.term === 'X')?.percentage ?? 0
  const exceedsTermLimit = coefficientRows.length > POLYNOMIAL_TERMS.length || coefficientRows.some((row) => row.term === null)

  return {
    rows: coefficientRows.sort((a, b) => getTermOrder(a.term) - getTermOrder(b.term) || a.grouping.localeCompare(b.grouping)),
    laborBreakdown,
    laborCrew,
    termXPercentage,
    exceedsTermXLimit: termXPercentage > 10,
    exceedsTermLimit,
  }
}
