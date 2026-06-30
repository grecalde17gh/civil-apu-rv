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

export type PreviewRow = ImportPreviewRow<MaterialImportRow>
export type MaterialsPreviewResult = {
  preview: PreviewRow[]
  warnings: ImportPreviewWarning[]
  omittedOptionalColumns: string[]
  denominationSummary: DenominationImportSummary
}
export const MATERIALS_TEMPLATE_FILE_NAME = 'materiales.xlsx'

type ExistingMaterial = {
  id: string
  code: string | null
  description: string
  unit: string
  price1?: { toString(): string }
  price2: { toString(): string } | null
  price3: { toString(): string } | null
  unitCost: { toString(): string }
  cpc: string | null
  vae: { toString(): string } | null
  denominationId: string | null
  isActive: boolean
}

const materialSheetConfig = {
  sheetNames: ['materiales', 'materials'],
  columns: {
    Code: ['codigo', 'code'],
    Description: ['descripcion', 'description'],
    Unit: ['unidad', 'unit'],
    UnitPrice: ['costo', 'precio', 'precio_unitario', 'unitprice', 'unit price'],
    Price2: ['precio_2', 'precio 2', 'price_2', 'price 2'],
    Price3: ['precio_3', 'precio 3', 'price_3', 'price 3'],
    Cpc: ['cpc'],
    Vae: ['vae'],
    Note: ['nota', 'observacion', 'note'],
    Denomination: ['denominacion', 'denominacion_ipco', 'categoria', 'category'],
    IsActive: ['estado', 'activo', 'isactive', 'is active'],
    UsesCategory1: ['categoria_1', 'cat_1', 'category_1'],
    UsesCategory2: ['categoria_2', 'cat_2', 'category_2'],
  },
  optionalColumns: [
    {
      key: 'Denomination',
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
  const existingPrice1 = existing.price1 ?? existing.unitCost

  if (normalizeImportText(row.Description) !== normalizeImportText(existing.description)) {
    conflicts.push({ field: 'descripcion', existing: existing.description, incoming: cleanString(row.Description) })
  }
  if (normalizeImportText(row.Unit) !== normalizeImportText(existing.unit)) {
    conflicts.push({ field: 'unidad', existing: existing.unit, incoming: cleanString(row.Unit) })
  }
  if (!areImportNumbersEqual(row.UnitPrice, existingPrice1.toString())) {
    conflicts.push({ field: 'precio_1', existing: Number(existingPrice1.toString()), incoming: row.UnitPrice ?? null })
  }
  if ((row.Price2 != null || existing.price2 != null) && !areImportNumbersEqual(row.Price2, existing.price2?.toString() ?? null)) {
    conflicts.push({ field: 'precio_2', existing: existing.price2 ? Number(existing.price2.toString()) : null, incoming: row.Price2 ?? null })
  }
  if ((row.Price3 != null || existing.price3 != null) && !areImportNumbersEqual(row.Price3, existing.price3?.toString() ?? null)) {
    conflicts.push({ field: 'precio_3', existing: existing.price3 ? Number(existing.price3.toString()) : null, incoming: row.Price3 ?? null })
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
  const existingPrice1 = existing.price1 ?? existing.unitCost

  return {
    Code: existing.code,
    Description: existing.description,
    Unit: existing.unit,
    UnitPrice: Number(existingPrice1.toString()),
    Price2: existing.price2 ? Number(existing.price2.toString()) : null,
    Price3: existing.price3 ? Number(existing.price3.toString()) : null,
    Cpc: existing.cpc,
    Vae: existing.vae ? Number(existing.vae.toString()) : null,
    Denomination: existing.denominationId,
    IsActive: existing.isActive,
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
    select: { id: true, code: true, description: true, unit: true, price1: true, price2: true, price3: true, unitCost: true, cpc: true, vae: true, denominationId: true, isActive: true },
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
      if (!generatedCode) {
        errors.push('No se pudo generar codigo para el material')
      }
      row.Code = generatedCode
      if (generatedCode) usedCodes.push(generatedCode)
    } else if (existingMaterial && !cleanString(row.Code)) {
      row.Code = existingMaterial.code
    }

    return {
      rowNumber: row.rowNumber,
      data: row,
      originalValues,
      status,
      existingId: existingMaterial?.id,
      conflicts,
      existingValues: existingMaterial ? materialExistingValues(existingMaterial) : undefined,
      errors,
    }
  })
}

export async function previewMaterialsFromBuffer(buffer: ArrayBuffer): Promise<PreviewRow[]> {
  const result = await previewMaterialsImportFromBuffer(buffer)
  return result.preview
}

export async function previewMaterialsImportFromBuffer(buffer: ArrayBuffer): Promise<MaterialsPreviewResult> {
  const parsed = await parseCatalogSheetWithMetadataFromBuffer(buffer, materialSheetConfig)
  const rawValues = new Map(parsed.rows.map((row) => [row.rowNumber, row.values]))
  const rows: MaterialImportRow[] = parsed.rows.map((row) => ({
    rowNumber: row.rowNumber,
    Code: cleanString(row.values.Code),
    Description: cleanString(row.values.Description),
    Unit: cleanString(row.values.Unit),
    UnitPrice: parseImportNumber(row.values.UnitPrice),
    Price2: parseImportNumber(row.values.Price2),
    Price3: parseImportNumber(row.values.Price3),
    Cpc: formatNormalizedOptionalNumber(parseOptionalPercentageInput(row.values.Cpc)),
    Vae: parseOptionalPercentageInput(row.values.Vae),
    Note: cleanString(row.values.Note),
    Denomination: cleanString(row.values.Denomination),
    IsActive: parseImportBoolean(row.values.IsActive),
    UsesCategory1: parseImportBoolean(row.values.UsesCategory1) ?? false,
    UsesCategory2: parseImportBoolean(row.values.UsesCategory2) ?? false,
  }))

  const denominationLookup = await loadDenominationLookup()
  const preview = await buildMaterialPreviewRows(rows, rawValues)

  return {
    preview,
    warnings: parsed.warnings,
    omittedOptionalColumns: parsed.omittedOptionalColumns,
    denominationSummary: summarizeDenominationValues(rows.map((row) => row.Denomination), denominationLookup),
  }
}

export async function applyMaterialsImport(rows: MaterialImportRow[], options: CatalogImportApplyOptions = {}): Promise<ImportApplyResult> {
  const rawValues = new Map(rows.map((row) => [row.rowNumber, {}]))
  const preview = await buildMaterialPreviewRows(rows, rawValues)
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
    unit: string
    price1: number
    price2?: number
    price3?: number
    unitCost: number
    cpc?: string
    vae?: number
    denominationId?: string
    usesCategory1: boolean
    usesCategory2: boolean
    isActive: boolean
  }> = []
  const denominationPreparation = await prepareDenominationsForImport(
    preview.map((row) => row.data.Denomination),
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

      const updateData = buildMaterialUpdateData(row, denominationLookup, updateMode, selectedFields, updatedFields)
      if (!row.existingId || Object.keys(updateData).length === 0) {
        omitted++
        debugMessages.push(`Registro omitido sin cambios aplicables: ${row.data.Code ?? row.data.Description ?? `fila ${row.rowNumber}`}`)
        continue
      }

      await prisma.material.update({
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
      unit: String(row.data.Unit),
      price1: Number(row.data.UnitPrice),
      price2: row.data.Price2 ?? undefined,
      price3: row.data.Price3 ?? undefined,
      unitCost: Number(row.data.UnitPrice),
      cpc: cleanString(row.data.Cpc) ?? undefined,
      vae: row.data.Vae ?? undefined,
      denominationId: resolveDenominationId(row.data.Denomination, denominationLookup),
      usesCategory1: row.data.UsesCategory1 ?? false,
      usesCategory2: row.data.UsesCategory2 ?? false,
      isActive: row.data.IsActive ?? true,
    })
  }

  const created = newRows.length > 0 ? (await prisma.material.createMany({ data: newRows })).count : 0

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
  row: PreviewRow,
  denominationLookup: Map<string, string>,
  updateMode: NonNullable<CatalogImportApplyOptions['updateMode']>,
  selectedFields: Set<CatalogUpdateField>,
  missingDenominations: Set<string>,
  debugMessages: string[],
) {
  if (!shouldUpdateDenomination({
    incomingValue: row.data.Denomination,
    existingValue: row.existingValues?.Denomination,
    updateMode,
    selectedFields,
  })) {
    return false
  }

  const incomingDenomination = cleanString(row.data.Denomination)
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

function buildMaterialUpdateData(
  row: PreviewRow,
  denominationLookup: Map<string, string>,
  updateMode: NonNullable<CatalogImportApplyOptions['updateMode']>,
  selectedFields: Set<CatalogUpdateField>,
  updatedFields: Partial<Record<CatalogUpdateField, number>>,
) {
  const data: {
    unit?: string
    price1?: number
    unitCost?: number
    cpc?: string
    vae?: number
    denominationId?: string
    isActive?: boolean
  } = {}
  const existing = row.existingValues ?? {}
  const incomingDenomination = cleanString(row.data.Denomination)
  const incomingDenominationId = resolveDenominationId(incomingDenomination, denominationLookup)
  const incomingCpc = cleanString(row.data.Cpc)
  const incomingUnit = cleanString(row.data.Unit)

  if (shouldUpdateCatalogField({
    mode: updateMode,
    field: 'denomination',
    selectedFields,
    incomingHasValue: Boolean(incomingDenomination),
    existingHasValue: Boolean(existing.Denomination),
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
    incomingHasValue: row.data.UnitPrice !== null && row.data.UnitPrice !== undefined,
    existingHasValue: existing.UnitPrice !== null && existing.UnitPrice !== undefined,
  })) {
    data.price1 = Number(row.data.UnitPrice)
    data.unitCost = Number(row.data.UnitPrice)
    incrementUpdatedField(updatedFields, 'price')
  }

  if (shouldUpdateCatalogField({
    mode: updateMode,
    field: 'unit',
    selectedFields,
    incomingHasValue: Boolean(incomingUnit),
    existingHasValue: Boolean(cleanString(existing.Unit)),
  })) {
    data.unit = incomingUnit ?? undefined
    incrementUpdatedField(updatedFields, 'unit')
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

export async function buildMaterialsTemplateBuffer(): Promise<Buffer> {
  return buildCatalogTemplateBuffer('Materiales', [
    { header: 'codigo', key: 'codigo', width: 14 },
    { header: 'descripcion', key: 'descripcion', width: 42 },
    { header: 'unidad', key: 'unidad', width: 12 },
    { header: 'precio_1', key: 'precio_1', width: 14, numFmt: '#,##0.00' },
    { header: 'precio_2', key: 'precio_2', width: 14, numFmt: '#,##0.00' },
    { header: 'precio_3', key: 'precio_3', width: 14, numFmt: '#,##0.00' },
    { header: 'cpc', key: 'cpc', width: 14 },
    { header: 'vae', key: 'vae', width: 14 },
  ])
}

export const materialsImport = { previewMaterialsFromBuffer, previewMaterialsImportFromBuffer, applyMaterialsImport, buildMaterialsTemplateBuffer }
export default materialsImport
