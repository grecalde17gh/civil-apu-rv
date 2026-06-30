import ExcelJS from 'exceljs'
import type { Prisma } from '@prisma/client'
import { prisma } from '../db/prisma'
import { calculateEquipmentCost } from '../calculations/equipment'
import { calculateLaborCost } from '../calculations/labor'
import { calculateMaterialCost } from '../calculations/materials'
import { calculateTransportCost } from '../calculations/transport'
import { updateRubroTotals } from '../db/rubros'
import parseDecimalString from './numberParser'

type ExcelJsBuffer = Parameters<ExcelJS.Workbook['xlsx']['load']>[0]
type SectionName = 'Equipos' | 'Mano de obra' | 'Materiales' | 'Transporte'
type ImportStatus = 'OK' | 'Con advertencias' | 'Error'
type ComponentStatus = 'OK' | 'No encontrado' | 'Ambiguo' | 'Con advertencia'
type MatchMethod = 'codigo exacto' | 'descripcion normalizada' | 'estructura ocupacional normalizada' | 'coincidencia parcial fuerte' | 'sin coincidencia' | 'no aplica'
type CatalogLookupEntry = {
  id: string
  code: string | null
  description: string
  display: string
}
type CatalogLookup = Record<SectionName, { codes: Map<string, CatalogLookupEntry>; descriptions: Map<string, CatalogLookupEntry[]>; entries: CatalogLookupEntry[] }>

export type RubroImportIssue = {
  sheetName: string
  rowNumber?: number
  section?: SectionName
  code?: string
  severity: 'warning' | 'error'
  message: string
}

export type RubroImportPreviewSheet = {
  sheetName: string
  code: string
  description: string
  status: ImportStatus
  equipmentCount: number
  laborCount: number
  materialsCount: number
  transportCount: number
  warnings: string[]
  errors: string[]
}

export type RubroImportPreviewComponent = {
  sheetName: string
  rowNumber: number
  section: SectionName
  sourceText: string
  matchedComponent: string | null
  matchMethod: MatchMethod
  status: ComponentStatus
  candidates: string[]
}

export type RubroImportPreview = {
  sheets: RubroImportPreviewSheet[]
  components: RubroImportPreviewComponent[]
  issues: RubroImportIssue[]
  totals: {
    sheets: number
    ok: number
    warnings: number
    errors: number
    omittedSheets: number
  }
}

export type RubroImportResult = {
  created: number
  updated: number
  componentsImported: number
  componentsOmitted: number
  componentsNotFound: number
  componentsAmbiguous: number
  errors: RubroImportIssue[]
  omittedSheets: string[]
}

type ParsedComponentRow = {
  rowNumber: number
  section: SectionName
  code: string
  description: string
  unit: string
  quantity: number | null
  rate: number | null
  performance: number | null
  notes: string
}

type CatalogItem = {
  id: string
  code: string | null
  description: string
  unit?: string | null
  price?: { toString(): string } | null
  hourlyCost?: { toString(): string } | null
  hourlyRate?: { toString(): string } | null
}

type MatchResult<T extends CatalogItem | CatalogLookupEntry> = {
  status: ComponentStatus
  method: MatchMethod
  item: T | null
  candidates: T[]
}

type ParsedSheet = {
  sheetName: string
  code: string
  description: string
  unit: string
  performanceValue: number | null
  performanceUnit: string | null
  indirectPercentage: number
  technicalSpecification: string | null
  sections: Record<SectionName, ParsedComponentRow[]>
  issues: RubroImportIssue[]
}

const sectionNames: SectionName[] = ['Equipos', 'Mano de obra', 'Materiales', 'Transporte']

const requiredFields: Record<SectionName, Array<keyof ParsedComponentRow>> = {
  Equipos: ['code', 'description', 'quantity', 'rate', 'performance'],
  'Mano de obra': ['code', 'description', 'quantity', 'rate', 'performance'],
  Materiales: ['code', 'description', 'unit', 'quantity', 'rate'],
  Transporte: ['code', 'description', 'unit', 'quantity', 'rate'],
}

