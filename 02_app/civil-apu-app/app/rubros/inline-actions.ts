'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { updateRubroEquipment } from '@/src/lib/db/rubroEquipment'
import { updateRubroLabor } from '@/src/lib/db/rubroLabor'
import { updateRubroMaterial } from '@/src/lib/db/rubroMaterials'
import { updateRubroTransport } from '@/src/lib/db/rubroTransport'
import { validateRubroEquipmentUpdateInput } from '@/src/lib/validations/rubroEquipment'
import { validateRubroLaborUpdateInput } from '@/src/lib/validations/rubroLabor'
import { validateRubroMaterialUpdateInput } from '@/src/lib/validations/rubroMaterial'
import { validateRubroTransportUpdateInput } from '@/src/lib/validations/rubroTransport'

export type InlineRubroUpdateResult = {
  ok: boolean
  message?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Valor invalido'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'No se pudo guardar el cambio'
}

function revalidateRubroEdit(rubroId: string) {
  revalidatePath(`/rubros/${rubroId}/edit`)
}

export async function updateRubroMaterialInlineAction(formData: FormData): Promise<InlineRubroUpdateResult> {
  try {
    const parsed = validateRubroMaterialUpdateInput(Object.fromEntries(formData))
    await updateRubroMaterial(parsed)
    revalidateRubroEdit(parsed.rubroId)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) }
  }
}

export async function updateRubroLaborInlineAction(formData: FormData): Promise<InlineRubroUpdateResult> {
  try {
    const parsed = validateRubroLaborUpdateInput(Object.fromEntries(formData))
    await updateRubroLabor(parsed)
    revalidateRubroEdit(parsed.rubroId)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) }
  }
}

export async function updateRubroEquipmentInlineAction(formData: FormData): Promise<InlineRubroUpdateResult> {
  try {
    const parsed = validateRubroEquipmentUpdateInput(Object.fromEntries(formData))
    await updateRubroEquipment(parsed)
    revalidateRubroEdit(parsed.rubroId)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) }
  }
}

export async function updateRubroTransportInlineAction(formData: FormData): Promise<InlineRubroUpdateResult> {
  try {
    const parsed = validateRubroTransportUpdateInput(Object.fromEntries(formData))
    await updateRubroTransport(parsed)
    revalidateRubroEdit(parsed.rubroId)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) }
  }
}
