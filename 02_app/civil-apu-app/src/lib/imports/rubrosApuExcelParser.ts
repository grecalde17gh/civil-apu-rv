import ExcelJS from 'exceljs'
import parseDecimalString from './numberParser'

type ExcelJsBuffer = Parameters<ExcelJS.Workbook['xlsx']['load']>[0]

export type SectionName = 'Equipos' | 'Mano de obra' | 'Materiales' | 'Transporte'

export type RubroImportIssue = {
  sheetName: string
  rowNumber?: number
  section?: SectionName
  code?: string
  severity: 'warning' | 'error'
  message: string
}

export type ParsedComponentRow = {
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

export type ParsedSheet = {
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

type HeaderKey = 'code' | 'description' | 'unit' | 'quantity' | 'rate' | 'performance' | 'notes'
type SectionBlock = {
  section: SectionName
  titleRow: number
  headerRow: number | null
  formulaRow: number | null
  startRow: number | null
  endRow: number
}
type HeaderDiagnostic = {
  column: number
  text: string
  key: HeaderKey | null
}
type SheetMatrix = string[][]

const sectionNames: SectionName[] = ['Equipos', 'Mano de obra', 'Materiales', 'Transporte']

const sectionSubtotalNumbers: Record<SectionName, number> = {
  Equipos: 1,
  'Mano de obra': 2,
  Materiales: 3,
  Transporte: 4,
}

const sectionAliases: Record<SectionName, string[]> = {
  Equipos: ['equipos', 'equipo', 'equipos herramientas', 'equipo herramientas'],
  'Mano de obra': ['mano de obra', 'mano obra', 'mano de obra directa', 'mano_obra', 'm o', 'mo'],
  Materiales: ['materiales', 'material'],
  Transporte: ['transporte', 'transportes', 'flete', 'acarreo'],
}

const decorativeTexts = new Set([
  '',
  '-',
  '--',
  'subtotal',
  'total',
  'ninguno',
  'costo directo',
  'costo indirecto',
  'valor ofertado',
])

const formulaTexts = new Set([
  'a',
  'b',
  'c a x b',
  'c axb',
  'r',
  'd c x r',
  'd cxr',
  'prt td q',
  'prx xd q',
  'pry yd q',
  'prz zd q',
  'vi',
  'prt vi',
  'prx vi',
  'pry vi',
  'prz vi',
])

const headerAliases: Record<HeaderKey, string[]> = {
  code: ['codigo', 'cod', 'codigo elemento'],
  description: ['descripcion', 'detalle', 'elemento', 'estructura ocupacional', 'texto del elemento'],
  unit: ['unidad', 'und', 'u'],
  quantity: ['cantidad', 'cant', 'cantidad requerida'],
  rate: ['tarifa', 'precio', 'p unitario', 'precio unitario', 'jornal hr', 'jornal hora', 'valor unitario'],
  performance: ['rendimiento', 'tiempo', 'tiempo requerido', 'horas'],
  notes: ['observacion', 'observaciones', 'nota', 'notas'],
}

const generalAliases = {
  code: ['codigo', 'codigo rubro'],
  description: ['rubro', 'descripcion', 'descripcion rubro'],
  project: ['proyecto'],
  unit: ['unidad', 'unidad rubro'],
  performance: ['rendimiento'],
  finalOfferedPrice: ['precio final ofertado', 'valor ofertado'],
  performanceUnit: ['unidad rend', 'unidad rendimiento'],
  indirectPercentage: ['indirectos', 'porcentaje indirectos', 'indirectos porcentaje'],
  technicalSpecification: ['especificacion tecnica'],
}

export async function parseRubrosApuWorkbook(buffer: ArrayBuffer): Promise<{ sheets: ParsedSheet[]; issues: RubroImportIssue[]; omittedSheets: string[] }> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(Buffer.from(buffer) as unknown as ExcelJsBuffer)

  const sheets: ParsedSheet[] = []
  const issues: RubroImportIssue[] = []
  const omittedSheets: string[] = []

  for (const worksheet of workbook.worksheets) {
    try {
      const parsed = parseRubroApuWorksheet(worksheet)
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

export function parseRubroApuWorksheet(worksheet: ExcelJS.Worksheet): ParsedSheet | null {
  const sheetName = safeCellString(worksheet.name)
  if (!sheetName) return null

  const issues: RubroImportIssue[] = []
  const matrix = worksheetToMatrix(worksheet)
  const sectionBlocks = sectionNames
    .map((sectionName) => findSection(worksheet, sectionName, matrix))
    .filter((sectionBlock): sectionBlock is SectionBlock => sectionBlock !== null)
  if (sectionBlocks.length === 0 && !findGeneralValue(worksheet, generalAliases.description)) return null

  const project = findGeneralValue(worksheet, generalAliases.project)
  const description = findGeneralValue(worksheet, generalAliases.description)
  const code = findGeneralValue(worksheet, generalAliases.code) || sheetName
  const unit = findGeneralValue(worksheet, generalAliases.unit)
  const performanceValue = safeCellNumber(findGeneralValue(worksheet, generalAliases.performance))
  const finalOfferedPrice = findGeneralValue(worksheet, generalAliases.finalOfferedPrice)
  const sections = emptySections()

  logGeneralDiagnostics(sheetName, { project, description, code, unit, performanceValue, finalOfferedPrice })
  logSectionMapDiagnostics(sheetName, sectionBlocks)

  if (!description) {
    issues.push({ sheetName, severity: 'warning', message: 'No se encontro descripcion del rubro; se usara una descripcion generica.' })
  }

  if (!unit) {
    issues.push({ sheetName, severity: 'warning', message: 'No se encontro unidad del rubro.' })
  }

  sectionNames.forEach((sectionName) => {
    const block = sectionBlocks.find((sectionBlock) => sectionBlock.section === sectionName)
    if (!block) {
      issues.push({
        sheetName,
        section: sectionName,
        severity: 'warning',
        message: `No se encontro la seccion ${sectionName}. Se continuara sin componentes de ${sectionIssueLabel(sectionName)}.`,
      })
      return
    }

    sections[sectionName] = readSectionRows(worksheet, sheetName, block)
    console.info(
      `[rubros-apu-parser] ${sheetName}: ${sectionName} rango datos ${block.startRow ?? '-'}-${block.endRow}, componentes validos ${sections[sectionName].length}`,
    )
    if (sections[sectionName].length === 0) {
      issues.push({ sheetName, section: sectionName, severity: 'warning', message: `Seccion ${sectionName} sin componentes.` })
    }
  })

  const usefulSectionCount = sectionNames.reduce((count, sectionName) => count + sections[sectionName].length, 0)
  if (usefulSectionCount === 0) {
    issues.push({ sheetName, severity: 'error', message: 'No se pudo leer ninguna seccion util del rubro.' })
  }

  return {
    sheetName,
    code,
    description: description || `Rubro importado ${sheetName}`,
    unit,
    performanceValue,
    performanceUnit: findGeneralValue(worksheet, generalAliases.performanceUnit) || null,
    indirectPercentage: normalizePercentage(safeCellNumber(findGeneralValue(worksheet, generalAliases.indirectPercentage))),
    technicalSpecification: findGeneralValue(worksheet, generalAliases.technicalSpecification) || null,
    sections,
    issues,
  }
}

function readSectionRows(
  worksheet: ExcelJS.Worksheet,
  sheetName: string,
  block: SectionBlock,
): ParsedComponentRow[] {
  if (!block.headerRow || !block.startRow) return []

  const headers = readHeaders(worksheet.getRow(block.headerRow))
  logHeaderDiagnostics(sheetName, block, readHeaderDiagnostics(worksheet.getRow(block.headerRow)))
  const rows: ParsedComponentRow[] = []

  for (let rowNumber = block.startRow; rowNumber <= block.endRow && rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    if (!rowHasValues(row)) {
      logRowDecision(sheetName, block.section, rowNumber, 'descartada', 'fila vacia', {})
      continue
    }

    const firstText = firstNonEmptyCellText(row)
    if (isStopRow(firstText) || findSectionByText(firstText)) {
      logRowDecision(sheetName, block.section, rowNumber, 'descartada', `fin de bloque: ${firstText}`, rawRowValues(row))
      break
    }
    if (isFormulaRow(row)) {
      logRowDecision(sheetName, block.section, rowNumber, 'descartada', 'fila de formulas', rawRowValues(row))
      continue
    }
    if (rowLooksLikeHeader(row)) {
      logRowDecision(sheetName, block.section, rowNumber, 'descartada', 'encabezado repetido', rawRowValues(row))
      continue
    }

    const values = readMappedValues(headers, row)
    const parsedRow = mapComponentRow(block.section, rowNumber, values)
    if (!isRealComponentRow(parsedRow)) {
      logRowDecision(sheetName, block.section, rowNumber, 'descartada', discardReason(parsedRow, values), values)
      continue
    }

    logRowDecision(sheetName, block.section, rowNumber, 'aceptada', parsedRow.description, values)
    rows.push(parsedRow)
  }

  return rows.filter(() => sheetName.trim() !== '')
}

function mapComponentRow(section: SectionName, rowNumber: number, values: Partial<Record<HeaderKey, string>>): ParsedComponentRow {
  const description = cleanComponentText(values.description)
  return {
    rowNumber,
    section,
    code: cleanComponentText(values.code).toUpperCase(),
    description,
    unit: cleanComponentText(values.unit) || (section === 'Equipos' || section === 'Mano de obra' ? 'hora' : ''),
    quantity: safeCellNumber(values.quantity),
    rate: safeCellNumber(values.rate),
    performance: safeCellNumber(values.performance),
    notes: safeCellString(values.notes),
  }
}

export function findSection(worksheet: ExcelJS.Worksheet, sectionName: SectionName, matrix = worksheetToMatrix(worksheet)): SectionBlock | null {
  const titleRow = findSectionTitleRow(matrix, sectionName)
  if (!titleRow) return null

  const nextTitleRow = findNextSectionTitleRow(matrix, titleRow)
  const searchEndRow = nextTitleRow ? nextTitleRow - 1 : worksheet.rowCount
  const headerRow = titleRow + 1 <= searchEndRow ? titleRow + 1 : null
  const formulaRow = titleRow + 2 <= searchEndRow ? titleRow + 2 : null
  const dataStartRow = titleRow + 3 <= searchEndRow ? titleRow + 3 : null
  const subtotalRow = dataStartRow ? findSubtotalRow(matrix, sectionName, dataStartRow, searchEndRow) : null
  const dataEndRow = subtotalRow ? subtotalRow - 1 : searchEndRow

  return {
    section: sectionName,
    titleRow,
    headerRow,
    formulaRow,
    startRow: dataStartRow,
    endRow: dataEndRow,
  }
}

function worksheetToMatrix(worksheet: ExcelJS.Worksheet): SheetMatrix {
  const matrix: SheetMatrix = []
  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    matrix[rowNumber] = []
    const row = worksheet.getRow(rowNumber)
    for (let colNumber = 1; colNumber <= worksheet.columnCount; colNumber += 1) {
      matrix[rowNumber][colNumber] = safeCellString(row.getCell(colNumber))
    }
  }
  return matrix
}

function findSectionTitleRow(matrix: SheetMatrix, sectionName: SectionName): number | null {
  const maxRow = matrix.length - 1
  for (let rowNumber = 1; rowNumber <= maxRow; rowNumber += 1) {
    if (findSectionByText(matrix[rowNumber]?.[1] ?? '') === sectionName) return rowNumber
  }

  for (let rowNumber = 1; rowNumber <= maxRow; rowNumber += 1) {
    const row = matrix[rowNumber] ?? []
    for (let colNumber = 1; colNumber < row.length; colNumber += 1) {
      if (findSectionByText(row[colNumber]) === sectionName) return rowNumber
    }
  }
  return null
}

function findNextSectionTitleRow(matrix: SheetMatrix, afterRow: number): number | null {
  const maxRow = matrix.length - 1
  for (let rowNumber = afterRow + 1; rowNumber <= maxRow; rowNumber += 1) {
    const row = matrix[rowNumber] ?? []
    for (let colNumber = 1; colNumber < row.length; colNumber += 1) {
      if (findSectionByText(row[colNumber])) return rowNumber
    }
  }
  return null
}

function findSubtotalRow(matrix: SheetMatrix, sectionName: SectionName, startRow: number, endRow: number): number | null {
  const sectionNumber = sectionSubtotalNumbers[sectionName]
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = matrix[rowNumber] ?? []
    for (let colNumber = 1; colNumber < row.length; colNumber += 1) {
      const normalized = normalizeText(row[colNumber])
      if (normalized === `subtotal ${sectionNumber}`) return rowNumber
    }
  }
  return null
}

function findGeneralValue(worksheet: ExcelJS.Worksheet, labels: string[]): string {
  const normalizedLabels = labels.map(normalizeText)
  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    for (let colNumber = 1; colNumber <= worksheet.columnCount; colNumber += 1) {
      const cellText = safeCellString(row.getCell(colNumber))
      const normalized = normalizeText(cellText)
      if (!normalized || !normalizedLabels.includes(normalized)) continue

      const inlineValue = valueAfterInlineLabel(cellText)
      if (inlineValue) return inlineValue

      return safeCellString(row.getCell(colNumber + 1))
    }
  }
  return ''
}

function valueAfterInlineLabel(value: string): string {
  const parts = value.split(/[:\uFF1A]/)
  return parts.length > 1 ? parts.slice(1).join(':').trim() : ''
}

function readHeaders(row: ExcelJS.Row): Array<HeaderKey | ''> {
  const headers: Array<HeaderKey | ''> = []
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = normalizeHeaderKey(safeCellString(cell))
  })
  return headers
}

