import type ExcelJS from 'exceljs'
import type { BudgetConsolidation } from '../calculations/budgetConsolidation'
import { addTableSheet, createWorkbook } from './excel'

type DecimalLike = number | string | null | undefined | { toString(): string }

export type BudgetExportData = {
  projectName: string
  budgetName: string
  budgetCode?: string | null
  createdAt?: Date
  indirectPercentage?: DecimalLike
  ivaPercentage?: DecimalLike
  subtotal?: DecimalLike
  ivaAmount?: DecimalLike
  total?: DecimalLike
  items: Array<{
    itemNumber: string
    rubroCodeSnapshot: string
    descriptionSnapshot: string
    technicalSpecificationSnapshot?: string | null
    unitSnapshot: string
    quantity: DecimalLike
    directCostSnapshot: DecimalLike
    indirectCostSnapshot: DecimalLike
    unitPriceSnapshot: DecimalLike
    subtotalSnapshot: DecimalLike
    totalPrice: DecimalLike
  }>
}

function toNumber(value: DecimalLike): number {
  if (value === null || value === undefined) return 0
  const numeric = typeof value === 'number' ? value : Number(value.toString())
  return Number.isFinite(numeric) ? numeric : 0
}

export function buildBudgetWorkbook(budget: BudgetExportData, consolidation: BudgetConsolidation): ExcelJS.Workbook {
  const workbook = createWorkbook()
  const subtotal = toNumber(budget.subtotal)
  const total = toNumber(budget.total) || subtotal
  const ivaAmount = toNumber(budget.ivaAmount)
  const indirectPercentage = toNumber(budget.indirectPercentage)
  const directAmount = budget.items.reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.directCostSnapshot), 0)
  const indirectAmount = budget.items.reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.indirectCostSnapshot), 0)

  addTableSheet(
    workbook,
    'Resumen Presupuesto',
    [
      { header: 'Campo', key: 'field', width: 28 },
      { header: 'Valor', key: 'value', width: 32 },
    ],
    [
      { field: 'Proyecto', value: budget.projectName },
      { field: 'Presupuesto', value: budget.budgetCode ? `${budget.budgetCode} - ${budget.budgetName}` : budget.budgetName },
      { field: 'Fecha', value: budget.createdAt?.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10) },
      { field: 'Indirectos', value: `${indirectPercentage}%` },
      { field: 'Costo directo', value: directAmount },
      { field: 'Valor indirectos', value: indirectAmount },
      { field: 'Total ofertado', value: subtotal },
      { field: 'IVA', value: ivaAmount },
      { field: 'Total presupuesto', value: total },
    ],
  )

  addTableSheet(
    workbook,
    'Rubros del Presupuesto',
    [
      { header: 'No.', key: 'itemNumber', width: 10 },
      { header: 'Codigo', key: 'code', width: 14 },
      { header: 'Descripcion', key: 'description', width: 42 },
      { header: 'Especificacion tecnica', key: 'technicalSpecification', width: 48 },
      { header: 'Unidad', key: 'unit', width: 12 },
      { header: 'Cantidad', key: 'quantity', width: 14, numFmt: '#,##0.0000' },
      { header: 'Precio unitario', key: 'unitPrice', width: 16, numFmt: '#,##0.00' },
      { header: 'Subtotal', key: 'subtotal', width: 16, numFmt: '#,##0.00' },
    ],
    budget.items.map((item) => ({
      itemNumber: item.itemNumber,
      code: item.rubroCodeSnapshot,
      description: item.descriptionSnapshot,
      technicalSpecification: item.technicalSpecificationSnapshot ?? '',
      unit: item.unitSnapshot,
      quantity: toNumber(item.quantity),
      unitPrice: toNumber(item.unitPriceSnapshot),
      subtotal: toNumber(item.subtotalSnapshot) || toNumber(item.totalPrice),
    })),
  )

  addTableSheet(
    workbook,
    'Materiales Consolidados',
    [
      { header: 'Codigo', key: 'code', width: 14 },
      { header: 'Descripcion', key: 'description', width: 42 },
      { header: 'Unidad', key: 'unit', width: 12 },
      { header: 'Cantidad total', key: 'totalQuantity', width: 16, numFmt: '#,##0.0000' },
      { header: 'Costo unitario', key: 'unitCost', width: 16, numFmt: '#,##0.00' },
      { header: 'Costo total', key: 'totalCost', width: 16, numFmt: '#,##0.00' },
    ],
    consolidation.materials.map((row) => ({
      code: row.code,
      description: row.description,
      unit: row.unit,
      totalQuantity: row.totalQuantity,
      unitCost: row.unitCost,
      totalCost: row.totalCost,
    })),
  )

  addResourceSheet(workbook, 'Mano de Obra Consolidada', consolidation.labor)
  addResourceSheet(workbook, 'Equipos Consolidados', consolidation.equipment)
  addTableSheet(
    workbook,
    'Transporte Consolidado',
    [
      { header: 'Codigo', key: 'code', width: 14 },
      { header: 'Descripcion', key: 'description', width: 42 },
      { header: 'Unidad', key: 'unit', width: 12 },
      { header: 'Cantidad total', key: 'totalQuantity', width: 16, numFmt: '#,##0.0000' },
      { header: 'Distancia', key: 'distance', width: 12 },
      { header: 'Tarifa', key: 'unitCost', width: 16, numFmt: '#,##0.00' },
      { header: 'Costo total', key: 'totalCost', width: 16, numFmt: '#,##0.00' },
    ],
    consolidation.transport.map((row) => ({
      code: row.code,
      description: row.description,
      unit: row.unit,
      totalQuantity: row.totalQuantity,
      distance: row.distance,
      unitCost: row.unitCost,
      totalCost: row.totalCost,
    })),
  )

  return workbook
}

function addResourceSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  rows: BudgetConsolidation['labor'] | BudgetConsolidation['equipment'],
) {
  addTableSheet(
    workbook,
    name,
    [
      { header: 'Codigo', key: 'code', width: 14 },
      { header: 'Descripcion', key: 'description', width: 42 },
      { header: 'Unidad', key: 'unit', width: 12 },
      { header: 'Cantidad total', key: 'totalQuantity', width: 16, numFmt: '#,##0.0000' },
      { header: 'Tarifa', key: 'unitCost', width: 16, numFmt: '#,##0.00' },
      { header: 'Costo total', key: 'totalCost', width: 16, numFmt: '#,##0.00' },
    ],
    rows.map((row) => ({
      code: row.code,
      description: row.description,
      unit: row.unit,
      totalQuantity: row.totalQuantity,
      unitCost: row.unitCost,
      totalCost: row.totalCost,
    })),
  )
}
