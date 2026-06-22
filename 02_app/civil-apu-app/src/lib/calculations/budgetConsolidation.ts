type DecimalInput = number | string | { toString(): string }

type DenominationInput = {
  id?: string | null
  code?: string | null
  name?: string | null
} | null | undefined

type BudgetIpcoComponentType = 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'TRANSPORT'

type CatalogMetadataInput = {
  denominationId?: string | null
  cpc?: string | null
  vae?: DecimalInput | null
  denomination?: DenominationInput
}

type MaterialLineInput = {
  id: string
  materialId: string
  quantity: DecimalInput
  unit?: string | null
  unitCostSnapshot: DecimalInput
  material?: {
    code?: string | null
    description: string
    unit: string
    usesCategory1: boolean
    usesCategory2: boolean
  } & CatalogMetadataInput | null
}

type LaborLineInput = {
  id: string
  laborItemId: string
  workerQuantity: DecimalInput
  hourlyCostSnapshot: DecimalInput
  laborItem?: {
    code?: string | null
    roleName: string
  } & CatalogMetadataInput | null
}

type EquipmentLineInput = {
  id: string
  equipmentItemId: string
  equipmentQuantity: DecimalInput
  rateSnapshot: DecimalInput
  equipmentItem?: {
    code?: string | null
    description: string
  } & CatalogMetadataInput | null
}

type TransportLineInput = {
  id: string
  denominationId?: string | null
  code?: string | null
  description: string
  unit?: string | null
  quantity: DecimalInput
  unitCost: DecimalInput
  denomination?: DenominationInput
}

export type BudgetConsolidationInput = {
  ipcoOverrides?: BudgetIpcoOverrideInput[]
  items: Array<{
    quantity: DecimalInput
    rubro?: {
      materials?: MaterialLineInput[]
      labor?: LaborLineInput[]
      equipment?: EquipmentLineInput[]
      transport?: TransportLineInput[]
    } | null
  }>
}

type BudgetIpcoOverrideInput = {
  componentType: BudgetIpcoComponentType
  componentId: string
  originalDenomination?: DenominationInput
  overrideDenomination?: DenominationInput
}

type EffectiveDenomination = {
  id: string
  originalId: string
  label: string
  originalLabel: string
  isOverride: boolean
}

type ConsolidatedIpcoMetadata = {
  componentType: BudgetIpcoComponentType
  componentIds: string[]
  originalDenominationId: string
  denominationId: string
  denomination: string
  originalDenomination: string
  isDenominationOverride: boolean
}

export type ConsolidatedMaterial = {
  key: string
  code: string
  description: string
  unit: string
  totalQuantity: number
  unitCost: number
  totalCost: number
  usesCategory1: boolean
  usesCategory2: boolean
  cpc: string
  vae: string
} & ConsolidatedIpcoMetadata

export type ConsolidatedLabor = {
  key: string
  code: string
  description: string
  unit: string
  totalQuantity: number
  unitCost: number
  totalCost: number
  cpc: string
  vae: string
} & ConsolidatedIpcoMetadata

export type ConsolidatedEquipment = ConsolidatedLabor

export type ConsolidatedTransport = {
  key: string
  code: string
  description: string
  unit: string
  distance: string
  unitCost: number
  totalQuantity: number
  totalCost: number
  cpc: string
  vae: string
} & ConsolidatedIpcoMetadata

export type BudgetConsolidation = {
  materials: ConsolidatedMaterial[]
  labor: ConsolidatedLabor[]
  equipment: ConsolidatedEquipment[]
  transport: ConsolidatedTransport[]
  totals: {
    materials: number
    labor: number
    equipment: number
    transport: number
  }
}

function toNumber(value: DecimalInput): number {
  const number = typeof value === 'number' ? value : Number(value.toString())

  if (!Number.isFinite(number)) {
    throw new Error('Budget consolidation value must be finite')
  }

  return number
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}

function sortByCodeAndDescription<T extends { code: string; description: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const byCode = a.code.localeCompare(b.code)
    return byCode !== 0 ? byCode : a.description.localeCompare(b.description)
  })
}

