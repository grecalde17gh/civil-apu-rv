import type ExcelJS from 'exceljs'
import ExcelJSDefault from 'exceljs'
import { readFile } from 'fs/promises'
import JSZip from 'jszip'
import path from 'path'
import { calculateNpEpNd, calculateRelativeWeight, calculateVaeElement } from '../calculations/rubroComponentParticipation'
import { addTableSheet, createWorkbook, sanitizeWorksheetName } from './excel'

type DecimalLike = number | string | null | undefined | { toString(): string }
type ExcelJsBuffer = Parameters<ExcelJS.Workbook['xlsx']['load']>[0]

export type RubroSummaryExportRow = {
  code: string
  description: string
  technicalSpecification?: string | null
  unit: string
  directCost?: DecimalLike
  indirectCost?: DecimalLike
  indirectPercentage?: DecimalLike
  unitPrice?: DecimalLike
  status: string
}

export type RubroComponentExportRow = Record<string, DecimalLike | string | boolean>

export type RubroDetailExport = RubroSummaryExportRow & {
  projectName?: string
  performanceValue?: DecimalLike
  performanceUnit?: string | null
  totals?: {
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

type SectionKey = 'equipment' | 'labor' | 'materials' | 'transport'
type ComponentDisplayRow = {
  description: string
  unit: string
  quantity: number | null
  unitCost: number | null
  performance: number | null
  distance: number | null
  costHour: number | null
  totalCost: number
  relativeWeight: number
  cpc: string
  npEpNd: string
  vae: number | null
  vaeElement: number
}
type SectionSummary = {
  rows: ComponentDisplayRow[]
  totalCost: number
  relativeWeight: number
  vaeElement: number
}
type RubroExportTotals = {
  equipment: SectionSummary
  labor: SectionSummary
  materials: SectionSummary
  transport: SectionSummary
  directCost: number
  indirectRatio: number
  indirectCost: number
  totalCost: number
  offeredValue: number
  relativeWeightTotal: number
  vaeTotal: number
}
type MarkerLocation = {
  row: number
  column: number
  marker: string
}
type SectionColumn = {
  markers: string[]
  getValue: (row: ComponentDisplayRow) => ExcelJS.CellValue
  format?: NumberFormatKind
}
type SectionConfig = {
  key: SectionKey
  rowMarkers: string[]
  subtotalMarkers: {
    totalCost: string[]
    relativeWeight: string[]
    vaeElement: string[]
  }
  columns: SectionColumn[]
}
type NumberFormatKind = 'standard2' | 'ratio5' | 'summary3'

const franklinTemplatePath = path.join(process.cwd(), 'templates', 'APU_Franklin_Template_Codex_Limpia.xlsx')

const sectionConfigs: SectionConfig[] = [
  {
    key: 'equipment',
    rowMarkers: ['<<EQUIPMENT_ROWS>>', '<<EQUIPMENT_DESCRIPTION>>'],
    subtotalMarkers: {
      totalCost: ['<<EQUIPMENT_SUBTOTAL>>', '<<EQUIPMENT_SUBTOTAL_COST>>'],
      relativeWeight: ['<<EQUIPMENT_SUBTOTAL_WEIGHT>>'],
      vaeElement: ['<<EQUIPMENT_SUBTOTAL_VAE_ELEMENT>>'],
    },
    columns: [
      { markers: ['<<EQUIPMENT_DESCRIPTION>>'], getValue: (row) => row.description },
      { markers: ['<<EQUIPMENT_QUANTITY>>'], getValue: (row) => row.quantity, format: 'standard2' },
      { markers: ['<<EQUIPMENT_TARIFF>>'], getValue: (row) => row.unitCost, format: 'standard2' },
      { markers: ['<<EQUIPMENT_COST_HOUR>>'], getValue: (row) => row.costHour, format: 'standard2' },
      { markers: ['<<EQUIPMENT_RENDIMIENTO>>'], getValue: (row) => row.performance, format: 'standard2' },
      { markers: ['<<EQUIPMENT_COST>>'], getValue: (row) => row.totalCost, format: 'standard2' },
      { markers: ['<<EQUIPMENT_WEIGHT>>'], getValue: (row) => row.relativeWeight, format: 'ratio5' },
      { markers: ['<<EQUIPMENT_CPC>>'], getValue: (row) => row.cpc },
      { markers: ['<<EQUIPMENT_NP_EP_ND>>'], getValue: (row) => row.npEpNd },
      { markers: ['<<EQUIPMENT_VAE>>'], getValue: (row) => row.vae, format: 'ratio5' },
      { markers: ['<<EQUIPMENT_VAE_ELEMENT>>'], getValue: (row) => row.vaeElement, format: 'ratio5' },
    ],
  },
  {
    key: 'labor',
    rowMarkers: ['<<LABOR_ROWS>>', '<<LABOR_DESCRIPTION>>'],
    subtotalMarkers: {
      totalCost: ['<<LABOR_SUBTOTAL>>', '<<LABOR_SUBTOTAL_COST>>'],
      relativeWeight: ['<<LABOR_SUBTOTAL_WEIGHT>>'],
      vaeElement: ['<<LABOR_SUBTOTAL_VAE_ELEMENT>>'],
    },
    columns: [
      { markers: ['<<LABOR_DESCRIPTION>>'], getValue: (row) => row.description },
      { markers: ['<<LABOR_QUANTITY>>'], getValue: (row) => row.quantity, format: 'standard2' },
      { markers: ['<<LABOR_JORNAL_HR>>'], getValue: (row) => row.unitCost, format: 'standard2' },
      { markers: ['<<LABOR_COST_HOUR>>'], getValue: (row) => row.costHour, format: 'standard2' },
      { markers: ['<<LABOR_RENDIMIENTO>>'], getValue: (row) => row.performance, format: 'standard2' },
      { markers: ['<<LABOR_COST>>'], getValue: (row) => row.totalCost, format: 'standard2' },
      { markers: ['<<LABOR_WEIGHT>>'], getValue: (row) => row.relativeWeight, format: 'ratio5' },
      { markers: ['<<LABOR_CPC>>'], getValue: (row) => row.cpc },
      { markers: ['<<LABOR_NP_EP_ND>>'], getValue: (row) => row.npEpNd },
      { markers: ['<<LABOR_VAE>>'], getValue: (row) => row.vae, format: 'ratio5' },
      { markers: ['<<LABOR_VAE_ELEMENT>>'], getValue: (row) => row.vaeElement, format: 'ratio5' },
    ],
  },
  {
    key: 'materials',
    rowMarkers: ['<<MATERIAL_ROWS>>', '<<MATERIAL_DESCRIPTION>>'],
    subtotalMarkers: {
      totalCost: ['<<MATERIAL_SUBTOTAL>>', '<<MATERIAL_SUBTOTAL_COST>>'],
      relativeWeight: ['<<MATERIAL_SUBTOTAL_WEIGHT>>'],
      vaeElement: ['<<MATERIAL_SUBTOTAL_VAE_ELEMENT>>'],
    },
    columns: [
      { markers: ['<<MATERIAL_DESCRIPTION>>'], getValue: (row) => row.description },
      { markers: ['<<MATERIAL_UNIT>>'], getValue: (row) => row.unit },
      { markers: ['<<MATERIAL_QUANTITY>>'], getValue: (row) => row.quantity, format: 'standard2' },
      { markers: ['<<MATERIAL_UNIT_PRICE>>'], getValue: (row) => row.unitCost, format: 'standard2' },
      { markers: ['<<MATERIAL_COST>>'], getValue: (row) => row.totalCost, format: 'standard2' },
      { markers: ['<<MATERIAL_WEIGHT>>'], getValue: (row) => row.relativeWeight, format: 'ratio5' },
      { markers: ['<<MATERIAL_CPC>>'], getValue: (row) => row.cpc },
      { markers: ['<<MATERIAL_NP_EP_ND>>'], getValue: (row) => row.npEpNd },
      { markers: ['<<MATERIAL_VAE>>'], getValue: (row) => row.vae, format: 'ratio5' },
      { markers: ['<<MATERIAL_VAE_ELEMENT>>'], getValue: (row) => row.vaeElement, format: 'ratio5' },
    ],
  },
  {
    key: 'transport',
    rowMarkers: ['<<TRANSPORT_ROWS>>', '<<TRANSPORT_DESCRIPTION>>'],
    subtotalMarkers: {
      totalCost: ['<<TRANSPORT_SUBTOTAL>>', '<<TRANSPORT_SUBTOTAL_COST>>'],
      relativeWeight: ['<<TRANSPORT_SUBTOTAL_WEIGHT>>'],
      vaeElement: ['<<TRANSPORT_SUBTOTAL_VAE_ELEMENT>>'],
    },
    columns: [
      { markers: ['<<TRANSPORT_DESCRIPTION>>'], getValue: (row) => row.description },
      { markers: ['<<TRANSPORT_UNIT>>'], getValue: (row) => row.unit },
      { markers: ['<<TRANSPORT_DISTANCE>>'], getValue: (row) => row.distance, format: 'standard2' },
      { markers: ['<<TRANSPORT_QUANTITY>>'], getValue: (row) => row.quantity, format: 'standard2' },
      { markers: ['<<TRANSPORT_TARIFF>>'], getValue: (row) => row.unitCost, format: 'standard2' },
      { markers: ['<<TRANSPORT_COST>>'], getValue: (row) => row.totalCost, format: 'standard2' },
      { markers: ['<<TRANSPORT_WEIGHT>>'], getValue: (row) => row.relativeWeight, format: 'ratio5' },
      { markers: ['<<TRANSPORT_CPC>>'], getValue: (row) => row.cpc },
      { markers: ['<<TRANSPORT_NP_EP_ND>>'], getValue: (row) => row.npEpNd },
      { markers: ['<<TRANSPORT_VAE>>'], getValue: (row) => row.vae, format: 'ratio5' },
      { markers: ['<<TRANSPORT_VAE_ELEMENT>>'], getValue: (row) => row.vaeElement, format: 'ratio5' },
    ],
  },
]

function toNumber(value: DecimalLike): number | null {
  if (value === null || value === undefined || value === '') return null
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

export async function buildRubroWorkbook(rubro: RubroDetailExport): Promise<ExcelJS.Workbook> {
  return buildRubrosApuWorkbook([rubro])
}

export async function buildRubrosApuWorkbook(rubros: RubroDetailExport[]): Promise<ExcelJS.Workbook> {
  const workbook = await loadCleanFranklinTemplate()
  const templateWorksheet = workbook.getWorksheet('APU_TEMPLATE') ?? workbook.worksheets[0]
  if (!templateWorksheet) throw new Error('La plantilla Franklin limpia no contiene la hoja APU_TEMPLATE.')

  const templateModel = cloneModel((templateWorksheet as unknown as { model: unknown }).model)
  const usedNames = new Set<string>()

  rubros.forEach((rubro, index) => {
    const worksheet = index === 0 ? templateWorksheet : cloneTemplateWorksheet(workbook, templateModel)
    worksheet.name = uniqueWorksheetName(rubro.code, usedNames)
    fillRubroTemplate(worksheet, rubro)
  })

  removeWorksheetIfExists(workbook, 'README_EXPORTADOR')
  cleanWorkbookMarkers(workbook)

  return workbook
}

export function numberToSpanishWords(value: DecimalLike): string {
  const numeric = toNumber(value)
  if (numeric === null || numeric < 0 || numeric > 9999999.99) {
    throw new Error('numberToSpanishWords soporta valores entre 0.00 y 9999999.99.')
  }

  const cents = Math.round((numeric + Number.EPSILON) * 100)
  const dollars = Math.floor(cents / 100)
  const centPart = cents % 100
  const dollarLabel = dollars === 1 ? 'DOLAR' : 'DOLARES'

  return `${integerToSpanishWords(dollars)} ${dollarLabel} CON ${String(centPart).padStart(2, '0')}/100`.toUpperCase()
}

async function loadCleanFranklinTemplate(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJSDefault.Workbook()
  const rawTemplate = await readFile(franklinTemplatePath)

  try {
    await workbook.xlsx.load(rawTemplate as unknown as ExcelJsBuffer)
  } catch {
    const repairedTemplate = await repairMinimalOoxmlPackage(rawTemplate)
    await workbook.xlsx.load(repairedTemplate as unknown as ExcelJsBuffer)
  }

  return workbook
}

async function repairMinimalOoxmlPackage(buffer: Buffer): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer)
  const contentTypes = zip.file('[Content_Types].xml')
  if (!contentTypes) return buffer

  let xml = await contentTypes.async('string')
  xml = xml.replace(
    /<Default Extension="xml"[^>]*>/,
    '<Default Extension="xml" ContentType="application/xml" /><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />',
  )
  zip.file('[Content_Types].xml', xml)

  const rootRelationships = zip.file('_rels/.rels')
  if (rootRelationships) {
    const rootXml = (await rootRelationships.async('string')).replace('Target="/xl/workbook.xml"', 'Target="xl/workbook.xml"')
    zip.file('_rels/.rels', rootXml)
  }

  const workbookRelationships = zip.file('xl/_rels/workbook.xml.rels')
  if (workbookRelationships) {
    const workbookRelsXml = (await workbookRelationships.async('string')).replace(/Target="\/xl\//g, 'Target="')
    zip.file('xl/_rels/workbook.xml.rels', workbookRelsXml)
  }

  await Promise.all(
    Object.keys(zip.files)
      .filter((name) => name.endsWith('.xml'))
      .map(async (name) => {
        const file = zip.file(name)
        if (!file) return
        const prefixedXml = await file.async('string')
        const normalizedXml = prefixedXml.replace(/xmlns:x=/g, 'xmlns=').replace(/(<\/?)x:/g, '$1')
        zip.file(name, normalizedXml)
      }),
  )

  return zip.generateAsync({ type: 'nodebuffer' })
}

function cloneTemplateWorksheet(workbook: ExcelJS.Workbook, templateModel: unknown): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet('APU')
  ;(worksheet as unknown as { model: unknown }).model = cloneModel(templateModel)
  return worksheet
}

function cloneModel<T>(model: T): T {
  return JSON.parse(JSON.stringify(model)) as T
}

function uniqueWorksheetName(code: string, usedNames: Set<string>): string {
  const baseName = sanitizeWorksheetName(code)
  let name = baseName
  let suffix = 2

  while (usedNames.has(name)) {
    const suffixText = ` ${suffix}`
    name = `${baseName.slice(0, 31 - suffixText.length)}${suffixText}`
    suffix += 1
  }

  usedNames.add(name)
  return name
}

function removeWorksheetIfExists(workbook: ExcelJS.Workbook, name: string) {
  const worksheet = workbook.getWorksheet(name)
  if (worksheet) workbook.removeWorksheet(worksheet.id)
}

function fillRubroTemplate(worksheet: ExcelJS.Worksheet, rubro: RubroDetailExport) {
  const totals = buildRubroExportTotals(rubro)

  writeHeaderMarkers(worksheet, rubro, totals)
  sectionConfigs.forEach((config) => writeSection(worksheet, config, totals[config.key].rows))
  sectionConfigs.forEach((config) => writeSubtotalMarkers(worksheet, config, totals[config.key]))
  writeSummaryMarkers(worksheet, totals)
}

function buildRubroExportTotals(rubro: RubroDetailExport): RubroExportTotals {
  const directCostFromRows = sumNumbers([
    ...rubro.equipment.map((row) => toNumber(row.totalCost as DecimalLike)),
    ...rubro.labor.map((row) => toNumber(row.totalCost as DecimalLike)),
    ...rubro.materials.map((row) => toNumber(row.totalCost as DecimalLike)),
    ...rubro.transport.map((row) => toNumber(row.totalCost as DecimalLike)),
  ])
  const directCost = toNumber(rubro.directCost) ?? rubro.totals?.directCost ?? directCostFromRows
  const indirectRatio = normalizePercentage(toNumber(rubro.indirectPercentage))
  const indirectCost = toNumber(rubro.indirectCost) ?? rubro.totals?.indirectCost ?? roundMoney(directCost * indirectRatio)
  const totalCost = roundMoney(directCost + indirectCost)
  const offeredValue = toNumber(rubro.unitPrice) ?? rubro.totals?.unitPrice ?? roundMoney(totalCost)

  const equipment = summarizeSection(buildEquipmentOrLaborRows(rubro.equipment, directCost))
  const labor = summarizeSection(buildEquipmentOrLaborRows(rubro.labor, directCost))
  const materials = summarizeSection(buildMaterialRows(rubro.materials, directCost))
  const transport = summarizeSection(buildTransportRows(rubro.transport, directCost))

  return {
    equipment,
    labor,
    materials,
    transport,
    directCost,
    indirectRatio,
    indirectCost,
    totalCost,
    offeredValue,
    relativeWeightTotal: equipment.relativeWeight + labor.relativeWeight + materials.relativeWeight + transport.relativeWeight,
    vaeTotal: equipment.vaeElement + labor.vaeElement + materials.vaeElement + transport.vaeElement,
  }
}

function buildEquipmentOrLaborRows(rows: RubroComponentExportRow[], directCost: number): ComponentDisplayRow[] {
  return rows.map((row) => {
    const quantity = toNumber(row.quantity as DecimalLike)
    const unitCost = toNumber(row.unitCost as DecimalLike)
    const performance = toNumber(row.performance as DecimalLike)
    const costHour = multiplyNullable(quantity, unitCost)
    const totalCost = toNumber(row.totalCost as DecimalLike) ?? multiplyNullable(costHour, performance) ?? 0
    return buildComponentDisplayRow(row, directCost, { quantity, unitCost, performance, costHour, totalCost })
  })
}

function buildMaterialRows(rows: RubroComponentExportRow[], directCost: number): ComponentDisplayRow[] {
  return rows.map((row) => {
    const quantity = toNumber(row.quantity as DecimalLike)
    const unitCost = toNumber(row.unitCost as DecimalLike)
    const totalCost = toNumber(row.totalCost as DecimalLike) ?? multiplyNullable(quantity, unitCost) ?? 0
    return buildComponentDisplayRow(row, directCost, { quantity, unitCost, performance: null, costHour: null, totalCost })
  })
}

function buildTransportRows(rows: RubroComponentExportRow[], directCost: number): ComponentDisplayRow[] {
  return rows.map((row) => {
    const quantity = toNumber(row.quantity as DecimalLike)
    const unitCost = toNumber(row.unitCost as DecimalLike)
    const distance = toNumber((row.distance ?? '') as DecimalLike)
    const totalCost = toNumber(row.totalCost as DecimalLike) ?? multiplyNullable(quantity, unitCost) ?? 0
    return buildComponentDisplayRow(row, directCost, { quantity, unitCost, performance: null, distance, costHour: null, totalCost })
  })
}

function buildComponentDisplayRow(
  row: RubroComponentExportRow,
  directCost: number,
  values: {
    quantity: number | null
    unitCost: number | null
    performance: number | null
    distance?: number | null
    costHour: number | null
    totalCost: number
  },
): ComponentDisplayRow {
  const vae = toNumber(row.vae as DecimalLike)
  const relativeWeight = calculateRelativeWeight(values.totalCost, directCost)
  return {
    description: stringOrBlank(row.description),
    unit: stringOrBlank(row.unit),
    quantity: values.quantity,
    unitCost: values.unitCost,
    performance: values.performance,
    distance: values.distance ?? null,
    costHour: values.costHour,
    totalCost: values.totalCost,
    relativeWeight,
    cpc: stringOrBlank(row.cpc),
    npEpNd: calculateNpEpNd(vae),
    vae,
    vaeElement: calculateVaeElement(relativeWeight, vae),
  }
}

function summarizeSection(rows: ComponentDisplayRow[]): SectionSummary {
  return {
    rows,
    totalCost: rows.reduce((sum, row) => sum + row.totalCost, 0),
    relativeWeight: rows.reduce((sum, row) => sum + row.relativeWeight, 0),
    vaeElement: rows.reduce((sum, row) => sum + row.vaeElement, 0),
  }
}

function writeHeaderMarkers(worksheet: ExcelJS.Worksheet, rubro: RubroDetailExport, totals: RubroExportTotals) {
  replaceFirstExistingMarker(worksheet, ['<<PROJECT_NAME>>'], rubro.projectName ? `"${rubro.projectName}"` : '')
  replaceFirstExistingMarker(worksheet, ['<<RUBRO_NAME>>'], rubro.description)
  replaceFirstExistingMarker(worksheet, ['<<RUBRO_CODE>>'], rubro.code)
  replaceFirstExistingMarker(worksheet, ['<<UNIT>>'], rubro.unit)
  replaceFirstExistingMarker(worksheet, ['<<PERFORMANCE>>', '<<RUBRO_RENDIMIENTO>>'], toNumber(rubro.performanceValue), 'standard2')
  replaceFirstExistingMarker(worksheet, ['<<FINAL_UNIT_PRICE>>', '<<PRECIO_FINAL_OFERTADO>>'], totals.offeredValue, 'standard2')
  replaceFirstExistingMarker(worksheet, ['<<FINAL_UNIT_PRICE_WORDS>>', '<<VALOR_OFERTADO_LETRAS>>'], numberToSpanishWords(totals.offeredValue))
}

function writeSection(worksheet: ExcelJS.Worksheet, config: SectionConfig, rows: ComponentDisplayRow[]) {
  const marker = findFirstMarker(worksheet, config.rowMarkers)
  if (!marker) return

  const markerColumns = getMarkerColumnsInRow(worksheet, marker.row, config.columns)
  const sequentialStartColumn = marker.column
  const targetRows = rows.length > 0 ? rows : [buildEmptyComponentRow()]
  const insertedRows = Math.max(0, targetRows.length - 1)

  if (insertedRows > 0) {
    worksheet.insertRows(marker.row + 1, Array.from({ length: insertedRows }, () => []))
    for (let index = 1; index < targetRows.length; index += 1) {
      copyRowTemplate(worksheet, marker.row, marker.row + index)
    }
  }

  targetRows.forEach((row, index) => {
    const rowNumber = marker.row + index
    if (rows.length === 0) {
      clearMarkerRow(worksheet, rowNumber)
      worksheet.getCell(rowNumber, sequentialStartColumn).value = 'SIN COMPONENTES'
      return
    }
    writeComponentRow(worksheet, rowNumber, row, config, markerColumns, sequentialStartColumn)
  })
}

function writeComponentRow(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  row: ComponentDisplayRow,
  config: SectionConfig,
  markerColumns: Map<number, SectionColumn>,
  sequentialStartColumn: number,
) {
  if (markerColumns.size > 0) {
    clearMarkerRow(worksheet, rowNumber)
    markerColumns.forEach((column, columnNumber) => {
      setCellValue(worksheet.getCell(rowNumber, columnNumber), column.getValue(row), column.format)
    })
    return
  }

  clearMarkerRow(worksheet, rowNumber)
  config.columns.forEach((column, index) => {
    setCellValue(worksheet.getCell(rowNumber, sequentialStartColumn + index), column.getValue(row), column.format)
  })
}

function getMarkerColumnsInRow(worksheet: ExcelJS.Worksheet, rowNumber: number, columns: SectionColumn[]): Map<number, SectionColumn> {
  const row = worksheet.getRow(rowNumber)
  const result = new Map<number, SectionColumn>()

  row.eachCell((cell, columnNumber) => {
    const value = getCellText(cell)
    const column = columns.find((candidate) => candidate.markers.includes(value))
    if (column) result.set(columnNumber, column)
  })

  return result
}

function writeSubtotalMarkers(worksheet: ExcelJS.Worksheet, config: SectionConfig, summary: SectionSummary) {
  replaceFirstExistingMarker(worksheet, config.subtotalMarkers.totalCost, summary.totalCost, 'standard2')
  replaceFirstExistingMarker(worksheet, config.subtotalMarkers.relativeWeight, summary.relativeWeight, 'ratio5')
  replaceFirstExistingMarker(worksheet, config.subtotalMarkers.vaeElement, summary.vaeElement, 'ratio5')
}

function writeSummaryMarkers(worksheet: ExcelJS.Worksheet, totals: RubroExportTotals) {
  replaceFirstExistingMarker(worksheet, ['<<TOTAL_DIRECT_COST>>', '<<TOTAL_COSTO_DIRECTO>>'], totals.directCost, 'summary3')
  replaceFirstExistingMarker(worksheet, ['<<TOTAL_INDIRECT_COST>>', '<<TOTAL_COSTO_INDIRECTO>>'], totals.indirectCost, 'summary3')
  replaceFirstExistingMarker(worksheet, ['<<OFFERED_VALUE>>', '<<VALOR_OFERTADO>>'], totals.offeredValue, 'summary3')
  replaceFirstExistingMarker(worksheet, ['<<TOTAL_VAE>>', '<<VAE_TOTAL>>'], totals.vaeTotal, 'ratio5')
  replaceFirstExistingMarker(worksheet, ['<<TOTAL_RELATIVE_WEIGHT>>', '<<PESO_RELATIVO_TOTAL>>'], totals.relativeWeightTotal, 'ratio5')
  replaceFirstExistingMarker(worksheet, ['<<PORCENTAJE_INDIRECTO>>'], totals.indirectRatio, 'standard2')
  replaceFirstExistingMarker(worksheet, ['<<COSTO_TOTAL_RUBRO>>'], totals.totalCost, 'standard2')
}

function replaceFirstExistingMarker(worksheet: ExcelJS.Worksheet, markers: string[], value: ExcelJS.CellValue, format?: NumberFormatKind) {
  const location = findFirstMarker(worksheet, markers)
  if (location) setCellValue(worksheet.getCell(location.row, location.column), value, format)
}

function findFirstMarker(worksheet: ExcelJS.Worksheet, markers: string[]): MarkerLocation | null {
  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber += 1) {
      const marker = getCellText(row.getCell(columnNumber))
      if (markers.includes(marker)) return { row: rowNumber, column: columnNumber, marker }
    }
  }

  return null
}

