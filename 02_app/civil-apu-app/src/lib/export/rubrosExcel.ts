import type ExcelJS from 'exceljs'
import { addTableSheet, createWorkbook, type ExcelRow } from './excel'

type DecimalLike = number | string | null | undefined | { toString(): string }

export type RubroSummaryExportRow = {
  code: string
  description: string
  unit: string
  directCost?: DecimalLike
  indirectPercentage?: DecimalLike
  unitPrice?: DecimalLike
  status: string
}

export type RubroComponentExportRow = Record<string, DecimalLike | string | boolean>

export type RubroDetailExport = RubroSummaryExportRow & {
  performanceValue?: DecimalLike
  performanceUnit?: string | null
  totals: {
    materialsSubtotal: number
    laborSubtotal: number
    equipmentSubtotal: number
    transportSubtotal: number
    directCost: number
    indirectCost: number
    unitPrice: number
  }
  materials: RubroComponentExportRow[]
  labor: RubroComponentExportRow[]
  equipment: RubroComponentExportRow[]
  transport: RubroComponentExportRow[]
}

function toNumber(value: DecimalLike): number | null {
  if (value === null || value === undefined) return null
  const numeric = typeof value === 'number' ? value : Number(value.toString())
  return Number.isFinite(numeric) ? numeric : null
}

export function buildRubrosSummaryWorkbook(rubros: RubroSummaryExportRow[]): ExcelJS.Workbook {
  const workbook = createWorkbook()

  addTableSheet(
    workbook,
    'Resumen Rubros',
    [
      { header: 'Codigo', key: 'code', width: 14 },
      { header: 'Descripcion', key: 'description', width: 42 },
      { header: 'Unidad', key: 'unit', width: 12 },
      { header: 'Costo directo', key: 'directCost', width: 16, numFmt: '#,##0.00' },
      { header: 'Indirectos ref.', key: 'indirectPercentage', width: 16, numFmt: '0.00' },
      { header: 'Precio unitario', key: 'unitPrice', width: 16, numFmt: '#,##0.00' },
      { header: 'Estado', key: 'status', width: 14 },
    ],
    rubros.map((rubro) => ({
      code: rubro.code,
      description: rubro.description,
      unit: rubro.unit,
      directCost: toNumber(rubro.directCost),
      indirectPercentage: toNumber(rubro.indirectPercentage),
      unitPrice: toNumber(rubro.unitPrice),
      status: rubro.status,
    })),
  )

  return workbook
}

export function buildRubroWorkbook(rubro: RubroDetailExport): ExcelJS.Workbook {
  const workbook = createWorkbook()
  const performance = rubro.performanceValue
    ? `${rubro.performanceValue.toString()} ${rubro.performanceUnit ?? ''}`.trim()
    : '-'

  addTableSheet(
    workbook,
    'Resumen APU',
    [
      { header: 'Campo', key: 'field', width: 28 },
      { header: 'Valor', key: 'value', width: 28 },
    ],
    [
      { field: 'Codigo', value: rubro.code },
      { field: 'Descripcion', value: rubro.description },
      { field: 'Unidad', value: rubro.unit },
      { field: 'Rendimiento', value: performance },
      { field: 'Total materiales', value: rubro.totals.materialsSubtotal },
      { field: 'Total mano de obra', value: rubro.totals.laborSubtotal },
      { field: 'Total equipos', value: rubro.totals.equipmentSubtotal },
      { field: 'Total transporte', value: rubro.totals.transportSubtotal },
      { field: 'Costo directo', value: rubro.totals.directCost },
      { field: 'Indirectos', value: rubro.totals.indirectCost },
      { field: 'Precio unitario final', value: rubro.totals.unitPrice },
    ],
  )

  addTableSheet(workbook, 'Materiales', componentColumns('Precio', 'Total'), rubro.materials.map(normalizeComponentRow))
  addTableSheet(workbook, 'Mano de obra', componentColumns('Tarifa', 'Total'), rubro.labor.map(normalizeComponentRow))
  addTableSheet(workbook, 'Equipos', componentColumns('Tarifa', 'Total'), rubro.equipment.map(normalizeComponentRow))
  addTableSheet(workbook, 'Transporte', componentColumns('Tarifa', 'Total'), rubro.transport.map(normalizeComponentRow))

  return workbook
}

function componentColumns(unitCostHeader: string, totalHeader: string) {
  return [
    { header: 'Codigo', key: 'code', width: 14 },
    { header: 'Descripcion', key: 'description', width: 42 },
    { header: 'Unidad', key: 'unit', width: 12 },
    { header: 'Cantidad', key: 'quantity', width: 14, numFmt: '#,##0.0000' },
    { header: unitCostHeader, key: 'unitCost', width: 14, numFmt: '#,##0.00' },
    { header: totalHeader, key: 'totalCost', width: 14, numFmt: '#,##0.00' },
    { header: 'Observacion', key: 'notes', width: 28 },
  ]
}

function normalizeComponentRow(row: RubroComponentExportRow): ExcelRow {
  return {
    code: String(row.code ?? '-'),
    description: String(row.description ?? '-'),
    unit: String(row.unit ?? '-'),
    quantity: toNumber(row.quantity as DecimalLike),
    unitCost: toNumber(row.unitCost as DecimalLike),
    totalCost: toNumber(row.totalCost as DecimalLike),
    notes: String(row.notes ?? ''),
  }
}
