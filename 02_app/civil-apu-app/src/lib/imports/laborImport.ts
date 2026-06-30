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

export type LaborPreviewRow = ImportPreviewRow<LaborImportRow>
export type LaborPreviewResult = {
  preview: LaborPreviewRow[]
  warnings: ImportPreviewWarning[]
  omittedOptionalColumns: string[]
  denominationSummary: DenominationImportSummary
}
export const LABOR_TEMPLATE_FILE_NAME = 'mano_de_obra.xlsx'

type ExistingLabor = {
  id: string
  code: string | null
  roleName: string
  hourlyCost: { toString(): string }
  cpc: string | null
  vae: { toString(): string } | null
  denominationId: string | null
  isActive: boolean
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
  const existing = await prisma.laborItem.findMany({ select: { id: true, code: true, roleName: true, hourlyCost: true, cpc: true, vae: true, denominationId: true, isActive: true } })
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
      if (!generatedCode) {
        errors.push('No se pudo generar codigo para la mano de obra')
      }
      row.Code = generatedCode
      if (generatedCode) usedCodes.push(generatedCode)
    } else if (existingLabor && !cleanString(row.Code)) {
      row.Code = existingLabor.code
    }

    return {
      rowNumber: row.rowNumber,
      data: row,
      originalValues,
      status,
      existingId: existingLabor?.id,
      conflicts,
      existingValues: existingLabor
        ? {
            Code: existingLabor.code,
            RoleName: existingLabor.roleName,
            Unit: 'hora',
            HourlyCost: Number(existingLabor.hourlyCost.toString()),
            Cpc: existingLabor.cpc,
            Vae: existingLabor.vae ? Number(existingLabor.vae.toString()) : null,
            Category: existingLabor.denominationId,
            IsActive: existingLabor.isActive,
          }
        : undefined,
      errors,
    }
  })
}

export async function previewLaborFromBuffer(buffer: ArrayBuffer): Promise<LaborPreviewRow[]> {
  const result = await previewLaborImportFromBuffer(buffer)
  return result.preview
}

export async function previewLaborImportFromBuffer(buffer: ArrayBuffer): Promise<LaborPreviewResult> {
  const parsed = await parseCatalogSheetWithMetadataFromBuffer(buffer, laborSheetConfig)
  const rawValues = new Map(parsed.rows.map((row) => [row.rowNumber, row.values]))
  const rows: LaborImportRow[] = parsed.rows.map((row) => ({
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
  const denominationLookup = await loadDenominationLookup()
  const preview = await buildLaborPreviewRows(rows, rawValues)

  return {
    preview,
    warnings: parsed.warnings,
    omittedOptionalColumns: parsed.omittedOptionalColumns,
    denominationSummary: summarizeDenominationValues(rows.map((row) => row.Category), denominationLookup),
  }
}

export async function applyLaborImport(rows: LaborImportRow[], options: CatalogImportApplyOptions = {}): Promise<ImportApplyResult> {
  const rawValues = new Map(rows.map((row) => [row.rowNumber, {}]))
  const preview = await buildLaborPreviewRows(rows, rawValues)
  const updateMode = options.updateMode ?? 'skip-existing'
  const selectedFields = new Set(options.overwriteFields ?? [])
  const updatedFields: Partial<Record<CatalogUpdateField, number>> = {}
  let omitted = 0
  let conflicts = 0
  let rejected = 0
  let updated = 0
  const newRows: Array<{
    code?: string
    roleName: string
    hourlyCost: number
    cpc?: string
    vae?: number
    category?: string
    denominationId?: string
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
      debugMessages.push(`Registro encontrado: ${row.data.Code ?? row.data.RoleName ?? `fila ${row.rowNumber}`}`)
      if (row.status === 'conflict' && updateMode === 'skip-existing') {
        conflicts++
      }

      if (shouldSkipMissingDenominationUpdate(row, denominationLookup, updateMode, selectedFields, missingDenominations, debugMessages)) {
        omitted++
        continue
      }

      const updateData = buildLaborUpdateData(row, denominationLookup, updateMode, selectedFields, updatedFields)
      if (!row.existingId || Object.keys(updateData).length === 0) {
        omitted++
        debugMessages.push(`Registro omitido sin cambios aplicables: ${row.data.Code ?? row.data.RoleName ?? `fila ${row.rowNumber}`}`)
        continue
      }

      await prisma.laborItem.update({
        where: { id: row.existingId },
        data: updateData,
      })
      updated++
      Object.keys(updateData).forEach((field) => {
        debugMessages.push(`Campo actualizado en ${row.data.Code ?? row.data.RoleName ?? `fila ${row.rowNumber}`}: ${field}`)
      })
      continue
    }

    newRows.push({
      code: cleanString(row.data.Code) ?? undefined,
      roleName: String(row.data.RoleName),
      hourlyCost: Number(row.data.HourlyCost),
      cpc: cleanString(row.data.Cpc) ?? undefined,
      vae: row.data.Vae ?? undefined,
      category: undefined,
      denominationId: resolveDenominationId(row.data.Category, denominationLookup),
      isActive: row.data.IsActive ?? true,
    })
  }

  const created = newRows.length > 0 ? (await prisma.laborItem.createMany({ data: newRows })).count : 0

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
  row: LaborPreviewRow,
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
    debugMessages.push(`Denominacion IPCO encontrada para ${row.data.Code ?? row.data.RoleName ?? `fila ${row.rowNumber}`}: ${incomingDenomination}`)
    return false
  }

  missingDenominations.add(incomingDenomination)
  debugMessages.push(`Registro omitido por Denominacion IPCO no encontrada: ${row.data.Code ?? row.data.RoleName ?? `fila ${row.rowNumber}`} -> ${incomingDenomination}`)
  return true
}

function buildLaborUpdateData(
  row: LaborPreviewRow,
  denominationLookup: Map<string, string>,
  updateMode: NonNullable<CatalogImportApplyOptions['updateMode']>,
  selectedFields: Set<CatalogUpdateField>,
  updatedFields: Partial<Record<CatalogUpdateField, number>>,
) {
  const data: {
    hourlyCost?: number
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
    incomingHasValue: row.data.HourlyCost !== null && row.data.HourlyCost !== undefined,
    existingHasValue: existing.HourlyCost !== null && existing.HourlyCost !== undefined,
  })) {
    data.hourlyCost = Number(row.data.HourlyCost)
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

export const laborImport = { previewLaborFromBuffer, previewLaborImportFromBuffer, applyLaborImport, buildLaborTemplateBuffer }
export default laborImport
