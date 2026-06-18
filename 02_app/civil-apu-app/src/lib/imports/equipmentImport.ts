import { prisma } from '../db/prisma'
import { validateEquipmentImportRow, type EquipmentImportRow } from '../validations/equipmentImport'
import {
  areImportNumbersEqual,
  assignMissingCatalogCodes,
  buildCatalogTemplateBuffer,
  buildDenominationLookup,
  cleanString,
  findDuplicateCodes,
  hasImportValue,
  normalizeImportText,
  parseCatalogSheetFromBuffer,
  formatNormalizedOptionalNumber,
  parseImportBoolean,
  parseImportNumber,
  parseOptionalPercentageInput,
  resolveDenominationId,
  type ImportApplyResult,
  type ImportCellValue,
  type ImportConflict,
  type ImportPreviewRow,
  type ImportRowStatus,
} from './commonImport'

export type EquipmentPreviewRow = ImportPreviewRow<EquipmentImportRow>
export const EQUIPMENT_TEMPLATE_FILE_NAME = 'equipos.xlsx'

type ExistingEquipment = {
  id: string
  code: string | null
  description: string
  hourlyRate: { toString(): string } | null
  cpc: string | null
  vae: { toString(): string } | null
}

const equipmentSheetConfig = {
  sheetNames: ['equipos', 'equipment'],
  columns: {
    Code: ['codigo', 'code'],
    Description: ['descripcion', 'description'],
    Unit: ['unidad', 'unit'],
    HourlyRate: ['tarifa', 'costo', 'hourlyrate', 'hourly rate'],
    Cpc: ['cpc'],
    Vae: ['vae'],
    EquipmentType: ['tipo', 'equipment_type', 'equipmenttype'],
    Category: ['categoria', 'category', 'denominacion', 'denominacion_ipco'],
    IsActive: ['estado', 'activo', 'isactive', 'is active'],
  },
}

type ExistingEquipmentIndex = {
  byCode: Map<string, ExistingEquipment>
  byDescription: Map<string, ExistingEquipment>
}

function buildExistingEquipmentIndex(existing: ExistingEquipment[]): ExistingEquipmentIndex {
  const byCode = new Map<string, ExistingEquipment>()
  const byDescription = new Map<string, ExistingEquipment>()

  existing.forEach((item) => {
    const code = cleanString(item.code)?.toUpperCase()
    if (code) byCode.set(code, item)

    const description = normalizeImportText(item.description)
    if (description) byDescription.set(description, item)
  })

  return { byCode, byDescription }
}

function findExistingEquipment(row: EquipmentImportRow, existing: ExistingEquipmentIndex): ExistingEquipment | null {
  const code = cleanString(row.Code)?.toUpperCase()
  if (code) {
    return existing.byCode.get(code) ?? null
  }

  const description = normalizeImportText(row.Description)
  if (!description) return null

  return existing.byDescription.get(description) ?? null
}

function equipmentConflicts(row: EquipmentImportRow, existing: ExistingEquipment): ImportConflict[] {
  const conflicts: ImportConflict[] = []

  if (normalizeImportText(row.Description) !== normalizeImportText(existing.description)) {
    conflicts.push({ field: 'descripcion', existing: existing.description, incoming: cleanString(row.Description) })
  }
  if (normalizeImportText(row.Unit) !== 'hora') {
    conflicts.push({ field: 'unidad', existing: 'hora', incoming: cleanString(row.Unit) })
  }
  if (!areImportNumbersEqual(row.HourlyRate, existing.hourlyRate?.toString() ?? null)) {
    conflicts.push({
      field: 'tarifa',
      existing: existing.hourlyRate ? Number(existing.hourlyRate.toString()) : null,
      incoming: row.HourlyRate ?? null,
    })
  }
  if ((cleanString(row.Cpc) ?? '') !== (cleanString(existing.cpc) ?? '')) {
    conflicts.push({ field: 'cpc', existing: existing.cpc, incoming: cleanString(row.Cpc) })
  }
  if ((row.Vae != null || existing.vae != null) && !areImportNumbersEqual(row.Vae, existing.vae?.toString() ?? null)) {
    conflicts.push({ field: 'vae', existing: existing.vae ? Number(existing.vae.toString()) : null, incoming: row.Vae ?? null })
  }

  return conflicts
}

function getRowStatus(errors: string[], conflicts: ImportConflict[], existing: ExistingEquipment | null): ImportRowStatus {
  if (errors.length > 0) return 'error'
  if (existing && conflicts.length > 0) return 'conflict'
  if (existing) return 'existing'
  return 'new'
}