export async function previewRubrosImportFromExcelBuffer(buffer: ArrayBuffer): Promise<RubroImportPreview> {
  const parsed = await parseRubrosWorkbook(buffer)
  const catalogCodes = await loadCatalogCodes()
  const issues = [...parsed.issues]
  const components: RubroImportPreviewComponent[] = []
  const sheets = parsed.sheets.map((sheet) => validateParsedSheet(sheet, catalogCodes, issues, components))
  const ok = sheets.filter((sheet) => sheet.status === 'OK').length
  const warningSheets = sheets.filter((sheet) => sheet.status === 'Con advertencias').length
  const errorSheets = sheets.filter((sheet) => sheet.status === 'Error').length

  return {
    sheets,
    components,
    issues,
    totals: {
      sheets: sheets.length,
      ok,
      warnings: warningSheets,
      errors: errorSheets,
      omittedSheets: parsed.omittedSheets.length,
    },
  }
}

export async function importRubrosFromExcelBuffer(buffer: ArrayBuffer): Promise<RubroImportResult> {
  const parsed = await parseRubrosWorkbook(buffer)
  const catalogCodes = await loadCatalogCodes()
  const validationIssues = [...parsed.issues]
  const previewComponents: RubroImportPreviewComponent[] = []
  const previewSheets = parsed.sheets.map((sheet) => validateParsedSheet(sheet, catalogCodes, validationIssues, previewComponents))
  const result: RubroImportResult = {
    created: 0,
    updated: 0,
    componentsImported: 0,
    componentsOmitted: 0,
    componentsNotFound: 0,
    componentsAmbiguous: 0,
    errors: validationIssues,
    omittedSheets: parsed.omittedSheets,
  }
  const previewBySheet = new Map(previewSheets.map((sheet) => [sheet.sheetName, sheet]))

  for (const sheet of parsed.sheets) {
    const preview = previewBySheet.get(sheet.sheetName)
    if (!preview || preview.status === 'Error') {
      result.omittedSheets.push(sheet.sheetName)
      continue
    }

    const existing = await prisma.rubro.findUnique({ where: { code: sheet.code }, select: { id: true } })

    try {
      await prisma.$transaction(async (tx) => {
        const rubro = existing
          ? await tx.rubro.update({
              where: { id: existing.id },
              data: buildRubroData(sheet),
            })
          : await tx.rubro.create({
              data: {
                code: sheet.code,
                ...buildRubroData(sheet),
                status: 'DRAFT',
                calculationStatus: 'PENDING',
              },
            })

        await tx.rubroEquipment.deleteMany({ where: { rubroId: rubro.id } })
        await tx.rubroLabor.deleteMany({ where: { rubroId: rubro.id } })
        await tx.rubroMaterial.deleteMany({ where: { rubroId: rubro.id } })
        await tx.rubroTransport.deleteMany({ where: { rubroId: rubro.id } })

        result.componentsImported += await createEquipmentRows(tx, rubro.id, sheet, result)
        result.componentsImported += await createLaborRows(tx, rubro.id, sheet, result)
        result.componentsImported += await createMaterialRows(tx, rubro.id, sheet, result)
        result.componentsImported += await createTransportRows(tx, rubro.id, sheet, result)
        await updateRubroTotals(rubro.id, tx)
      })

      if (existing) result.updated += 1
      else result.created += 1
    } catch (error) {
      result.errors.push({
        sheetName: sheet.sheetName,
        severity: 'error',
        message: error instanceof Error
          ? `No se pudo validar la hoja ${sheet.sheetName}. Revise que las secciones Equipos, Mano de obra, Materiales y Transporte tengan el formato esperado. Detalle: ${error.message}`
          : `No se pudo validar la hoja ${sheet.sheetName}. Revise que las secciones Equipos, Mano de obra, Materiales y Transporte tengan el formato esperado.`,
      })
    }
  }

  return result
}

function buildRubroData(sheet: ParsedSheet) {
  return {
    description: sheet.description,
    unit: sheet.unit,
    performanceValue: sheet.performanceValue ?? undefined,
    performanceUnit: sheet.performanceUnit ?? undefined,
    indirectPercentage: sheet.indirectPercentage,
    technicalSpecification: sheet.technicalSpecification ?? undefined,
    sourceExcelSheet: sheet.sheetName,
  }
}

