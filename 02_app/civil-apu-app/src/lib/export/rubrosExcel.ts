import type ExcelJS from 'exceljs'
import { addTableSheet, createWorkbook, sanitizeWorksheetName, type ExcelRow } from './excel'
import { calculateNpEpNd, calculateRelativeWeight, calculateVaeElement } from '../calculations/rubroComponentParticipation'
import { sumComponentSubtotal } from '../rubros/rubroDisplayTotals'

type DecimalLike = number | string | null | undefined | { toString(): string }

export type RubroSummaryExportRow = {
  code: string
  description: string
  technicalSpecification?: string | null
  unit: string
  directCost?: DecimalLike
  indirectPercentage?: DecimalLike
  unitPrice?: DecimalLike
  status: string
}

export type RubroComponentExportRow = Record<string, DecimalLike | string | boolean>

export type RubroDetailExport = RubroSummaryExportRow & {
  projectName?: string
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
  const worksheet = workbook.addWorksheet(sanitizeWorksheetName(rubro.code))
  const yellowFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFFF99' } }

  worksheet.views = [{ state: 'frozen', ySplit: 6 }]
  worksheet.columns = [
    { width: 14 },
    { width: 42 },
    { width: 12 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 28 },
  ]

  addMainTitle(worksheet, 'ANÁLISIS DE PRECIOS UNITARIOS')
  worksheet.addRow(['PROYECTO:', rubro.projectName ?? ''])
  worksheet.addRow(['RUBRO:', rubro.description])
  worksheet.addRow(['CÓDIGO:', rubro.code])
  worksheet.addRow(['PRECIO FINAL OFERTADO:', rubro.totals.unitPrice])
  worksheet.addRow(['UNIDAD:', rubro.unit, 'RENDIMIENTO:', toNumber(rubro.performanceValue), 'UNIDAD REND.:', rubro.performanceUnit ?? '', 'INDIRECTOS %:', toNumber(rubro.indirectPercentage)])
  if (rubro.technicalSpecification) {
    worksheet.addRow(['ESPECIFICACION TECNICA:', rubro.technicalSpecification])
  }
  worksheet.addRow([])
  ;[2, 3, 4, 5, 6].forEach((rowNumber) => {
    worksheet.getRow(rowNumber).font = { bold: true }
    worksheet.getRow(rowNumber).getCell(2).fill = yellowFill
  })
  worksheet.getRow(5).getCell(2).numFmt = '#,##0.00'

  addComponentSection(worksheet, 'Equipos', rubro.equipment, rubro.totals.directCost, yellowFill)
  addComponentSection(worksheet, 'Mano de obra', rubro.labor, rubro.totals.directCost, yellowFill)
  addComponentSection(worksheet, 'Materiales', rubro.materials, rubro.totals.directCost, yellowFill)
  addComponentSection(worksheet, 'Transporte', rubro.transport, rubro.totals.directCost, yellowFill)

  addFinalSummary(worksheet, rubro)

  return workbook
}

function addMainTitle(worksheet: ExcelJS.Worksheet, title: string) {
  const row = worksheet.addRow([title])
  row.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
  row.alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(row.number, 1, row.number, 13)
}

function addSectionTitle(worksheet: ExcelJS.Worksheet, title: string) {
  const row = worksheet.addRow([title])
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
  worksheet.mergeCells(row.number, 1, row.number, 13)
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
  row.alignment = { vertical: 'middle' }
}