function setCellValue(cell: ExcelJS.Cell, value: ExcelJS.CellValue, format?: NumberFormatKind) {
  cell.value = value
  if (format) {
    const numFmt = numberFormat(format)
    cell.style = { ...cloneModel(cell.style), numFmt }
    cell.numFmt = numFmt
  }
}

function numberFormat(format: NumberFormatKind): string {
  if (format === 'ratio5') return '0.00000'
  if (format === 'summary3') return '0.000'
  return '0.00'
}

function getCellText(cell: ExcelJS.Cell): string {
  return typeof cell.value === 'string' ? cell.value : ''
}

function copyRowTemplate(worksheet: ExcelJS.Worksheet, sourceRowNumber: number, targetRowNumber: number) {
  const sourceRow = worksheet.getRow(sourceRowNumber)
  const targetRow = worksheet.getRow(targetRowNumber)
  targetRow.height = sourceRow.height
  targetRow.hidden = sourceRow.hidden
  targetRow.outlineLevel = sourceRow.outlineLevel

  for (let column = 1; column <= worksheet.columnCount; column += 1) {
    const sourceCell = sourceRow.getCell(column)
    const targetCell = targetRow.getCell(column)
    targetCell.style = cloneModel(sourceCell.style)
    targetCell.value = sourceCell.value
  }

  copyRowMerges(worksheet, sourceRowNumber, targetRowNumber)
}