async function parseRubrosWorkbook(buffer: ArrayBuffer): Promise<{ sheets: ParsedSheet[]; issues: RubroImportIssue[]; omittedSheets: string[] }> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(Buffer.from(buffer) as unknown as ExcelJsBuffer)

  const sheets: ParsedSheet[] = []
  const issues: RubroImportIssue[] = []
  const omittedSheets: string[] = []

  for (const worksheet of workbook.worksheets) {
    try {
      const parsed = parseRubroWorksheet(worksheet)
      if (parsed) sheets.push(parsed)
      else omittedSheets.push(worksheet.name)
    } catch (error) {
      issues.push({
        sheetName: worksheet.name,
        severity: 'error',
        message: error instanceof Error
          ? `No se pudo validar la hoja ${worksheet.name}. Revise el formato esperado. Detalle: ${error.message}`
          : `No se pudo validar la hoja ${worksheet.name}. Revise el formato esperado.`,
      })
      omittedSheets.push(worksheet.name)
    }
  }

  return { sheets, issues, omittedSheets }
}

function parseRubroWorksheet(worksheet: ExcelJS.Worksheet): ParsedSheet | null {
  if (isFranklinWorksheet(worksheet)) {
    return parseFranklinWorksheet(worksheet)
  }

  return parseSystemWorksheet(worksheet)
}

function parseFranklinWorksheet(worksheet: ExcelJS.Worksheet): ParsedSheet | null {
  const sheetName = safeCellString(worksheet.name)
  const code = safeCellString(worksheet.getCell('B10')) || sheetName
  if (!code) return null

  const issues: RubroImportIssue[] = []
  const description = safeCellString(worksheet.getCell('B8'))
  const unit = safeCellString(worksheet.getCell('F8'))

  if (!description) issues.push({ sheetName, severity: 'error', message: 'Falta descripcion del rubro en la celda B8 del formato Franklin.' })
  if (!unit) issues.push({ sheetName, severity: 'error', message: 'Falta unidad del rubro en la celda F8 del formato Franklin.' })

  const sections = emptySections()
  const sectionRanges: Array<{ section: SectionName; start: number; end: number }> = [
    { section: 'Equipos', start: 15, end: 20 },
    { section: 'Mano de obra', start: 25, end: 30 },
    { section: 'Materiales', start: 35, end: 53 },
    { section: 'Transporte', start: 58, end: 60 },
  ]

  sectionRanges.forEach(({ section, start, end }) => {
    const sectionLabel = section === 'Equipos' ? 'EQUIPOS' : section === 'Mano de obra' ? 'MANO DE OBRA' : section === 'Materiales' ? 'MATERIALES' : 'TRANSPORTE'
    if (!findRowByFirstCell(worksheet, sectionLabel, { startsWith: true })) {
      issues.push({ sheetName, section, severity: 'warning', message: `No se encontro la seccion ${section} en el formato Franklin.` })
      return
    }

    for (let rowNumber = start; rowNumber <= end; rowNumber += 1) {
      const row = parseFranklinComponentRow(worksheet, section, rowNumber)
      if (row) sections[section].push(row)
    }
  })

  return {
    sheetName,
    code,
    description,
    unit,
    performanceValue: safeCellNumber(worksheet.getCell('S8')),
    performanceUnit: null,
    indirectPercentage: normalizePercentage(safeCellNumber(worksheet.getCell('E64'))),
    technicalSpecification: null,
    sections,
    issues,
  }
}