function readHeaderDiagnostics(row: ExcelJS.Row): HeaderDiagnostic[] {
  const headers: HeaderDiagnostic[] = []
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const text = safeCellString(cell)
    if (!text) return
    headers.push({
      column: colNumber,
      text,
      key: normalizeHeaderKey(text) || null,
    })
  })
  return headers
}

function readMappedValues(headers: Array<HeaderKey | ''>, row: ExcelJS.Row): Partial<Record<HeaderKey, string>> {
  const values: Partial<Record<HeaderKey, string>> = {}
  headers.forEach((key, colNumber) => {
    if (!key) return
    values[key] = safeCellString(row.getCell(colNumber))
  })
  return values
}

function normalizeHeaderKey(value: string): HeaderKey | '' {
  const normalized = normalizeText(value)
  if (!normalized) return ''

  for (const [key, aliases] of Object.entries(headerAliases) as Array<[HeaderKey, string[]]>) {
    if (aliases.map(normalizeText).includes(normalized)) return key
  }

  return ''
}

function findSectionByText(value: string): SectionName | null {
  const normalized = normalizeSectionTitle(value)
  for (const sectionName of sectionNames) {
    if (sectionAliases[sectionName].map(normalizeText).includes(normalized)) return sectionName
  }
  return null
}

function normalizeSectionTitle(value: string): string {
  return normalizeText(value)
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isRealComponentRow(row: ParsedComponentRow): boolean {
  return isMeaningfulDescription(row.description)
}

function rowHasValues(row: ExcelJS.Row): boolean {
  let hasValue = false
  row.eachCell({ includeEmpty: true }, (cell) => {
    if (safeCellString(cell) !== '') hasValue = true
  })
  return hasValue
}

function firstNonEmptyCellText(row: ExcelJS.Row): string {
  for (let colNumber = 1; colNumber <= row.cellCount; colNumber += 1) {
    const value = safeCellString(row.getCell(colNumber))
    if (value) return value
  }
  return ''
}

function rowLooksLikeHeader(row: ExcelJS.Row): boolean {
  let headerLikeCells = 0
  let textCells = 0
  row.eachCell({ includeEmpty: false }, (cell) => {
    const text = safeCellString(cell)
    if (!isMeaningfulText(text)) return
    textCells += 1
    if (normalizeHeaderKey(text)) headerLikeCells += 1
  })
  return textCells > 0 && headerLikeCells >= Math.min(2, textCells)
}

function isFormulaRow(row: ExcelJS.Row): boolean {
  const values: string[] = []
  row.eachCell({ includeEmpty: false }, (cell) => {
    const normalized = normalizeText(safeCellString(cell))
    if (normalized) values.push(normalized)
  })

  if (values.length === 0) return false
  const formulaLikeCount = values.filter((value) => formulaTexts.has(value)).length
  return formulaLikeCount > 0 && formulaLikeCount >= Math.ceil(values.length * 0.5)
}

function isStopRow(value: string): boolean {
  const normalized = normalizeText(value)
  return isSubtotalRow(value) ||
    normalized.startsWith('total') ||
    normalized === 'costo directo' ||
    normalized === 'costo indirecto' ||
    normalized === 'total costo directo' ||
    normalized.includes('resumen') ||
    normalized.includes('determinacion vae') ||
    normalized.includes('precio final ofertado') ||
    normalized.includes('valor ofertado')
}

function isSubtotalRow(value: string): boolean {
  return normalizeText(value).startsWith('subtotal')
}

function cleanComponentText(value: unknown): string {
  const text = safeCellString(value)
  return isMeaningfulText(text) ? text : ''
}

function isMeaningfulText(value: unknown): boolean {
  const text = safeCellString(value)
  if (!text) return false
  if (/^[\s._\-\u2013\u2014]+$/.test(text)) return false
  return !decorativeTexts.has(normalizeText(text))
}

function isMeaningfulDescription(value: unknown): boolean {
  return isMeaningfulText(value)
}

function discardReason(row: ParsedComponentRow, values: Partial<Record<HeaderKey, string>>): string {
  const rawDescription = safeCellString(values.description)
  if (!isMeaningfulDescription(rawDescription)) return `descripcion invalida "${rawDescription || 'vacia'}"`
  return `fila sin componente real (${row.description || '-'})`
}

function rawRowValues(row: ExcelJS.Row): Record<number, string> {
  const values: Record<number, string> = {}
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const value = safeCellString(cell)
    if (value) values[colNumber] = value
  })
  return values
}