function addComponentSection(
  worksheet: ExcelJS.Worksheet,
  title: string,
  rows: RubroComponentExportRow[],
  directTotal: number,
  inputFill: ExcelJS.Fill,
) {
  addSectionTitle(worksheet, title)
  const header = worksheet.addRow([
    'Codigo',
    'Estructura ocupacional',
    'Unidad',
    'Cantidad',
    'Rendimiento',
    'Tarifa / Precio',
    'Costo total',
    'Peso relativo %',
    'CPC elemento',
    'NP/EP/ND',
    'VAE %',
    'VAE % elemento',
    'Observacion',
  ])
  styleHeader(header)

  rows.map((row) => normalizeComponentRow(row, directTotal)).forEach((row) => {
    const excelRow = worksheet.addRow([
      row.code,
      row.description,
      row.unit,
      row.quantity,
      row.performance,
      row.unitCost,
      row.totalCost,
      row.relativeWeight,
      row.cpc,
      row.npEpNd,
      row.vae,
      row.vaeElement,
      row.notes,
    ])
    ;[4, 13].forEach((column) => {
      excelRow.getCell(column).fill = inputFill
    })
    formatComponentNumericCells(excelRow)
  })
  const subtotal = sumComponentSubtotal(
    rows.map((row) => ({ totalCost: row.totalCost as DecimalLike, vae: row.vae as DecimalLike })),
    directTotal,
  )
  const subtotalRow = worksheet.addRow(['SUBTOTAL', '', '', '', '', '', subtotal.totalCost, subtotal.relativeWeight, '', '', '', subtotal.vaeElement, ''])
  subtotalRow.font = { bold: true }
  subtotalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
  formatComponentNumericCells(subtotalRow)
  worksheet.addRow([])
}

function formatComponentNumericCells(row: ExcelJS.Row) {
  row.getCell(6).numFmt = '#,##0.00'
  row.getCell(7).numFmt = '#,##0.00'
  row.getCell(8).numFmt = '0.00000'
  row.getCell(11).numFmt = '0.00000'
  row.getCell(12).numFmt = '0.00000'
}

function addFinalSummary(worksheet: ExcelJS.Worksheet, rubro: RubroDetailExport) {
  const subtotals = [
    sumComponentSubtotal(rubro.equipment.map((row) => ({ totalCost: row.totalCost as DecimalLike, vae: row.vae as DecimalLike })), rubro.totals.directCost),
    sumComponentSubtotal(rubro.labor.map((row) => ({ totalCost: row.totalCost as DecimalLike, vae: row.vae as DecimalLike })), rubro.totals.directCost),
    sumComponentSubtotal(rubro.materials.map((row) => ({ totalCost: row.totalCost as DecimalLike, vae: row.vae as DecimalLike })), rubro.totals.directCost),
    sumComponentSubtotal(rubro.transport.map((row) => ({ totalCost: row.totalCost as DecimalLike, vae: row.vae as DecimalLike })), rubro.totals.directCost),
  ]
  const vaeTotal = subtotals.reduce((sum, subtotal) => sum + subtotal.vaeElement, 0)
  const relativeWeightTotal = subtotals.reduce((sum, subtotal) => sum + subtotal.relativeWeight, 0)

  addSectionTitle(worksheet, 'Resumen final')
  const rows = [
    ['Total costo directo', rubro.totals.directCost, 'VAE total', vaeTotal],
    ['Total costo indirecto', rubro.totals.indirectCost, 'Peso relativo total', relativeWeightTotal],
    ['Valor ofertado', rubro.totals.unitPrice, '', ''],
  ]

  rows.forEach((values) => {
    const row = worksheet.addRow(values)
    row.getCell(1).font = { bold: true }
    row.getCell(3).font = { bold: true }
    row.getCell(2).numFmt = '#,##0.00'
    row.getCell(4).numFmt = '0.00000'
  })
}

function normalizeComponentRow(row: RubroComponentExportRow, directTotal: number): ExcelRow {
  const totalCost = toNumber(row.totalCost as DecimalLike)
  const relativeWeight = calculateRelativeWeight(totalCost ?? 0, directTotal)
  const vae = toNumber(row.vae as DecimalLike)

  return {
    code: String(row.code ?? '-'),
    description: String(row.description ?? '-'),
    unit: String(row.unit ?? '-'),
    quantity: toNumber(row.quantity as DecimalLike),
    performance: toNumber(row.performance as DecimalLike),
    unitCost: toNumber(row.unitCost as DecimalLike),
    totalCost,
    relativeWeight,
    cpc: String(row.cpc ?? '-'),
    npEpNd: calculateNpEpNd(vae),
    vae,
    vaeElement: calculateVaeElement(relativeWeight, vae),
    notes: String(row.notes ?? ''),
  }
}
