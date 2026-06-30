import { prisma } from '../db/prisma'
import {
  buildDenominationLookup,
  cleanString,
  normalizeImportText,
  resolveDenominationId,
  type DenominationImportSummary,
  type DenominationLookupItem,
} from './commonImport'

type PreparedDenominations = {
  lookup: Map<string, string>
  createdDenominations: number
  missingDenominations: string[]
  debugMessages: string[]
}

export async function loadDenominationLookup(): Promise<Map<string, string>> {
  const denominations = await prisma.ipcoDenomination.findMany({ select: { id: true, code: true, name: true } })
  return buildDenominationLookup(denominations)
}

export function summarizeDenominationValues(
  values: Array<string | null | undefined>,
  lookup: Map<string, string>,
): DenominationImportSummary {
  const existing = new Map<string, string>()
  const missing = new Map<string, string>()
  let recordsWithExisting = 0
  let recordsWithMissing = 0

  values.forEach((value) => {
    const display = cleanString(value)
    if (!display) return

    const normalized = normalizeImportText(display)
    if (!normalized) return

    if (resolveDenominationId(display, lookup)) {
      recordsWithExisting++
      existing.set(normalized, display)
    } else {
      recordsWithMissing++
      missing.set(normalized, display)
    }
  })

  return {
    existing: [...existing.values()],
    missing: [...missing.values()],
    recordsWithExisting,
    recordsWithMissing,
  }
}

export async function prepareDenominationsForImport(
  values: Array<string | null | undefined>,
  createMissingDenominations: boolean,
): Promise<PreparedDenominations> {
  const debugMessages: string[] = []
  let denominations = await prisma.ipcoDenomination.findMany({ select: { id: true, code: true, name: true } })
  let lookup = buildDenominationLookup(denominations)
  const missingBeforeCreate = summarizeDenominationValues(values, lookup).missing

  if (missingBeforeCreate.length === 0) {
    return { lookup, createdDenominations: 0, missingDenominations: [], debugMessages }
  }

  if (!createMissingDenominations) {
    missingBeforeCreate.forEach((name) => {
      debugMessages.push(`Denominacion IPCO no encontrada: ${name}`)
    })
    return { lookup, createdDenominations: 0, missingDenominations: missingBeforeCreate, debugMessages }
  }

  const createResult = await prisma.ipcoDenomination.createMany({
    data: missingBeforeCreate.map((name) => ({ name, isActive: true })),
  })
  missingBeforeCreate.forEach((name) => {
    debugMessages.push(`Denominacion IPCO creada: ${name}`)
  })

  denominations = await prisma.ipcoDenomination.findMany({ select: { id: true, code: true, name: true } })
  lookup = buildDenominationLookup(denominations as DenominationLookupItem[])

  return {
    lookup,
    createdDenominations: createResult.count,
    missingDenominations: [],
    debugMessages,
  }
}

export function shouldUpdateDenomination(params: {
  incomingValue: unknown
  existingValue: unknown
  updateMode: 'skip-existing' | 'fill-empty' | 'overwrite-selected'
  selectedFields: Set<'denomination' | 'cpc' | 'vae' | 'price' | 'unit' | 'isActive'>
}): boolean {
  const { incomingValue, existingValue, updateMode, selectedFields } = params
  if (!cleanString(incomingValue)) return false
  if (updateMode === 'skip-existing') return false
  if (updateMode === 'fill-empty') return !cleanString(existingValue)
  return selectedFields.has('denomination')
}
