'use server'

import { revalidatePath } from 'next/cache'
import { createEquipment, toggleEquipmentActive, updateEquipment } from '@/src/lib/db/equipment'
import { createLabor, toggleLaborActive, updateLabor } from '@/src/lib/db/labor'
import { createMaterial, toggleMaterialActive, updateMaterial } from '@/src/lib/db/materials'
import { createIpcoDenomination, setIpcoDenominationActive, updateIpcoDenomination } from '@/src/lib/db/denominations'
import { validateEquipmentInput } from '@/src/lib/validations/equipment'
import { validateLaborInput } from '@/src/lib/validations/labor'
import { validateMaterialInput } from '@/src/lib/validations/material'

export type DesktopCatalogKind = 'materials' | 'labor' | 'equipment' | 'denominations'

export type DesktopCatalogChange = {
  catalog: DesktopCatalogKind
  rows: Array<{ id: string; values: Record<string, string> }>
  deletedIds: string[]
}

export type DesktopCatalogSaveResult = { ok: true; message: string } | { ok: false; message: string }

function optional(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function isActive(value: string | undefined) {
  return value !== 'No'
}

function isNewRow(id: string) {
  return id.startsWith('new-')
}

function messageFromError(error: unknown) {
  if (error instanceof Error) return error.message
  return 'No se pudieron guardar los cambios.'
}

function revalidateDesktopCatalogs() {
  revalidatePath('/desktop/materials')
  revalidatePath('/desktop/labor')
  revalidatePath('/desktop/equipment')
  revalidatePath('/desktop/denominations')
}

export async function saveDesktopCatalogChanges(change: DesktopCatalogChange): Promise<DesktopCatalogSaveResult> {
  try {
    if (!Array.isArray(change.rows) || !Array.isArray(change.deletedIds)) {
      return { ok: false, message: 'El lote de cambios no es válido.' }
    }

    for (const row of change.rows) {
      const values = row.values
      if (change.catalog === 'materials') {
        const data = validateMaterialInput({
          code: optional(values.code),
          description: values.description,
          unit: values.unit,
          price1: values.price1,
          price2: optional(values.price2),
          price3: optional(values.price3),
          cpc: optional(values.cpc),
          vae: optional(values.vae),
          denominationId: optional(values.denominationId),
          usesCategory1: false,
          usesCategory2: false,
          priceDate: optional(values.priceDate),
          isActive: isActive(values.isActive),
        })
        if (isNewRow(row.id)) await createMaterial(data)
        else await updateMaterial(row.id, data)
      }

      if (change.catalog === 'labor') {
        const data = validateLaborInput({
          code: optional(values.code),
          roleName: values.roleName,
          hourlyCost: values.hourlyCost,
          dailyCost: optional(values.dailyCost),
          cpc: optional(values.cpc),
          vae: optional(values.vae),
          denominationId: optional(values.denominationId),
          priceDate: optional(values.priceDate),
          isActive: isActive(values.isActive),
        })
        if (isNewRow(row.id)) await createLabor(data)
        else await updateLabor(row.id, data)
      }

      if (change.catalog === 'equipment') {
        const data = validateEquipmentInput({
          code: optional(values.code),
          description: values.description,
          equipmentType: optional(values.equipmentType),
          hourlyRate: optional(values.hourlyRate),
          dailyRate: optional(values.dailyRate),
          purchaseCost: optional(values.purchaseCost),
          maintenanceRequired: values.maintenanceRequired === 'Sí',
          maintenanceNotes: optional(values.maintenanceNotes),
          cpc: optional(values.cpc),
          vae: optional(values.vae),
          denominationId: optional(values.denominationId),
          priceDate: optional(values.priceDate),
          isActive: isActive(values.isActive),
        })
        if (isNewRow(row.id)) await createEquipment(data)
        else await updateEquipment(row.id, data)
      }

      if (change.catalog === 'denominations') {
        const name = values.name?.trim()
        if (!name) throw new Error('La denominación IPCO es obligatoria.')
        const data = { code: optional(values.code) ?? null, name, isActive: isActive(values.isActive) }
        if (isNewRow(row.id)) await createIpcoDenomination(data)
        else await updateIpcoDenomination(row.id, data)
      }
    }

    for (const id of change.deletedIds) {
      if (change.catalog === 'materials') await toggleMaterialActive(id, false)
      if (change.catalog === 'labor') await toggleLaborActive(id, false)
      if (change.catalog === 'equipment') await toggleEquipmentActive(id, false)
      if (change.catalog === 'denominations') await setIpcoDenominationActive(id, false)
    }

    revalidateDesktopCatalogs()
    return { ok: true, message: `Cambios guardados: ${change.rows.length} fila(s) actualizada(s) y ${change.deletedIds.length} desactivada(s).` }
  } catch (error) {
    return { ok: false, message: messageFromError(error) }
  }
}
