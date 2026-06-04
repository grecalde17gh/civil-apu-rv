import parseMaterialsSheetFromBuffer from './excelParser'
import { validateMaterialRow, type MaterialImportRow } from '@/src/lib/validations/materialImport'
import { createMaterial, updateMaterial } from '@/src/lib/db/materials'
import { prisma } from '@/src/lib/db/prisma'

export type PreviewRow = {
  rowNumber: number
  data: MaterialImportRow
  errors: string[]
}

export async function previewMaterialsFromBuffer(buffer: ArrayBuffer): Promise<PreviewRow[]> {
  const raw = await parseMaterialsSheetFromBuffer(buffer)
  const preview: PreviewRow[] = raw.map((r) => {
    const row: MaterialImportRow = {
      rowNumber: r.rowNumber,
      Code: r.Code ?? null,
      Description: r.Description ?? null,
      Unit: r.Unit ?? null,
      UnitPrice: r.UnitPrice ?? null,
      Note: r.Note ?? null,
      IsActive: r.IsActive ?? null,
    }
    const v = validateMaterialRow(row)
    return { rowNumber: r.rowNumber, data: row, errors: v.errors }
  })
  return preview
}

export async function applyMaterialsImport(rows: MaterialImportRow[]): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  for (const r of rows) {
    if (!validateMaterialRow(r).valid) continue

    const code = r.Code && String(r.Code).trim() !== '' ? String(r.Code).trim() : undefined

    let existing = null
    if (code) {
      existing = await prisma.material.findUnique({ where: { code } })
    }

    const payload = {
      code: code ?? undefined,
      description: String(r.Description),
      unit: String(r.Unit),
      unitCost: Number(r.UnitPrice),
      usesCategory1: false,
      usesCategory2: false,
      isActive: r.IsActive ?? true,
    }

    if (existing) {
      await updateMaterial(existing.id, payload)
      updated++
    } else {
      await createMaterial(payload)
      created++
    }
  }

  return { created, updated }
}

export const materialsImport = { previewMaterialsFromBuffer, applyMaterialsImport }
export default materialsImport