function parseSystemWorksheet(worksheet: ExcelJS.Worksheet): ParsedSheet | null {
  const sheetName = safeCellString(worksheet.name)
  const code = sheetName
  if (!code) return null

  const issues: RubroImportIssue[] = []
  const generalRowNumber = findRowByFirstCell(worksheet, 'Datos generales del rubro')
  if (!generalRowNumber) return null
  const general = readMappedRow(worksheet.getRow(generalRowNumber + 1), worksheet.getRow(generalRowNumber + 2))
  const description = safeCellString(general.estructura_ocupacional ?? general.descripcion)
  const unit = safeCellString(general.unidad)

  if (!description) issues.push({ sheetName, severity: 'error', message: 'Falta descripcion del rubro.' })
  if (!unit) issues.push({ sheetName, severity: 'error', message: 'Falta unidad del rubro.' })

  const sections = Object.fromEntries(sectionNames.map((name) => [name, readSectionRows(worksheet, sheetName, name)])) as Record<SectionName, ParsedComponentRow[]>

  sectionNames.forEach((sectionName) => {
    if (!findRowByFirstCell(worksheet, sectionName)) {
      issues.push({ sheetName, section: sectionName, severity: 'warning', message: `No se encontro la seccion ${sectionName}.` })
    }
  })

  return {
    sheetName,
    code,
    description,
    unit,
    performanceValue: safeCellNumber(general.rendimiento),
    performanceUnit: safeCellString(general.unidad_rend) || null,
    indirectPercentage: normalizePercentage(safeCellNumber(general.indirectos) ?? safeCellNumber(general.indirectos_porcentaje)),
    technicalSpecification: safeCellString(worksheet.getRow(generalRowNumber + 3).getCell(2)) || null,
    sections,
    issues,
  }
}

function parseFranklinComponentRow(worksheet: ExcelJS.Worksheet, section: SectionName, rowNumber: number): ParsedComponentRow | null {
  const description = safeCellString(worksheet.getCell(rowNumber, 1))
  const normalizedDescription = normalizeText(description)

  if (!description || normalizedDescription === 'ninguno' || description === '-') return null

  if (section === 'Materiales') {
    return {
      rowNumber,
      section,
      code: '',
      description,
      unit: safeCellString(worksheet.getCell(rowNumber, 3)),
      quantity: safeCellNumber(worksheet.getCell(rowNumber, 4)),
      rate: safeCellNumber(worksheet.getCell(rowNumber, 5)),
      performance: null,
      notes: '',
    }
  }

  if (section === 'Transporte') {
    return {
      rowNumber,
      section,
      code: '',
      description,
      unit: safeCellString(worksheet.getCell(rowNumber, 2)),
      quantity: safeCellNumber(worksheet.getCell(rowNumber, 4)),
      rate: safeCellNumber(worksheet.getCell(rowNumber, 5)),
      performance: null,
      notes: '',
    }
  }

  return {
    rowNumber,
    section,
    code: '',
    description,
    unit: 'hora',
    quantity: safeCellNumber(worksheet.getCell(rowNumber, 2)),
    rate: safeCellNumber(worksheet.getCell(rowNumber, 3)),
    performance: safeCellNumber(worksheet.getCell(rowNumber, 5)),
    notes: '',
  }
}

function validateParsedSheet(
  sheet: ParsedSheet,
  catalogCodes: CatalogLookup,
  issues: RubroImportIssue[],
  components: RubroImportPreviewComponent[],
): RubroImportPreviewSheet {
  issues.push(...sheet.issues)

  sectionNames.forEach((sectionName) => {
    sheet.sections[sectionName].forEach((row) => {
      validateMinimumFields(sheet, row, issues)
      const match = sectionName === 'Transporte' ? null : resolveCatalogMatch(catalogCodes[sectionName].entries, row)

      components.push({
        sheetName: sheet.sheetName,
        rowNumber: row.rowNumber,
        section: sectionName,
        sourceText: row.description || row.code || '-',
        matchedComponent: match?.item ? match.item.display : null,
        matchMethod: match?.method ?? 'no aplica',
        status: sectionName === 'Transporte' ? 'OK' : match?.status ?? 'No encontrado',
        candidates: match?.candidates.map((candidate) => candidate.display).slice(0, 5) ?? [],
      })

      if (sectionName !== 'Transporte' && match?.status === 'No encontrado') {
        issues.push({
          sheetName: sheet.sheetName,
          rowNumber: row.rowNumber,
          section: sectionName,
          code: row.code,
          severity: 'warning',
          message: `${sectionName}: componente no encontrado en catalogo (${row.code || row.description || '-'}).`,
        })
      } else if (sectionName !== 'Transporte' && match?.status === 'Ambiguo') {
        issues.push({
          sheetName: sheet.sheetName,
          rowNumber: row.rowNumber,
          section: sectionName,
          code: row.code,
          severity: 'warning',
          message: `${sectionName}: componente ambiguo (${row.code || row.description || '-'}). Candidatos: ${match.candidates.map((candidate) => candidate.display).slice(0, 5).join(', ')}.`,
        })
      }
    })
  })

  const sheetIssues = issues.filter((issue) => issue.sheetName === sheet.sheetName)
  const errors = sheetIssues.filter((issue) => issue.severity === 'error').map((issue) => issue.message)
  const warnings = sheetIssues.filter((issue) => issue.severity === 'warning').map((issue) => issue.message)

  return {
    sheetName: sheet.sheetName,
    code: sheet.code,
    description: sheet.description,
    status: errors.length > 0 ? 'Error' : warnings.length > 0 ? 'Con advertencias' : 'OK',
    equipmentCount: sheet.sections.Equipos.length,
    laborCount: sheet.sections['Mano de obra'].length,
    materialsCount: sheet.sections.Materiales.length,
    transportCount: sheet.sections.Transporte.length,
    warnings,
    errors,
  }
}

