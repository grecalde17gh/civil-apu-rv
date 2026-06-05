import { prisma } from '../db/prisma'
import { validateLaborImportRow, type LaborImportRow } from '../validations/laborImport'
import {
  areImportNumbersEqual,
  assignMissingCatalogCodes,
  buildCatalogTemplateBuffer,
  cleanString,
  findDuplicateCodes,
  hasImportValue,
  normalizeImportText,
  parseCatalogSheetFromBuffer,
  formatNormalizedOptionalNumber,
  parseImportBoolean,
  parseImportNumber,
  parseOptionalPercentageInput,
  type ImportApplyResult,
  type ImportCellValue,
  type ImportConflict,
  type ImportPreviewRow,
  type ImportRowStatus,
} from './commonImport'

export type LaborPreviewRow = ImportPreviewRow<LaborImportRow>
export const LABOR_TEMPLATE_FILE_NAME = 'mano_de_obra.xlsx'

type ExistingLabor = {
  id: string
  code: string | null
  roleName: string
  hourlyCost: { toString(): string }
  cpc: string | null
  vae: { toString(): string } | null
}

const laborSheetConfig = {
  sheetNames: ['mano_de_obra', 'mano de obra', 'labor'],
  columns: {
    Code: ['codigo', 'code'],
    RoleName: ['rol', 'descripcion', 'description', 'role', 'role_name'],
    Unit: ['unidad', 'unit'],
    HourlyCost: ['costo', 'tarifa', 'hourlycost', 'hourly cost'],
    Cpc: ['cpc'],
    Vae: ['vae'],
    Category: ['categoria', 'category'],
    IsActive: ['estado', 'activo', 'isactive', 'is active'],
  },
}

type ExistingLaborIndex = {
  byCode: Map<string, ExistingLabor>
  byRoleName: Map<string, ExistingLabor>
}

function buildExistingLaborIndex(existing: ExistingLabor[]): ExistingLaborIndex {
  const byCode = new Map<string, ExistingLabor>()
  const byRoleName = new Map<string, ExistingLabor>()

  existing.forEach((item) => {
    const code = cleanString(item.code)?.toUpperCase()
    if (code) byCode.set(code, item)

    const roleName = normalizeImportText(item.roleName)
    if (roleName) byRoleName.set(roleName, item)
  })

  return { byCode, byRoleName }
}

function findExistingLabor(row: LaborImportRow, existing: ExistingLaborIndex): ExistingLabor | null {
  const code = cleanString(row.Code)?.toUpperCase()
  if (code) {
    return existing.byCode.get(code) ?? null
  }

  const roleName = normalizeImportText(row.RoleName)
  if (!roleName) return null

  return existing.byRoleName.get(roleName) ?? null
}

function laborConflicts(row: LaborImportRow, existing: ExistingLabor): ImportConflict[] {
  const conflicts: ImportConflict[] = []

  if (normalizeImportText(row.RoleName) !== normalizeImportText(existing.roleName)) {
    conflicts.push({ field: 'rol', existing: existing.roleName, incoming: cleanString(row.RoleName) })
  }
  if (normalizeImportText(row.Unit) !== 'hora') {
    conflicts.push({ field: 'unidad', existing: 'hora', incoming: cleanString(row.Unit) })
  }
  if (!areImportNumbersEqual(row.HourlyCost, existing.hourlyCost.toString())) {
    conflicts.push({ field: 'costo', existing: Number(existing.hourlyCost.toString()), incoming: row.HourlyCost ?? null })
  }
  if ((cleanString(row.Cpc) ?? '') !== (cleanString(existing.cpc) ?? '')) {
    conflicts.push({ field: 'cpc', existing: existing.cpc, incoming: cleanString(row.Cpc) })
  }
  if ((row.Vae != null || existing.vae != null) && !areImportNumbersEqual(row.Vae, existing.vae?.toString() ?? null)) {
    conflicts.push({ field: 'vae', existing: existing.vae ? Number(existing.vae.toString()) : null, incoming: row.Vae ?? null })
  }

  return conflicts
}

function getRowStatus(errors: string[], conflicts: ImportConflict[], existing: ExistingLabor | null): ImportRowStatus {
  if (errors.length > 0) return 'error'
  if (existing && conflicts.length > 0) return 'conflict'
  if (existing) return 'existing'
  return 'new'
}

