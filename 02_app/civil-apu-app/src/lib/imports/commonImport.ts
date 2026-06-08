import * as XLSX from 'xlsx'
import { generateNextCatalogCode, isValidCatalogCode, type CatalogCodePrefix } from '../catalogCodes'
import { addTableSheet, createWorkbook, workbookToBuffer, type ExcelColumn } from '../export/excel'
import parseDecimalString from './numberParser'

export type ImportCellValue = string | number | boolean | null
export type ImportRowStatus = 'new' | 'existing' | 'conflict' | 'error'

export type ImportConflict = {
  field: string
  existing: string | number | boolean | null
  incoming: string | number | boolean | null
}

export type ImportPreviewRow<T> = {
  rowNumber: number
  data: T
  originalValues: Record<string, ImportCellValue>
  status: ImportRowStatus
  conflicts?: ImportConflict[]
  existingValues?: Record<string, ImportCellValue>
  errors: string[]
}

export type ImportApplyResult = {
  created: number
  updated: number
  omitted: number
  conflicts: number
  rejected: number
}

export type DenominationLookupItem = {
  id: string
  code: string | null
  name: string
}

export type RawCatalogRow = {
  rowNumber: number
  values: Record<string, ImportCellValue>
}

export type CatalogSheetConfig = {
  sheetNames: string[]
  columns: Record<string, string[]>
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function isEmptyCell(value: ImportCellValue | undefined): boolean {
  return value === null || value === undefined || String(value).trim() === ''
}

function normalizeCellValue(value: unknown): ImportCellValue {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' || typeof value === 'boolean') return value
  return String(value).trim()
}

function buildHeaderMap(columns: Record<string, string[]>): Map<string, string> {
  const map = new Map<string, string>()

  Object.entries(columns).forEach(([key, aliases]) => {
    map.set(normalizeText(key), key)
    aliases.forEach((alias) => map.set(normalizeText(alias), key))
  })

  return map
}

export async function parseCatalogSheetFromBuffer(
  buffer: ArrayBuffer,
  config: CatalogSheetConfig,
): Promise<RawCatalogRow[]> {
  const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer', cellDates: false })

  const acceptedSheetNames = config.sheetNames.map(normalizeText)
  const sheetName = workbook.SheetNames.find((name) => acceptedSheetNames.includes(normalizeText(name || '')))
  if (!sheetName) return []

  const headerMap = buildHeaderMap(config.columns)
  const worksheet = workbook.Sheets[sheetName]
  const matrix = XLSX.utils.sheet_to_json<ImportCellValue[]>(worksheet, {
    header: 1,
    raw: false,
    defval: null,
    blankrows: false,
  })
  const headerRow = matrix[0] ?? []
  const headers = headerRow.map((cell) => headerMap.get(normalizeText(cell ?? '')) ?? '')

  const rows: RawCatalogRow[] = []

  matrix.slice(1).forEach((row, index) => {
    const values: RawCatalogRow['values'] = {}

    headers.forEach((key, colIndex) => {
      if (!key) return
      values[key] = normalizeCellValue(row[colIndex])
    })

    const hasData = Object.values(values).some((value) => !isEmptyCell(value))
    if (hasData) {
      rows.push({ rowNumber: index + 2, values })
    }
  })

  return rows
}

export function parseDecimalInput(value: unknown): number | null {
  return parseDecimalString(value)
}

export function parseImportNumber(value: unknown): number | null {
  return parseDecimalInput(value)
}

export function parseOptionalPercentageInput(value: unknown): number | null {
  if (!hasImportValue(value)) return null

  const raw = String(value).trim()
  const isPercentage = raw.endsWith('%')
  const numericText = isPercentage ? raw.slice(0, -1).trim() : raw
  const parsed = parseDecimalInput(numericText)

  if (parsed === null) return null
  return isPercentage ? parsed / 100 : parsed
}

export function formatNormalizedOptionalNumber(value: number | null): string | null {
  if (value === null) return null
  return Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(12)))
}

export function parseBooleanInput(value: unknown): boolean | null {
  if (value === null || value === undefined || String(value).trim() === '') return null

  const normalized = normalizeText(String(value))
  if (['1', 'true', 'si', 'activo', 'activa', 'yes'].includes(normalized)) return true
  if (['0', 'false', 'no', 'inactivo', 'inactiva'].includes(normalized)) return false

  return null
}

export function parseImportBoolean(value: unknown): boolean | null {
  return parseBooleanInput(value)
}

export function cleanString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  return trimmed === '' ? null : trimmed
}

export function normalizeImportText(value: unknown): string {
  return cleanString(value)
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() ?? ''
}

export function buildDenominationLookup(denominations: DenominationLookupItem[]): Map<string, string> {
  const lookup = new Map<string, string>()

  denominations.forEach((denomination) => {
    const code = normalizeImportText(denomination.code)
    const name = normalizeImportText(denomination.name)
    const combined = normalizeImportText([denomination.code, denomination.name].filter(Boolean).join(' '))

    if (code) lookup.set(code, denomination.id)
    if (name) lookup.set(name, denomination.id)
    if (combined) lookup.set(combined, denomination.id)
  })

  return lookup
}

export function resolveDenominationId(value: unknown, lookup: Map<string, string>): string | undefined {
  const normalized = normalizeImportText(value)
  if (!normalized) return undefined
  return lookup.get(normalized)
}

export function areImportNumbersEqual(left: unknown, right: unknown): boolean {
  const leftNumber = parseDecimalInput(left)
  const rightNumber = parseDecimalInput(right)

  if (leftNumber === null || rightNumber === null) return false
  return Math.abs(leftNumber - rightNumber) < 0.0001
}

export function hasImportValue(value: unknown): boolean {
  return cleanString(value) !== null
}

export function findDuplicateCodes<T extends { Code?: string | null }>(rows: T[]): Set<string> {
  const counts = new Map<string, number>()

  rows.forEach((row) => {
    const code = cleanString(row.Code)?.toUpperCase()
    if (!code) return
    counts.set(code, (counts.get(code) ?? 0) + 1)
  })

  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([code]) => code))
}

export function assignMissingCatalogCodes<T extends { Code?: string | null }>(
  rows: T[],
  existingCodes: Array<string | null | undefined>,
  prefix: CatalogCodePrefix,
): T[] {
  const usedCodes = [...existingCodes]

  return rows.map((row) => {
    if (cleanString(row.Code)) return row

    const code = generateNextCatalogCode(usedCodes, prefix)
    usedCodes.push(code)

    return { ...row, Code: code }
  })
}

export function validateCatalogCode(code: string | null | undefined, prefix: CatalogCodePrefix): string | null {
  const value = cleanString(code)
  if (!value) return null
  return isValidCatalogCode(value, prefix) ? null : `Codigo debe tener formato ${prefix}-001`
}

export async function buildCatalogTemplateBuffer(sheetName: string, columns: ExcelColumn[]): Promise<Buffer> {
  const workbook = createWorkbook()
  addTableSheet(workbook, sheetName, columns, [])
  return workbookToBuffer(workbook)
}
