import { prisma } from '../db/prisma'
import {
  buildDenominationLookup,
  cleanString,
  formatNormalizedOptionalNumber,
  parseCatalogSheetFromBuffer,
  parseOptionalPercentageInput,
  resolveDenominationId,
} from './commonImport'

type CatalogType = 'materials' | 'labor' | 'equipment'

type ExistingCatalogItem = {
  id: string
  code: string | null
}

type IpcoClassificationRow = {
  rowNumber: number
  Code: string | null
  Denomination: string | null
  Cpc: string | null
}

export type IpcoClassificationError = {
  rowNumber: number
  code: string | null
  message: string
}

export type IpcoClassificationSectionResult = {
  catalog: CatalogType
  sheetName: string
  read: number
  updated: number
  notFound: number
  withoutIpco: number
  errors: IpcoClassificationError[]
}

export type IpcoClassificationUpdateResult = {
  materials: IpcoClassificationSectionResult
  labor: IpcoClassificationSectionResult
  equipment: IpcoClassificationSectionResult
  totals: {
    read: number
    updated: number
    notFound: number
    withoutIpco: number
    errors: number
  }
}

const sharedColumns = {
  Code: ['codigo', 'code'],
  Denomination: ['denominacion', 'denominacion_ipco', 'ipco', 'categoria', 'category'],
  Cpc: ['cpc'],
}

const sectionConfigs = {
  materials: {
    sheetName: 'Materiales',
    sheetNames: ['materiales', 'materials'],
    columns: sharedColumns,
  },
  labor: {
    sheetName: 'Mano de obra',
    sheetNames: ['mano_de_obra', 'mano de obra', 'labor'],
    columns: sharedColumns,
  },
  equipment: {
    sheetName: 'Equipos',
    sheetNames: ['equipos', 'equipment'],
    columns: sharedColumns,
  },
} satisfies Record<CatalogType, { sheetName: string; sheetNames: string[]; columns: typeof sharedColumns }>

function normalizeCode(value: string | null | undefined): string | null {
  const code = cleanString(value)?.toUpperCase()
  return code ?? null
}

function buildExistingIndex(existing: ExistingCatalogItem[]): Map<string, ExistingCatalogItem> {
  const index = new Map<string, ExistingCatalogItem>()

  existing.forEach((item) => {
    const code = normalizeCode(item.code)
    if (code) index.set(code, item)
  })

  return index
}

function mapRows(rows: Awaited<ReturnType<typeof parseCatalogSheetFromBuffer>>): IpcoClassificationRow[] {
  return rows.map((row) => ({
    rowNumber: row.rowNumber,
    Code: cleanString(row.values.Code),
    Denomination: cleanString(row.values.Denomination),
    Cpc: formatNormalizedOptionalNumber(parseOptionalPercentageInput(row.values.Cpc)),
  }))
}

function duplicateCodes(rows: IpcoClassificationRow[]): Set<string> {
  const counts = new Map<string, number>()

  rows.forEach((row) => {
    const code = normalizeCode(row.Code)
    if (!code) return
    counts.set(code, (counts.get(code) ?? 0) + 1)
  })

  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([code]) => code))
}

async function getExistingItems(catalog: CatalogType): Promise<ExistingCatalogItem[]> {
  if (catalog === 'materials') {
    return prisma.material.findMany({ select: { id: true, code: true } })
  }
  if (catalog === 'labor') {
    return prisma.laborItem.findMany({ select: { id: true, code: true } })
  }

  return prisma.equipmentItem.findMany({ select: { id: true, code: true } })
}

async function updateExistingItem(catalog: CatalogType, id: string, data: { denominationId: string; cpc?: string }) {
  if (catalog === 'materials') {
    await prisma.material.update({ where: { id }, data })
    return
  }
  if (catalog === 'labor') {
    await prisma.laborItem.update({ where: { id }, data })
    return
  }

  await prisma.equipmentItem.update({ where: { id }, data })
}

async function updateSection(
  buffer: ArrayBuffer,
  catalog: CatalogType,
  denominationLookup: Map<string, string>,
): Promise<IpcoClassificationSectionResult> {
  const config = sectionConfigs[catalog]
  const rawRows = await parseCatalogSheetFromBuffer(buffer, config)
  const rows = mapRows(rawRows)
  const repeatedCodes = duplicateCodes(rows)
  const existingIndex = buildExistingIndex(await getExistingItems(catalog))

  const result: IpcoClassificationSectionResult = {
    catalog,
    sheetName: config.sheetName,
    read: rows.length,
    updated: 0,
    notFound: 0,
    withoutIpco: 0,
    errors: [],
  }

  for (const row of rows) {
    const code = normalizeCode(row.Code)

    if (!code) {
      result.errors.push({ rowNumber: row.rowNumber, code: null, message: 'Codigo requerido para actualizar por codigo' })
      continue
    }
    if (repeatedCodes.has(code)) {
      result.errors.push({ rowNumber: row.rowNumber, code, message: 'Codigo duplicado en el archivo' })
      continue
    }

    const existing = existingIndex.get(code)
    if (!existing) {
      result.notFound++
      continue
    }

    if (!cleanString(row.Denomination)) {
      result.withoutIpco++
      continue
    }

    const denominationId = resolveDenominationId(row.Denomination, denominationLookup)
    if (!denominationId) {
      result.errors.push({ rowNumber: row.rowNumber, code, message: 'Denominacion IPCO no encontrada' })
      continue
    }

    await updateExistingItem(catalog, existing.id, {
      denominationId,
      ...(row.Cpc ? { cpc: row.Cpc } : {}),
    })
    result.updated++
  }

  return result
}

export async function updateIpcoClassificationsFromBuffer(buffer: ArrayBuffer): Promise<IpcoClassificationUpdateResult> {
  const denominations = await prisma.ipcoDenomination.findMany({ select: { id: true, code: true, name: true } })
  const denominationLookup = buildDenominationLookup(denominations)

  const materials = await updateSection(buffer, 'materials', denominationLookup)
  const labor = await updateSection(buffer, 'labor', denominationLookup)
  const equipment = await updateSection(buffer, 'equipment', denominationLookup)

  return {
    materials,
    labor,
    equipment,
    totals: {
      read: materials.read + labor.read + equipment.read,
      updated: materials.updated + labor.updated + equipment.updated,
      notFound: materials.notFound + labor.notFound + equipment.notFound,
      withoutIpco: materials.withoutIpco + labor.withoutIpco + equipment.withoutIpco,
      errors: materials.errors.length + labor.errors.length + equipment.errors.length,
    },
  }
}