function validateMinimumFields(sheet: ParsedSheet, row: ParsedComponentRow, issues: RubroImportIssue[]) {
  requiredFields[row.section].forEach((field) => {
    const value = row[field]
    const missing = typeof value === 'number' ? value === null : safeCellString(value) === ''
    if (!missing) return

    const missingCodeButHasDescription = field === 'code' && safeCellString(row.description) !== ''
    if (missingCodeButHasDescription) return

    issues.push({
      sheetName: sheet.sheetName,
      rowNumber: row.rowNumber,
      section: row.section,
      code: row.code,
      severity: field === 'code' && !missingCodeButHasDescription ? 'error' : 'warning',
      message: `${row.section}: falta ${fieldLabel(field)} en fila ${row.rowNumber}.`,
    })
  })
}

async function loadCatalogCodes(): Promise<CatalogLookup> {
  const [equipment, labor, materials] = await Promise.all([
    prisma.equipmentItem.findMany({ select: { code: true, description: true } }),
    prisma.laborItem.findMany({ select: { code: true, roleName: true } }),
    prisma.material.findMany({ select: { code: true, description: true } }),
  ])
  const equipmentEntries = equipment.map((item) => buildLookupEntry(item.code, item.description))
  const laborEntries = labor.map((item) => buildLookupEntry(item.code, item.roleName))
  const materialEntries = materials.map((item) => buildLookupEntry(item.code, item.description))

  return {
    Equipos: buildLookup(equipmentEntries),
    'Mano de obra': buildLookup(laborEntries),
    Materiales: buildLookup(materialEntries),
    Transporte: buildLookup([]),
  }
}

async function createEquipmentRows(tx: Prisma.TransactionClient, rubroId: string, sheet: ParsedSheet, result: RubroImportResult): Promise<number> {
  let imported = 0
  const equipmentItems = await tx.equipmentItem.findMany()
  for (const row of sheet.sections.Equipos) {
    const match = resolveCatalogMatch(equipmentItems.map((item) => ({
      id: item.id,
      code: item.code,
      description: item.description,
      hourlyRate: item.hourlyRate,
    })), row)
    const equipment = match.item
    const quantity = row.quantity ?? 0
    const timeRequired = row.performance ?? sheet.performanceValue ?? 0

    if (match.status === 'Ambiguo') {
      result.componentsOmitted += 1
      result.componentsAmbiguous += 1
      continue
    }

    if (!equipment || equipment.hourlyRate === null) {
      result.componentsOmitted += 1
      result.componentsNotFound += 1
      continue
    }

    const rateSnapshot = Number(equipment.hourlyRate.toString())
    await tx.rubroEquipment.create({
      data: {
        rubroId,
        equipmentItemId: equipment.id,
        equipmentQuantity: quantity,
        rateSnapshot,
        timeRequired,
        performanceMode: 'MANUAL_TIME',
        totalCost: calculateEquipmentCost({ equipmentQuantity: quantity, rate: rateSnapshot, timeRequired, performanceMode: 'MANUAL_TIME', rateType: 'HOURLY' }),
        notes: row.notes || undefined,
      },
    })
    imported += 1
  }
  return imported
}