function copyRowMerges(worksheet: ExcelJS.Worksheet, sourceRowNumber: number, targetRowNumber: number) {
  const merges = ((worksheet as unknown as { _merges?: Record<string, { model: { top: number; bottom: number; left: number; right: number } }> })._merges ?? {})
  Object.values(merges).forEach((merge) => {
    const { top, bottom, left, right } = merge.model
    if (top !== sourceRowNumber || bottom !== sourceRowNumber) return
    try {
      worksheet.mergeCells(targetRowNumber, left, targetRowNumber, right)
    } catch {
      // The row may already have an equivalent merge after insertion.
    }
  })
}

function clearMarkerRow(worksheet: ExcelJS.Worksheet, rowNumber: number) {
  const row = worksheet.getRow(rowNumber)
  row.eachCell((cell) => {
    if (typeof cell.value === 'string' && /<<[^>]+>>/.test(cell.value)) {
      cell.value = ''
    }
  })
}

function cleanWorkbookMarkers(workbook: ExcelJS.Workbook) {
  workbook.worksheets.forEach((worksheet) => {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string' && /<<[^>]+>>/.test(cell.value)) {
          cell.value = ''
        }
      })
    })
  })
}

function buildEmptyComponentRow(): ComponentDisplayRow {
  return {
    description: 'SIN COMPONENTES',
    unit: '',
    quantity: null,
    unitCost: null,
    performance: null,
    distance: null,
    costHour: null,
    totalCost: 0,
    relativeWeight: 0,
    cpc: '',
    npEpNd: '',
    vae: null,
    vaeElement: 0,
  }
}

