import { prisma } from '../db/prisma'
import { validateEquipmentImportRow, type EquipmentImportRow } from '../validations/equipmentImport'
import {
  areImportNumbersEqual,
  assignMissingCatalogCodes,
  buildCatalogTemplateBuffer,
  cleanString,
  findDuplicateCodes,
  hasImportValue,
  normalizeImportText,
  parseCatalogSheetWithMetadataFromBuffer,
  formatNormalizedOptionalNumber,
  incrementUpdatedField,
  parseImportBoolean,
  parseImportNumber,
  parseOptionalPercentageInput,
  resolveDenominationId,
  shouldUpdateCatalogField,
  type CatalogImportApplyOptions,
  type CatalogUpdateField,
  type DenominationImportSummary,
  type ImportApplyResult,
  type ImportCellValue,
  type ImportConflict,
  type ImportPreviewRow,
  type ImportPreviewWarning,
  type ImportRowStatus,
} from './commonImport'
import { loadDenominationLookup, prepareDenominationsForImport, shouldUpdateDenomination, summarizeDenominationValues } from './catalogDenominations'

export type EquipmentPreviewRow = ImportPreviewRow<EquipmentImportRow>
export type EquipmentPreviewResult = {
  preview: EquipmentPreviewRow[]
  warnings: ImportPreviewWarning[]
  omittedOptionalColumns: string[]
  denominationSummary: DenominationImportSummary
}
export const EQUIPMENT_TEMPLATE_FILE_NAME = 'equipos.xlsx'

type ExistingEquipment = {
  id: string
  code: string | null
  description: string
  hourlyRate: { toString(): string } | null
  cpc: string | null
  vae: { toString(): string } | null
  denominationId: string | null
  isActive: boolean
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
  optionalColumns: [
    {
      key: 'Category',
      label: 'Denominación IPCO',
      message: 'El archivo no contiene la columna "Denominación IPCO". Los registros fueron importados sin esta información.',
    },
    {
      key: 'Code',
      label: 'Código',
      message: 'El archivo no contiene la columna "Código". Se utilizaron los códigos disponibles del sistema.',
    },
    {
      key: 'IsActive',
      label: 'Estado',
      message: 'El archivo no contiene la columna "Estado". Se asignó el estado por defecto.',
    },
  ],
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
    select: { id: true, code: true, description: true, hourlyRate: true, cpc: true, vae: true, denominationId: true, isActive: true },
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
      existingId: existingEquipment?.id,
      conflicts,
      existingValues: existingEquipment
        ? {
            Code: existingEquipment.code,
            Description: existingEquipment.description,
            Unit: 'hora',
            HourlyRate: existingEquipment.hourlyRate ? Number(existingEquipment.hourlyRate.toString()) : null,
            Cpc: existingEquipment.cpc,
            Vae: existingEquipment.vae ? Number(existingEquipment.vae.toString()) : null,
            Category: existingEquipment.denominationId,
            IsActive: existingEquipment.isActive,
          }
        : undefined,
      errors,
    }
  })
}

export async function previewEquipmentFromBuffer(buffer: ArrayBuffer): Promise<EquipmentPreviewRow[]> {
  const result = await previewEquipmentImportFromBuffer(buffer)
  return result.preview
}