async function buildLaborPreviewRows(rows: LaborImportRow[], rawValues: Map<number, Record<string, ImportCellValue>>): Promise<LaborPreviewRow[]> {
  const existing = await prisma.laborItem.findMany({ select: { id: true, code: true, roleName: true, hourlyCost: true, cpc: true, vae: true } })
  const existingIndex = buildExistingLaborIndex(existing)
  const duplicateCodes = findDuplicateCodes(rows)
  const usedCodes = existing.map((item) => item.code)

  return rows.map((initialRow) => {
    const row = { ...initialRow }
    const validation = validateLaborImportRow(row)
    const code = cleanString(row.Code)?.toUpperCase()
    const errors = [...validation.errors]

    if (code && duplicateCodes.has(code)) {
      errors.push('Codigo duplicado en el archivo')
    }

    const originalValues = rawValues.get(row.rowNumber) ?? {}
    if (hasImportValue(originalValues.Cpc) && row.Cpc === null) {
      errors.push('CPC debe ser numerico, porcentaje valido o vacio')
    }
    if (hasImportValue(originalValues.Vae) && row.Vae === null) {
      errors.push('VAE debe ser numerico, porcentaje valido o vacio')
    }

    const existingLabor = errors.length === 0 ? findExistingLabor(row, existingIndex) : null
    const conflicts = existingLabor ? laborConflicts(row, existingLabor) : []
    const status = getRowStatus(errors, conflicts, existingLabor)

    if (status === 'new' && !cleanString(row.Code)) {
      const generatedCode = assignMissingCatalogCodes([row], usedCodes, 'MO')[0].Code
      row.Code = generatedCode
      usedCodes.push(generatedCode)
    } else if (existingLabor && !cleanString(row.Code)) {
      row.Code = existingLabor.code
    }

    return {
      rowNumber: row.rowNumber,
      data: row,
      originalValues,
      status,
      conflicts,
      existingValues: existingLabor
        ? {
            Code: existingLabor.code,
            RoleName: existingLabor.roleName,
            Unit: 'hora',
            HourlyCost: Number(existingLabor.hourlyCost.toString()),
            Cpc: existingLabor.cpc,
            Vae: existingLabor.vae ? Number(existingLabor.vae.toString()) : null,
          }
        : undefined,
      errors,
    }
  })
}

export async function previewLaborFromBuffer(buffer: ArrayBuffer): Promise<LaborPreviewRow[]> {
  const raw = await parseCatalogSheetFromBuffer(buffer, laborSheetConfig)
  const rawValues = new Map(raw.map((row) => [row.rowNumber, row.values]))
  const rows: LaborImportRow[] = raw.map((row) => ({
    rowNumber: row.rowNumber,
    Code: cleanString(row.values.Code),
    RoleName: cleanString(row.values.RoleName),
    Unit: cleanString(row.values.Unit),
    HourlyCost: parseImportNumber(row.values.HourlyCost),
    Cpc: formatNormalizedOptionalNumber(parseOptionalPercentageInput(row.values.Cpc)),
    Vae: parseOptionalPercentageInput(row.values.Vae),
    Category: cleanString(row.values.Category),
    IsActive: parseImportBoolean(row.values.IsActive),
  }))
  return buildLaborPreviewRows(rows, rawValues)
}

export async function applyLaborImport(rows: LaborImportRow[]): Promise<ImportApplyResult> {
  const rawValues = new Map(rows.map((row) => [row.rowNumber, {}]))
  const preview = await buildLaborPreviewRows(rows, rawValues)
  let omitted = 0
  let conflicts = 0
  let rejected = 0
  const newRows: Array<{
    code?: string
    roleName: string
    hourlyCost: number
    cpc?: string
    vae?: number
    category?: string
    isActive: boolean
  }> = []

  for (const row of preview) {
    if (row.status === 'existing') {
      omitted++
      continue
    }
    if (row.status === 'conflict') {
      conflicts++
      continue
    }
    if (row.status === 'error') {
      rejected++
      continue
    }

    newRows.push({
      code: cleanString(row.data.Code) ?? undefined,
      roleName: String(row.data.RoleName),
      hourlyCost: Number(row.data.HourlyCost),
      cpc: cleanString(row.data.Cpc) ?? undefined,
      vae: row.data.Vae ?? undefined,
      category: cleanString(row.data.Category) ?? undefined,
      isActive: row.data.IsActive ?? true,
    })
  }

  const created = newRows.length > 0 ? (await prisma.laborItem.createMany({ data: newRows })).count : 0

  return { created, updated: 0, omitted, conflicts, rejected }
}

export async function buildLaborTemplateBuffer(): Promise<Buffer> {
  return buildCatalogTemplateBuffer('Mano de obra', [
    { header: 'codigo', key: 'codigo', width: 14 },
    { header: 'rol', key: 'rol', width: 36 },
    { header: 'unidad', key: 'unidad', width: 12 },
    { header: 'costo', key: 'costo', width: 14, numFmt: '#,##0.00' },
    { header: 'cpc', key: 'cpc', width: 14 },
    { header: 'vae', key: 'vae', width: 14 },
  ])
}

export const laborImport = { previewLaborFromBuffer, applyLaborImport, buildLaborTemplateBuffer }
export default laborImport