function multiplyNullable(left: number | null, right: number | null): number | null {
  return left === null || right === null ? null : left * right
}

function sumNumbers(values: Array<number | null>): number {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
}

function normalizePercentage(value: number | null): number {
  if (value === null) return 0
  return value > 1 ? value / 100 : value
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function stringOrBlank(value: unknown): string {
  return String(value ?? '').trim()
}

function integerToSpanishWords(value: number): string {
  if (value === 0) return 'cero'
  if (value < 1000) return hundredsToSpanish(value)
  if (value < 1000000) return thousandsToSpanish(value)
  return millionsToSpanish(value)
}

function millionsToSpanish(value: number): string {
  const millions = Math.floor(value / 1000000)
  const remainder = value % 1000000
  const millionText = millions === 1 ? 'un millon' : `${hundredsToSpanish(millions)} millones`
  return remainder === 0 ? millionText : `${millionText} ${thousandsToSpanish(remainder)}`
}

function thousandsToSpanish(value: number): string {
  const thousands = Math.floor(value / 1000)
  const remainder = value % 1000
  const thousandText = thousands === 1 ? 'mil' : `${hundredsToSpanish(thousands)} mil`
  return remainder === 0 ? thousandText : `${thousandText} ${hundredsToSpanish(remainder)}`
}

function hundredsToSpanish(value: number): string {
  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  if (value === 100) return 'cien'
  if (hundreds === 0) return tensToSpanish(remainder)

  const labels = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ]
  return remainder === 0 ? labels[hundreds] : `${labels[hundreds]} ${tensToSpanish(remainder)}`
}

function tensToSpanish(value: number): string {
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve']
  const twenties = [
    'veinte',
    'veintiuno',
    'veintidos',
    'veintitres',
    'veinticuatro',
    'veinticinco',
    'veintiseis',
    'veintisiete',
    'veintiocho',
    'veintinueve',
  ]
  const tens = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']

  if (value < 10) return units[value]
  if (value < 20) return teens[value - 10]
  if (value < 30) return twenties[value - 20]

  const ten = Math.floor(value / 10)
  const unit = value % 10
  return unit === 0 ? tens[ten] : `${tens[ten]} y ${units[unit]}`
}
