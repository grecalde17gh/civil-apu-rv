import { validateMaterialRow, type MaterialImportRow } from '../validations/materialImport'
import { prisma } from '../db/prisma'
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

export type PreviewRow = ImportPreviewRow<MaterialImportRow>
export const MATERIALS_TEMPLATE_FILE_NAME = 'materiales.xlsx'

type ExistingMaterial = {
  id: string
  code: string | null
  description: string
  unit: string
  unitCost: { toString(): string }
  cpc: string | null
  vae: { toString(): string } | null
}

const materialSheetConfig = {
  sheetNames: ['materiales', 'materials'],
  columns: {
    Code: ['codigo', 'code'],
    Description: ['descripcion', 'description'],
    Unit: ['unidad', 'unit'],
    UnitPrice: ['costo', 'precio', 'precio_unitario', 'unitprice', 'unit price'],
    Cpc: ['cpc'],
    Vae: ['vae'],
    Note: ['nota', 'observacion', 'note'],
    IsActive: ['estado', 'activo', 'isactive', 'is active'],
    UsesCategory1: ['categoria_1', 'cat_1', 'category_1'],
    UsesCategory2: ['categoria_2', 'cat_2', 'category_2'],
  },
}

type ExistingMaterialIndex = {
  byCode: Map<string, ExistingMaterial>
  byDescription: Map<string, ExistingMaterial>
}

function buildExistingMaterialIndex(existing: ExistingMaterial[]): ExistingMaterialIndex {
  const byCode = new Map<string, ExistingMaterial>()
  const byDescription = new Map<string, ExistingMaterial>()

  existing.forEach((item) => {
    const code = cleanString(item.code)?.toUpperCase()
    if (code) byCode.set(code, item)

    const description = normalizeImportText(item.description)
    if (description) byDescription.set(description, item)
  })

  return { byCode, byDescription }
}

function findExistingMaterial(row: MaterialImportRow, existing: ExistingMaterialIndex): ExistingMaterial | null {
  const code = cleanString(row.Code)?.toUpperCase()
  if (code) {
    return existing.byCode.get(code) ?? null
  }

  const description = normalizeImportText(row.Description)
  if (!description) return null

  return existing.byDescription.get(description) ?? null
}

function materialConflicts(row: MaterialImportRow, existing: ExistingMaterial): ImportConflict[] {
  const conflicts: ImportConflict[] = []

  if (normalizeImportText(row.Description) !== normalizeImportText(existing.description)) {
    conflicts.push({ field: 'descripcion', existing: existing.description, incoming: cleanString(row.Description) })
  }
  if (normalizeImportText(row.Unit) !== normalizeImportText(existing.unit)) {
    conflicts.push({ field: 'unidad', existing: existing.unit, incoming: cleanString(row.Unit) })
  }
  if (!areImportNumbersEqual(row.UnitPrice, existing.unitCost.toString())) {
    conflicts.push({ field: 'costo', existing: Number(existing.unitCost.toString()), incoming: row.UnitPrice ?? null })
  }
  if ((cleanString(row.Cpc) ?? '') !== (cleanString(existing.cpc) ?? '')) {
    conflicts.push({ field: 'cpc', existing: existing.cpc, incoming: cleanString(row.Cpc) })
  }
  if ((row.Vae != null || existing.vae != null) && !areImportNumbersEqual(row.Vae, existing.vae?.toString() ?? null)) {
    conflicts.push({ field: 'vae', existing: existing.vae ? Number(existing.vae.toString()) : null, incoming: row.Vae ?? null })
  }

  return conflicts
}

function materialExistingValues(existing: ExistingMaterial) {
  return {
    Code: existing.code,
    Description: existing.description,
    Unit: existing.unit,
    UnitPrice: Number(existing.unitCost.toString()),
    Cpc: existing.cpc,
    Vae: existing.vae ? Number(existing.vae.toString()) : null,
  }
}

function getRowStatus(errors: string[], conflicts: ImportConflict[], existing: ExistingMaterial | null): ImportRowStatus {
  if (errors.length > 0) return 'error'
  if (existing && conflicts.length > 0) return 'conflict'
  if (existing) return 'existing'
  return 'new'
}