async function createLaborRows(tx: Prisma.TransactionClient, rubroId: string, sheet: ParsedSheet, result: RubroImportResult): Promise<number> {
  let imported = 0
  const laborItems = await tx.laborItem.findMany()
  for (const row of sheet.sections['Mano de obra']) {
    const match = resolveCatalogMatch(laborItems.map((item) => ({
      id: item.id,
      code: item.code,
      description: item.roleName,
      hourlyCost: item.hourlyCost,
    })), row)
    const labor = match.item
    const quantity = row.quantity ?? 0
    const timeRequired = row.performance ?? sheet.performanceValue ?? 0

    if (match.status === 'Ambiguo') {
      result.componentsOmitted += 1
      result.componentsAmbiguous += 1
      continue
    }

    if (!labor) {
      result.componentsOmitted += 1
      result.componentsNotFound += 1
      continue
    }

    const hourlyCostSnapshot = Number(labor.hourlyCost.toString())
    await tx.rubroLabor.create({
      data: {
        rubroId,
        laborItemId: labor.id,
        workerQuantity: quantity,
        hourlyCostSnapshot,
        timeRequired,
        performanceMode: 'MANUAL_TIME',
        totalCost: calculateLaborCost({ workerQuantity: quantity, hourlyCost: hourlyCostSnapshot, timeRequired, performanceMode: 'MANUAL_TIME' }),
        notes: row.notes || undefined,
      },
    })
    imported += 1
  }
  return imported
}

async function createMaterialRows(tx: Prisma.TransactionClient, rubroId: string, sheet: ParsedSheet, result: RubroImportResult): Promise<number> {
  let imported = 0
  const materials = await tx.material.findMany()
  for (const row of sheet.sections.Materiales) {
    const match = resolveCatalogMatch(materials.map((item) => ({
      id: item.id,
      code: item.code,
      description: item.description,
      unit: item.unit,
      price: item.price1,
    })), row)
    const material = match.item
    const quantity = row.quantity ?? 0

    if (match.status === 'Ambiguo') {
      result.componentsOmitted += 1
      result.componentsAmbiguous += 1
      continue
    }

    if (!material) {
      result.componentsOmitted += 1
      result.componentsNotFound += 1
      continue
    }

    const unitCostSnapshot = Number(material.price?.toString() ?? row.rate ?? 0)
    await tx.rubroMaterial.create({
      data: {
        rubroId,
        materialId: material.id,
        quantity,
        unit: material.unit ?? row.unit,
        priceOption: 1,
        unitCostSnapshot,
        totalCost: calculateMaterialCost(quantity, unitCostSnapshot),
        notes: row.notes || undefined,
      },
    })
    imported += 1
  }
  return imported
}

async function createTransportRows(tx: Prisma.TransactionClient, rubroId: string, sheet: ParsedSheet, result: RubroImportResult): Promise<number> {
  let imported = 0
  for (const row of sheet.sections.Transporte) {
    if (!row.description) {
      result.componentsOmitted += 1
      continue
    }

    const quantity = row.quantity ?? 0
    const unitCost = row.rate ?? 0
    await tx.rubroTransport.create({
      data: {
        rubroId,
        code: row.code || undefined,
        description: row.description,
        unit: row.unit || 'u',
        quantity,
        unitCost,
        totalCost: calculateTransportCost(quantity, unitCost),
        notes: row.notes || undefined,
      },
    })
    imported += 1
  }
  return imported
}

