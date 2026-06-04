type DecimalInput = number | string | { toString(): string }

type MaterialLineInput = {
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
  } | null
}

type LaborLineInput = {
  laborItemId: string
  workerQuantity: DecimalInput
  hourlyCostSnapshot: DecimalInput
  laborItem?: {
    code?: string | null
    roleName: string
  } | null
}

type EquipmentLineInput = {
  equipmentItemId: string
  equipmentQuantity: DecimalInput
  rateSnapshot: DecimalInput
  equipmentItem?: {
    code?: string | null
    description: string
  } | null
}

type TransportLineInput = {
  id?: string
  code?: string | null
  description: string
  unit?: string | null
  quantity: DecimalInput
  unitCost: DecimalInput
}

export type BudgetConsolidationInput = {
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
}

export type ConsolidatedLabor = {
  key: string
  code: string
  description: string
  unit: string
  totalQuantity: number
  unitCost: number
  totalCost: number
}

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
}

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

export function consolidateBudgetComponents(budget: BudgetConsolidationInput): BudgetConsolidation {
  const materials = new Map<string, ConsolidatedMaterial>()
  const labor = new Map<string, ConsolidatedLabor>()
  const equipment = new Map<string, ConsolidatedEquipment>()
  const transport = new Map<string, ConsolidatedTransport>()

  for (const item of budget.items) {
    const budgetQuantity = toNumber(item.quantity)
    const rubro = item.rubro

    if (!rubro) continue

    for (const line of rubro.materials ?? []) {
      const quantity = roundQuantity(budgetQuantity * toNumber(line.quantity))
      const unitCost = toNumber(line.unitCostSnapshot)
      const totalCost = roundMoney(quantity * unitCost)
      const material = line.material
      const existing = materials.get(line.materialId)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
      } else {
        materials.set(line.materialId, {
          key: line.materialId,
          code: material?.code ?? '-',
          description: material?.description ?? 'Material sin descripcion',
          unit: line.unit ?? material?.unit ?? '-',
          totalQuantity: quantity,
          unitCost,
          totalCost,
          usesCategory1: material?.usesCategory1 ?? false,
          usesCategory2: material?.usesCategory2 ?? false,
        })
      }
    }

    for (const line of rubro.labor ?? []) {
      const quantity = roundQuantity(budgetQuantity * toNumber(line.workerQuantity))
      const unitCost = toNumber(line.hourlyCostSnapshot)
      const totalCost = roundMoney(quantity * unitCost)
      const itemLabor = line.laborItem
      const existing = labor.get(line.laborItemId)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
      } else {
        labor.set(line.laborItemId, {
          key: line.laborItemId,
          code: itemLabor?.code ?? '-',
          description: itemLabor?.roleName ?? 'Mano de obra sin descripcion',
          unit: 'hora',
          totalQuantity: quantity,
          unitCost,
          totalCost,
        })
      }
    }

    for (const line of rubro.equipment ?? []) {
      const quantity = roundQuantity(budgetQuantity * toNumber(line.equipmentQuantity))
      const unitCost = toNumber(line.rateSnapshot)
      const totalCost = roundMoney(quantity * unitCost)
      const itemEquipment = line.equipmentItem
      const existing = equipment.get(line.equipmentItemId)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
      } else {
        equipment.set(line.equipmentItemId, {
          key: line.equipmentItemId,
          code: itemEquipment?.code ?? '-',
          description: itemEquipment?.description ?? 'Equipo sin descripcion',
          unit: 'hora',
          totalQuantity: quantity,
          unitCost,
          totalCost,
        })
      }
    }

    for (const line of rubro.transport ?? []) {
      const unit = line.unit ?? '-'
      const unitCost = toNumber(line.unitCost)
      const key = `${line.description.trim().toLowerCase()}|${unit}|${unitCost}`
      const quantity = roundQuantity(budgetQuantity * toNumber(line.quantity))
      const totalCost = roundMoney(quantity * unitCost)
      const existing = transport.get(key)

      if (existing) {
        existing.totalQuantity = roundQuantity(existing.totalQuantity + quantity)
        existing.totalCost = roundMoney(existing.totalCost + totalCost)
      } else {
        transport.set(key, {
          key,
          code: line.code ?? '-',
          description: line.description,
          unit,
          distance: '-',
          totalQuantity: quantity,
          unitCost,
          totalCost,
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