export async function previewEquipmentImportFromBuffer(buffer: ArrayBuffer): Promise<EquipmentPreviewResult> {
  const parsed = await parseCatalogSheetWithMetadataFromBuffer(buffer, equipmentSheetConfig)
  const rawValues = new Map(parsed.rows.map((row) => [row.rowNumber, row.values]))
  const rows: EquipmentImportRow[] = parsed.rows.map((row) => ({
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
  const denominationLookup = await loadDenominationLookup()
  const preview = await buildEquipmentPreviewRows(rows, rawValues)

  return {
    preview,
    warnings: parsed.warnings,
    omittedOptionalColumns: parsed.omittedOptionalColumns,
    denominationSummary: summarizeDenominationValues(rows.map((row) => row.Category), denominationLookup),
  }
}

export async function applyEquipmentImport(rows: EquipmentImportRow[], options: CatalogImportApplyOptions = {}): Promise<ImportApplyResult> {
  const rawValues = new Map(rows.map((row) => [row.rowNumber, {}]))
  const preview = await buildEquipmentPreviewRows(rows, rawValues)
  const updateMode = options.updateMode ?? 'skip-existing'
  const selectedFields = new Set(options.overwriteFields ?? [])
  const updatedFields: Partial<Record<CatalogUpdateField, number>> = {}
  let omitted = 0
  let conflicts = 0
  let rejected = 0
  let updated = 0
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
  const denominationPreparation = await prepareDenominationsForImport(
    preview.map((row) => row.data.Category),
    options.createMissingDenominations ?? false,
  )
  const denominationLookup = denominationPreparation.lookup
  const missingDenominations = new Set(denominationPreparation.missingDenominations)
  const debugMessages = [...denominationPreparation.debugMessages]

  for (const row of preview) {
    if (row.status === 'error') {
      rejected++
      continue
    }
    if (row.status === 'existing' || row.status === 'conflict') {
      debugMessages.push(`Registro encontrado: ${row.data.Code ?? row.data.Description ?? `fila ${row.rowNumber}`}`)
      if (row.status === 'conflict' && updateMode === 'skip-existing') {
        conflicts++
      }

      if (shouldSkipMissingDenominationUpdate(row, denominationLookup, updateMode, selectedFields, missingDenominations, debugMessages)) {
        omitted++
        continue
      }

      const updateData = buildEquipmentUpdateData(row, denominationLookup, updateMode, selectedFields, updatedFields)
      if (!row.existingId || Object.keys(updateData).length === 0) {
        omitted++
        debugMessages.push(`Registro omitido sin cambios aplicables: ${row.data.Code ?? row.data.Description ?? `fila ${row.rowNumber}`}`)
        continue
      }

      await prisma.equipmentItem.update({
        where: { id: row.existingId },
        data: updateData,
      })
      updated++
      Object.keys(updateData).forEach((field) => {
        debugMessages.push(`Campo actualizado en ${row.data.Code ?? row.data.Description ?? `fila ${row.rowNumber}`}: ${field}`)
      })
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

  return {
    created,
    updated,
    omitted,
    conflicts,
    rejected,
    updatedFields,
    createdDenominations: denominationPreparation.createdDenominations,
    missingDenominations: [...missingDenominations],
    debugMessages,
  }
}

function shouldSkipMissingDenominationUpdate(
  row: EquipmentPreviewRow,
  denominationLookup: Map<string, string>,
  updateMode: NonNullable<CatalogImportApplyOptions['updateMode']>,
  selectedFields: Set<CatalogUpdateField>,
  missingDenominations: Set<string>,
  debugMessages: string[],
) {
  if (!shouldUpdateDenomination({
    incomingValue: row.data.Category,
    existingValue: row.existingValues?.Category,
    updateMode,
    selectedFields,
  })) {
    return false
  }

  const incomingDenomination = cleanString(row.data.Category)
  if (!incomingDenomination) return false

  const denominationId = resolveDenominationId(incomingDenomination, denominationLookup)
  if (denominationId) {
    debugMessages.push(`Denominacion IPCO encontrada para ${row.data.Code ?? row.data.Description ?? `fila ${row.rowNumber}`}: ${incomingDenomination}`)
    return false
  }

  missingDenominations.add(incomingDenomination)
  debugMessages.push(`Registro omitido por Denominacion IPCO no encontrada: ${row.data.Code ?? row.data.Description ?? `fila ${row.rowNumber}`} -> ${incomingDenomination}`)
  return true
}

function buildEquipmentUpdateData(
  row: EquipmentPreviewRow,
  denominationLookup: Map<string, string>,
  updateMode: NonNullable<CatalogImportApplyOptions['updateMode']>,
  selectedFields: Set<CatalogUpdateField>,
  updatedFields: Partial<Record<CatalogUpdateField, number>>,
) {
  const data: {
    hourlyRate?: number
    cpc?: string
    vae?: number
    denominationId?: string
    isActive?: boolean
  } = {}
  const existing = row.existingValues ?? {}
  const incomingDenomination = cleanString(row.data.Category)
  const incomingDenominationId = resolveDenominationId(incomingDenomination, denominationLookup)
  const incomingCpc = cleanString(row.data.Cpc)

  if (shouldUpdateCatalogField({
    mode: updateMode,
    field: 'denomination',
    selectedFields,
    incomingHasValue: Boolean(incomingDenomination),
    existingHasValue: Boolean(existing.Category),
  })) {
    data.denominationId = incomingDenominationId
    incrementUpdatedField(updatedFields, 'denomination')
  }

  if (shouldUpdateCatalogField({
    mode: updateMode,
    field: 'cpc',
    selectedFields,
    incomingHasValue: Boolean(incomingCpc),
    existingHasValue: Boolean(cleanString(existing.Cpc)),
  })) {
    data.cpc = incomingCpc ?? undefined
    incrementUpdatedField(updatedFields, 'cpc')
  }

  if (shouldUpdateCatalogField({
    mode: updateMode,
    field: 'vae',
    selectedFields,
    incomingHasValue: row.data.Vae !== null && row.data.Vae !== undefined,
    existingHasValue: existing.Vae !== null && existing.Vae !== undefined,
  })) {
    data.vae = row.data.Vae ?? undefined
    incrementUpdatedField(updatedFields, 'vae')
  }

  if (shouldUpdateCatalogField({
    mode: updateMode,
    field: 'price',
    selectedFields,
    incomingHasValue: row.data.HourlyRate !== null && row.data.HourlyRate !== undefined,
    existingHasValue: existing.HourlyRate !== null && existing.HourlyRate !== undefined,
  })) {
    data.hourlyRate = Number(row.data.HourlyRate)
    incrementUpdatedField(updatedFields, 'price')
  }

  if (shouldUpdateCatalogField({
    mode: updateMode,
    field: 'isActive',
    selectedFields,
    incomingHasValue: row.data.IsActive !== null && row.data.IsActive !== undefined,
    existingHasValue: existing.IsActive !== null && existing.IsActive !== undefined,
  })) {
    data.isActive = row.data.IsActive ?? undefined
    incrementUpdatedField(updatedFields, 'isActive')
  }

  return data
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

export const equipmentImport = { previewEquipmentFromBuffer, previewEquipmentImportFromBuffer, applyEquipmentImport, buildEquipmentTemplateBuffer }
export default equipmentImport