function readSectionRows(worksheet: ExcelJS.Worksheet, sheetName: string, sectionName: SectionName): ParsedComponentRow[] {
  const sectionRowNumber = findRowByFirstCell(worksheet, sectionName)
  if (!sectionRowNumber) return []

  const headers = readHeaders(worksheet.getRow(sectionRowNumber + 1))
  const rows: ParsedComponentRow[] = []

  for (let rowNumber = sectionRowNumber + 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    const firstCell = safeCellString(row.getCell(1))
    if (!rowHasValues(row)) continue
    if (isSectionBoundary(firstCell)) break

    const values = readMappedValues(headers, row)
    const quantity = safeCellNumber(values.cantidad)
    const rate = safeCellNumber(values.tarifa_precio ?? values.precio_unitario ?? values.precio ?? values.tarifa ?? values.costo_hora)
    const performance = safeCellNumber(values.rendimiento)

    rows.push({
      rowNumber,
      section: sectionName,
      code: safeCellString(values.codigo).toUpperCase(),
      description: safeCellString(values.estructura_ocupacional ?? values.descripcion),
      unit: safeCellString(values.unidad),
      quantity,
      rate,
      performance,
      notes: safeCellString(values.observacion),
    })
  }

  return rows.filter((row) => {
    const keep = row.code || row.description || row.quantity !== null || row.rate !== null
    if (!keep) return false
    return sheetName.trim() !== ''
  })
}

function readMappedRow(headerRow: ExcelJS.Row, valueRow: ExcelJS.Row): Record<string, string> {
  return readMappedValues(readHeaders(headerRow), valueRow)
}

function readHeaders(row: ExcelJS.Row): string[] {
  const headers: string[] = []
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = normalizeHeader(safeCellString(cell))
  })
  return headers
}

function readMappedValues(headers: string[], row: ExcelJS.Row): Record<string, string> {
  const values: Record<string, string> = {}
  headers.forEach((key, colNumber) => {
    if (!key) return
    values[key] = safeCellString(row.getCell(colNumber))
  })
  return values
}

function findRowByFirstCell(worksheet: ExcelJS.Worksheet, value: string, options?: { startsWith?: boolean }): number | null {
  const target = normalizeHeader(value)
  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const current = normalizeHeader(safeCellString(worksheet.getRow(rowNumber).getCell(1)))
    if (options?.startsWith ? current.startsWith(target) : current === target) {
      return rowNumber
    }
  }
  return null
}

function rowHasValues(row: ExcelJS.Row): boolean {
  let hasValue = false
  row.eachCell({ includeEmpty: true }, (cell) => {
    if (safeCellString(cell) !== '') hasValue = true
  })
  return hasValue
}

function isSectionBoundary(value: string): boolean {
  return sectionNames.includes(value as SectionName) || value === 'Resumen / Totales del rubro' || value === 'Determinacion VAE'
}

function emptySections(): Record<SectionName, ParsedComponentRow[]> {
  return {
    Equipos: [],
    'Mano de obra': [],
    Materiales: [],
    Transporte: [],
  }
}

export function safeCellString(value: unknown): string {
  const raw = unwrapCellValue(value)
  if (raw === null || raw === undefined) return ''
  if (typeof raw === 'object') {
    if ('result' in raw) return safeCellString(raw.result as ExcelJS.CellValue)
    if ('text' in raw) return safeCellString(raw.text as string)
    if ('richText' in raw && Array.isArray(raw.richText)) {
      return raw.richText.map((part) => safeCellString(part.text)).join('').trim()
    }
    if (raw instanceof Date) return raw.toISOString()
    return ''
  }
  return String(raw).trim()
}

export function safeCellNumber(value: unknown): number | null {
  const text = safeCellString(value)
  if (text === '') return null
  const normalized = text.endsWith('%') ? text.slice(0, -1) : text
  return parseDecimalString(normalized)
}

function unwrapCellValue(value: unknown): ExcelJS.CellValue | string | number | boolean | null | undefined {
  if (value && typeof value === 'object' && 'value' in value) {
    const maybeCell = value as ExcelJS.Cell
    if (maybeCell.isMerged && maybeCell.master && maybeCell.master !== maybeCell) {
      return unwrapCellValue(maybeCell.master)
    }
    return value.value as ExcelJS.CellValue
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
    return value
  }
  return undefined
}

function isFranklinWorksheet(worksheet: ExcelJS.Worksheet): boolean {
  return (
    normalizeHeader(safeCellString(worksheet.getCell('A1'))).includes('edicion_de_rubro') ||
    normalizeHeader(safeCellString(worksheet.getCell('A8'))) === 'rubro' ||
    normalizeHeader(safeCellString(worksheet.getCell('A12'))).startsWith('equipos')
  )
}

function normalizePercentage(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0
  return value > 0 && value <= 1 ? value * 100 : value
}