function logGeneralDiagnostics(
  sheetName: string,
  general: { project: string; description: string; code: string; unit: string; performanceValue: number | null; finalOfferedPrice: string },
) {
  console.info(`[rubros-apu-parser] ${sheetName}: datos generales ${JSON.stringify({
    proyecto: general.project,
    rubro: general.description,
    codigo: general.code,
    unidad: general.unit,
    rendimiento: general.performanceValue,
    precioFinalOfertado: general.finalOfferedPrice,
  })}`)
}

function logSectionMapDiagnostics(sheetName: string, sectionBlocks: SectionBlock[]) {
  console.info(`[rubros-apu-parser] ${sheetName}: mapa secciones ${JSON.stringify(sectionBlocks)}`)
}

function logHeaderDiagnostics(sheetName: string, block: SectionBlock, headers: HeaderDiagnostic[]) {
  console.info(`[rubros-apu-parser] ${sheetName}: ${block.section} encabezados ${JSON.stringify(headers)}`)
}

function logRowDecision(
  sheetName: string,
  sectionName: SectionName,
  rowNumber: number,
  decision: 'aceptada' | 'descartada',
  detail: string,
  values: Partial<Record<HeaderKey, string>> | Record<number, string>,
) {
  console.info(`[rubros-apu-parser] ${sheetName}: ${sectionName} fila ${rowNumber} ${decision}: ${detail}; valores ${JSON.stringify(values)}`)
}

function sectionIssueLabel(sectionName: SectionName): string {
  const labels: Record<SectionName, string> = {
    Equipos: 'equipos',
    'Mano de obra': 'mano de obra',
    Materiales: 'materiales',
    Transporte: 'transporte',
  }
  return labels[sectionName]
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

function normalizePercentage(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0
  return value > 0 && value <= 1 ? value * 100 : value
}

export function normalizeText(value: unknown): string {
  return safeCellString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