async function buildMaterialPreviewRows(rows: MaterialImportRow[], rawValues: Map<number, Record<string, ImportCellValue>>): Promise<PreviewRow[]> {
  const existing = await prisma.material.findMany({
    select: { id: true, code: true, description: true, unit: true, unitCost: true, cpc: true, vae: true },
  })
  const existingIndex = buildExistingMaterialIndex(existing)
  const duplicateCodes = findDuplicateCodes(rows)
  const usedCodes = existing.map((item) => item.code)

  return rows.map((initialRow) => {
    const row = { ...initialRow }
    const validation = validateMaterialRow(row)
    const code = cleanString(row.Code)?.toUpperCase()
    const errors = [...validation.errors]

    if (code && duplicateCodes.has(code)) {
      errors.push('Codigo duplicado en el archivo')
    }

    const originalValues = rawValues.get(row.rowNumber) ?? {}
    if (hasImportValue(originalValues.UsesCategory1) && row.UsesCategory1 === null) {
      errors.push('categoria_1 debe ser Si/No, true/false o 1/0')
    }
    if (hasImportValue(originalValues.UsesCategory2) && row.UsesCategory2 === null) {
      errors.push('categoria_2 debe ser Si/No, true/false o 1/0')
    }
    if (hasImportValue(originalValues.Cpc) && row.Cpc === null) {
      errors.push('CPC debe ser numerico, porcentaje valido o vacio')
    }
    if (hasImportValue(originalValues.Vae) && row.Vae === null) {
      errors.push('VAE debe ser numerico, porcentaje valido o vacio')
    }

    const existingMaterial = errors.length === 0 ? findExistingMaterial(row, existingIndex) : null
    const conflicts = existingMaterial ? materialConflicts(row, existingMaterial) : []
    const status = getRowStatus(errors, conflicts, existingMaterial)

    if (status === 'new' && !cleanString(row.Code)) {
      const generatedCode = assignMissingCatalogCodes([row], usedCodes, 'MAT')[0].Code
      row.Code = generatedCode
      usedCodes.push(generatedCode)
    } else if (existingMaterial && !cleanString(row.Code)) {
      row.Code = existingMaterial.code
    }

    return {
      rowNumber: row.rowNumber,
      data: row,
      originalValues,
      status,
      conflicts,
      existingValues: existingMaterial ? materialExistingValues(existingMaterial) : undefined,
      errors,
    }
  })
}

export async function previewMaterialsFromBuffer(buffer: ArrayBuffer): Promise<PreviewRow[]> {
  const raw = await parseCatalogSheetFromBuffer(buffer, materialSheetConfig)
  const rawValues = new Map(raw.map((row) => [row.rowNumber, row.values]))
  const rows: MaterialImportRow[] = raw.map((row) => ({
    rowNumber: row.rowNumber,
    Code: cleanString(row.values.Code),
    Description: cleanString(row.values.Description),
    Unit: cleanString(row.values.Unit),
    UnitPrice: parseImportNumber(row.values.UnitPrice),
    Cpc: formatNormalizedOptionalNumber(parseOptionalPercentageInput(row.values.Cpc)),
    Vae: parseOptionalPercentageInput(row.values.Vae),
    Note: cleanString(row.values.Note),
    IsActive: parseImportBoolean(row.values.IsActive),
    UsesCategory1: parseImportBoolean(row.values.UsesCategory1) ?? true,
    UsesCategory2: parseImportBoolean(row.values.UsesCategory2) ?? false,
  }))

  return buildMaterialPreviewRows(rows, rawValues)
}

export async function applyMaterialsImport(rows: MaterialImportRow[]): Promise<ImportApplyResult> {
  const rawValues = new Map(rows.map((row) => [row.rowNumber, {}]))
  const preview = await buildMaterialPreviewRows(rows, rawValues)
  let omitted = 0
  let conflicts = 0
  let rejected = 0
  const newRows: Array<{
    code?: string
    description: string
    unit: string
    unitCost: number
    cpc?: string
    vae?: number
    usesCategory1: boolean
    usesCategory2: boolean
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
      description: String(row.data.Description),
      unit: String(row.data.Unit),
      unitCost: Number(row.data.UnitPrice),
      cpc: cleanString(row.data.Cpc) ?? undefined,
      vae: row.data.Vae ?? undefined,
      usesCategory1: row.data.UsesCategory1 ?? true,
      usesCategory2: row.data.UsesCategory2 ?? false,
      isActive: row.data.IsActive ?? true,
    })
  }

  const created = newRows.length > 0 ? (await prisma.material.createMany({ data: newRows })).count : 0

  return { created, updated: 0, omitted, conflicts, rejected }
}

export async function buildMaterialsTemplateBuffer(): Promise<Buffer> {
  return buildCatalogTemplateBuffer('Materiales', [
    { header: 'codigo', key: 'codigo', width: 14 },
    { header: 'descripcion', key: 'descripcion', width: 42 },
    { header: 'unidad', key: 'unidad', width: 12 },
    { header: 'costo', key: 'costo', width: 14, numFmt: '#,##0.00' },
    { header: 'cpc', key: 'cpc', width: 14 },
    { header: 'vae', key: 'vae', width: 14 },
  ])
}

export const materialsImport = { previewMaterialsFromBuffer, applyMaterialsImport, buildMaterialsTemplateBuffer }
export default materialsImport