async function buildEquipmentPreviewRows(rows: EquipmentImportRow[], rawValues: Map<number, Record<string, ImportCellValue>>): Promise<EquipmentPreviewRow[]> {
  const existing = await prisma.equipmentItem.findMany({
    select: { id: true, code: true, description: true, hourlyRate: true, cpc: true, vae: true },
  })
  const existingIndex = buildExistingEquipmentIndex(existing)
  const duplicateCodes = findDuplicateCodes(rows)
  const usedCodes = existing.map((item) => item.code)

  return rows.map((initialRow) => {
    const row = { ...initialRow }
    const validation = validateEquipmentImportRow(row)
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

    const existingEquipment = errors.length === 0 ? findExistingEquipment(row, existingIndex) : null
    const conflicts = existingEquipment ? equipmentConflicts(row, existingEquipment) : []
    const status = getRowStatus(errors, conflicts, existingEquipment)

    if (status === 'new' && !cleanString(row.Code)) {
      const generatedCode = assignMissingCatalogCodes([row], usedCodes, 'EQ')[0].Code
      if (!generatedCode) {
        errors.push('No se pudo generar codigo para el equipo')
      }
      row.Code = generatedCode
      if (generatedCode) usedCodes.push(generatedCode)
    } else if (existingEquipment && !cleanString(row.Code)) {
      row.Code = existingEquipment.code
    }

    return {
      rowNumber: row.rowNumber,
      data: row,
      originalValues,
      status,
      conflicts,
      existingValues: existingEquipment
        ? {
            Code: existingEquipment.code,
            Description: existingEquipment.description,
            Unit: 'hora',
            HourlyRate: existingEquipment.hourlyRate ? Number(existingEquipment.hourlyRate.toString()) : null,
            Cpc: existingEquipment.cpc,
            Vae: existingEquipment.vae ? Number(existingEquipment.vae.toString()) : null,
          }
        : undefined,
      errors,
    }
  })
}

export async function previewEquipmentFromBuffer(buffer: ArrayBuffer): Promise<EquipmentPreviewRow[]> {
  const raw = await parseCatalogSheetFromBuffer(buffer, equipmentSheetConfig)
  const rawValues = new Map(raw.map((row) => [row.rowNumber, row.values]))
  const rows: EquipmentImportRow[] = raw.map((row) => ({
    rowNumber: row.rowNumber,
    Code: cleanString(row.values.Code),
    Description: cleanString(row.values.Description),
    Unit: cleanString(row.values.Unit),
    HourlyRate: parseImportNumber(row.values.HourlyRate),
    Cpc: formatNormalizedOptionalNumber(parseOptionalPercentageInput(row.values.Cpc)),
    Vae: parseOptionalPercentageInput(row.values.Vae),
    EquipmentType: cleanString(row.values.EquipmentType) ?? cleanString(row.values.Category),
    Category: cleanString(row.values.Category),
    IsActive: parseImportBoolean(row.values.IsActive),
  }))
  return buildEquipmentPreviewRows(rows, rawValues)
}

export async function applyEquipmentImport(rows: EquipmentImportRow[]): Promise<ImportApplyResult> {
  const rawValues = new Map(rows.map((row) => [row.rowNumber, {}]))
  const preview = await buildEquipmentPreviewRows(rows, rawValues)
  let omitted = 0
  let conflicts = 0
  let rejected = 0
  const newRows: Array<{
    code?: string
    description: string
    equipmentType?: string
    hourlyRate: number
    cpc?: string
    vae?: number
    denominationId?: string
    maintenanceRequired: boolean
    isActive: boolean
  }> = []
  const denominations = await prisma.ipcoDenomination.findMany({ select: { id: true, code: true, name: true } })
  const denominationLookup = buildDenominationLookup(denominations)

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
      equipmentType: cleanString(row.data.EquipmentType) ?? undefined,
      hourlyRate: Number(row.data.HourlyRate),
      cpc: cleanString(row.data.Cpc) ?? undefined,
      vae: row.data.Vae ?? undefined,
      denominationId: resolveDenominationId(row.data.Category, denominationLookup),
      maintenanceRequired: false,
      isActive: row.data.IsActive ?? true,
    })
  }

  const created = newRows.length > 0 ? (await prisma.equipmentItem.createMany({ data: newRows })).count : 0

  return { created, updated: 0, omitted, conflicts, rejected }
}

export async function buildEquipmentTemplateBuffer(): Promise<Buffer> {
  return buildCatalogTemplateBuffer('Equipos', [
    { header: 'codigo', key: 'codigo', width: 14 },
    { header: 'descripcion', key: 'descripcion', width: 42 },
    { header: 'unidad', key: 'unidad', width: 12 },
    { header: 'tarifa', key: 'tarifa', width: 14, numFmt: '#,##0.00' },
    { header: 'cpc', key: 'cpc', width: 14 },
    { header: 'vae', key: 'vae', width: 14 },
  ])
}

export const equipmentImport = { previewEquipmentFromBuffer, applyEquipmentImport, buildEquipmentTemplateBuffer }
export default equipmentImport