function formatOptionalDecimal(value: DecimalInput | null | undefined): string {
  return value === null || value === undefined ? '' : value.toString()
}

function formatDenomination(denomination: DenominationInput): string {
  if (!denomination) return ''
  return [denomination.code, denomination.name].filter(Boolean).join(' - ')
}

function denominationKey(denomination: EffectiveDenomination): string {
  return denomination.id || denomination.label || 'sin-ipco'
}

function buildOverrideMap(overrides: BudgetIpcoOverrideInput[] | undefined): Map<string, BudgetIpcoOverrideInput> {
  const map = new Map<string, BudgetIpcoOverrideInput>()

  for (const override of overrides ?? []) {
    map.set(`${override.componentType}:${override.componentId}`, override)
  }

  return map
}

function getEffectiveDenomination(
  overrideMap: Map<string, BudgetIpcoOverrideInput>,
  componentType: BudgetIpcoComponentType,
  componentId: string,
  catalogDenomination: DenominationInput,
): EffectiveDenomination {
  const override = overrideMap.get(`${componentType}:${componentId}`)
  const original = override?.originalDenomination ?? catalogDenomination
  const effective = override?.overrideDenomination ?? original

  return {
    id: effective?.id ?? '',
    originalId: original?.id ?? '',
    label: formatDenomination(effective),
    originalLabel: formatDenomination(original),
    isOverride: Boolean(override?.overrideDenomination),
  }
}

function mergeIpcoMetadata(target: ConsolidatedIpcoMetadata, componentId: string, denomination: EffectiveDenomination) {
  if (!target.componentIds.includes(componentId)) {
    target.componentIds.push(componentId)
  }
  target.isDenominationOverride = target.isDenominationOverride || denomination.isOverride
}