function normalizeText(value: unknown): string {
  return safeCellString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildLookupEntry(code: string | null, description: string): CatalogLookupEntry {
  const cleanCode = safeCellString(code) || null
  return {
    id: cleanCode ?? normalizeText(description),
    code: cleanCode,
    description,
    display: [cleanCode, description].filter(Boolean).join(' '),
  }
}

function buildLookup(entries: CatalogLookupEntry[]): CatalogLookup[SectionName] {
  const codes = new Map<string, CatalogLookupEntry>()
  const descriptions = new Map<string, CatalogLookupEntry[]>()

  entries.forEach((entry) => {
    const code = safeCellString(entry.code).toUpperCase()
    if (code) codes.set(code, entry)

    candidateTexts(entry.description).forEach((text) => {
      const current = descriptions.get(text) ?? []
      current.push(entry)
      descriptions.set(text, current)
    })
  })

  return { codes, descriptions, entries }
}

function resolveCatalogMatch<T extends CatalogItem | CatalogLookupEntry>(items: T[], row: ParsedComponentRow): MatchResult<T> {
  const compatibleCode = isCompatibleInternalCode(row.code)
  if (compatibleCode) {
    const codeMatches = uniqueById(items.filter((item) => safeCellString(item.code).toUpperCase() === row.code.toUpperCase()))
    const codeMatch = resolveCandidates(codeMatches, 'codigo exacto')
    if (codeMatch.status !== 'No encontrado') return codeMatch
  }

  for (const text of candidateTexts(row.description)) {
    const matches = uniqueById(items.filter((item) => candidateTexts(item.description).includes(text)))
    const result = resolveCandidates(matches, text === normalizeText(row.description) ? 'descripcion normalizada' : 'estructura ocupacional normalizada')
    if (result.status !== 'No encontrado') return result
  }

  const sourceTokens = new Set(tokenize(row.description))
  const strongMatches = uniqueById(items.filter((item) => hasStrongPartialMatch(sourceTokens, tokenize(item.description))))
  return resolveCandidates(strongMatches, strongMatches.length > 0 ? 'coincidencia parcial fuerte' : 'sin coincidencia')
}

function resolveCandidates<T extends CatalogItem | CatalogLookupEntry>(candidates: T[], method: MatchMethod): MatchResult<T> {
  if (candidates.length === 0) {
    return { status: 'No encontrado', method: 'sin coincidencia', item: null, candidates: [] }
  }

  if (candidates.length === 1) {
    return { status: 'OK', method, item: candidates[0], candidates }
  }

  return { status: 'Ambiguo', method, item: null, candidates }
}

function isCompatibleInternalCode(code: string): boolean {
  return /^(MAT|MO|EQ|LAB|EQUIP)-?\d+/i.test(code.trim())
}

function candidateTexts(value: string): string[] {
  const normalized = normalizeText(value)
  const withoutCode = normalizeText(removeLeadingCode(value))
  return [...new Set([normalized, withoutCode].filter(Boolean))]
}

function tokenize(value: string): string[] {
  return normalizeText(removeLeadingCode(value))
    .split(' ')
    .filter((token) => token.length >= 3 && !/^\d+$/.test(token))
}

function hasStrongPartialMatch(sourceTokens: Set<string>, candidateTokens: string[]): boolean {
  if (sourceTokens.size === 0 || candidateTokens.length === 0) return false
  const matches = candidateTokens.filter((token) => sourceTokens.has(token)).length
  return matches >= Math.min(2, sourceTokens.size)
}

function uniqueById<T extends CatalogItem | CatalogLookupEntry>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const id = item.id
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

function removeLeadingCode(value: string): string {
  return value.replace(/^[A-Za-z0-9.-]+\s+-\s+/, '').trim()
}

function normalizeHeader(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/%/g, 'porcentaje')
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function fieldLabel(field: keyof ParsedComponentRow): string {
  const labels: Partial<Record<keyof ParsedComponentRow, string>> = {
    code: 'codigo',
    description: 'descripcion',
    unit: 'unidad',
    quantity: 'cantidad',
    rate: 'tarifa / precio',
    performance: 'rendimiento',
  }
  return labels[field] ?? String(field)
}