export function consolidateBudgetComponents(budget: BudgetConsolidationInput): BudgetConsolidation {
  const materials = new Map<string, ConsolidatedMaterial>()
  const labor = new Map<string, ConsolidatedLabor>()
  const equipment = new Map<string, ConsolidatedEquipment>()
  const transport = new Map<string, ConsolidatedTransport>()
  const overrideMap = buildOverrideMap(budget.ipcoOverrides)

  for (const item of budget.items) {
    const budgetQuantity = toNumber(item.quantity)
    const rubro = item.rubro

    if (!rubro) continue

    for (const line of rubro.materials ?? []) {
      const quantity = roundQuantity(budgetQuantity * toNumber(line.quantity))
      const unitCost = toNumber(line.unitCostSnapshot)
      const totalCost = roundMoney(quantity * unitCost)
      const material = line.material
      const denomination = getEffectiveDenomination(overrideMap, 'MATERIAL', line.id, material?.denomination)
      const key = `${line.materialId}|${denominationKey(denomination)}`
      const existing = materials.get(key)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
        mergeIpcoMetadata(existing, line.id, denomination)
      } else {
        materials.set(key, {
          key,
          componentType: 'MATERIAL',
          componentIds: [line.id],
          originalDenominationId: denomination.originalId,
          code: material?.code ?? '-',
          description: material?.description ?? 'Material sin descripcion',
          unit: line.unit ?? material?.unit ?? '-',
          totalQuantity: quantity,
          unitCost,
          totalCost,
          usesCategory1: material?.usesCategory1 ?? false,
          usesCategory2: material?.usesCategory2 ?? false,
          cpc: material?.cpc ?? '',
          vae: formatOptionalDecimal(material?.vae),
          denominationId: denomination.id,
          denomination: denomination.label,
          originalDenomination: denomination.originalLabel,
          isDenominationOverride: denomination.isOverride,
        })
      }
    }

    for (const line of rubro.labor ?? []) {
      const quantity = roundQuantity(budgetQuantity * toNumber(line.workerQuantity))
      const unitCost = toNumber(line.hourlyCostSnapshot)
      const totalCost = roundMoney(quantity * unitCost)
      const itemLabor = line.laborItem
      const denomination = getEffectiveDenomination(overrideMap, 'LABOR', line.id, itemLabor?.denomination)
      const key = `${line.laborItemId}|${denominationKey(denomination)}`
      const existing = labor.get(key)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
        mergeIpcoMetadata(existing, line.id, denomination)
      } else {
        labor.set(key, {
          key,
          componentType: 'LABOR',
          componentIds: [line.id],
          originalDenominationId: denomination.originalId,
          code: itemLabor?.code ?? '-',
          description: itemLabor?.roleName ?? 'Mano de obra sin descripcion',
          unit: 'hora',
          totalQuantity: quantity,
          unitCost,
          totalCost,
          cpc: itemLabor?.cpc ?? '',
          vae: formatOptionalDecimal(itemLabor?.vae),
          denominationId: denomination.id,
          denomination: denomination.label,
          originalDenomination: denomination.originalLabel,
          isDenominationOverride: denomination.isOverride,
        })
      }
    }

    for (const line of rubro.equipment ?? []) {
      const quantity = roundQuantity(budgetQuantity * toNumber(line.equipmentQuantity))
      const unitCost = toNumber(line.rateSnapshot)
      const totalCost = roundMoney(quantity * unitCost)
      const itemEquipment = line.equipmentItem
      const denomination = getEffectiveDenomination(overrideMap, 'EQUIPMENT', line.id, itemEquipment?.denomination)
      const key = `${line.equipmentItemId}|${denominationKey(denomination)}`
      const existing = equipment.get(key)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
        mergeIpcoMetadata(existing, line.id, denomination)
      } else {
        equipment.set(key, {
          key,
          componentType: 'EQUIPMENT',
          componentIds: [line.id],
          originalDenominationId: denomination.originalId,
          code: itemEquipment?.code ?? '-',
          description: itemEquipment?.description ?? 'Equipo sin descripcion',
          unit: 'hora',
          totalQuantity: quantity,
          unitCost,
          totalCost,
          cpc: itemEquipment?.cpc ?? '',
          vae: formatOptionalDecimal(itemEquipment?.vae),
          denominationId: denomination.id,
          denomination: denomination.label,
          originalDenomination: denomination.originalLabel,
          isDenominationOverride: denomination.isOverride,
        })
      }
    }

    for (const line of rubro.transport ?? []) {
      const unit = line.unit ?? '-'
      const unitCost = toNumber(line.unitCost)
      const denomination = getEffectiveDenomination(overrideMap, 'TRANSPORT', line.id, line.denomination)
      const key = `${line.description.trim().toLowerCase()}|${unit}|${unitCost}|${denominationKey(denomination)}`
      const quantity = roundQuantity(budgetQuantity * toNumber(line.quantity))
      const totalCost = roundMoney(quantity * unitCost)
      const existing = transport.get(key)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
        mergeIpcoMetadata(existing, line.id, denomination)
      } else {
        transport.set(key, {
          key,
          componentType: 'TRANSPORT',
          componentIds: [line.id],
          originalDenominationId: denomination.originalId,
          code: line.code ?? '-',
          description: line.description,
          unit,
          distance: '-',
          totalQuantity: quantity,
          unitCost,
          totalCost,
          cpc: '',
          vae: '',
          denominationId: denomination.id,
          denomination: denomination.label,
          originalDenomination: denomination.originalLabel,
          isDenominationOverride: denomination.isOverride,
        })
      }
    }
  }

  const materialRows = sortByCodeAndDescription([...materials.values()])
  const laborRows = sortByCodeAndDescription([...labor.values()])
  const equipmentRows = sortByCodeAndDescription([...equipment.values()])
  const transportRows = sortByCodeAndDescription([...transport.values()])

  return {
    materials: materialRows,
    labor: laborRows,
    equipment: equipmentRows,
    transport: transportRows,
    totals: {
      materials: roundMoney(materialRows.reduce((sum, item) => sum + item.totalCost, 0)),
      labor: roundMoney(laborRows.reduce((sum, item) => sum + item.totalCost, 0)),
      equipment: roundMoney(equipmentRows.reduce((sum, item) => sum + item.totalCost, 0)),
      transport: roundMoney(transportRows.reduce((sum, item) => sum + item.totalCost, 0)),
    },
  }
}
