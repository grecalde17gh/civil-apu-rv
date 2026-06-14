'use server'

import { redirect } from 'next/navigation'
import { copyRubro, createRubro, updateRubro } from '@/src/lib/db/rubros'
import { getBudgetById } from '@/src/lib/db/budgets'
import { validateRubroInput } from '@/src/lib/validations/rubro'
import { addRubroMaterial, deleteRubroMaterial, updateRubroMaterial } from '@/src/lib/db/rubroMaterials'
import { validateRubroMaterialInput, validateRubroMaterialUpdateInput } from '@/src/lib/validations/rubroMaterial'
import { addRubroLabor, deleteRubroLabor, updateRubroLabor } from '@/src/lib/db/rubroLabor'
import { validateRubroLaborInput, validateRubroLaborUpdateInput } from '@/src/lib/validations/rubroLabor'
import { addRubroEquipment, deleteRubroEquipment, updateRubroEquipment } from '@/src/lib/db/rubroEquipment'
import { validateRubroEquipmentInput, validateRubroEquipmentUpdateInput } from '@/src/lib/validations/rubroEquipment'
import { addRubroTransport, deleteRubroTransport, updateRubroTransport } from '@/src/lib/db/rubroTransport'
import { validateRubroTransportInput, validateRubroTransportUpdateInput } from '@/src/lib/validations/rubroTransport'

export async function createRubroAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const budgetId = formData.get('budgetId')
  const rawIndirectPercentage = formData.get('indirectPercentage')

  if (
    typeof budgetId === 'string' &&
    budgetId.trim() !== '' &&
    (rawIndirectPercentage === null || (typeof rawIndirectPercentage === 'string' && rawIndirectPercentage.trim() === ''))
  ) {
    const budget = await getBudgetById(budgetId)
    if (!budget) {
      throw new Error('Presupuesto no encontrado')
    }

    data.indirectPercentage = budget.indirectPercentage?.toString() ?? '0'
  }

  const parsed = validateRubroInput(data)

  const rubro = await createRubro(parsed)

  if (typeof budgetId === 'string' && budgetId.trim() !== '') {
    redirect(`/rubros/${rubro.id}/edit?budgetId=${budgetId}`)
  }

  redirect('/rubros')
}

export async function updateRubroAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid rubro id')
  }

  const data = Object.fromEntries(formData)
  const parsed = validateRubroInput(data)

  await updateRubro(id, parsed)
  const budgetId = formData.get('budgetId')
  const budgetQuery = typeof budgetId === 'string' && budgetId.trim() !== '' ? `?budgetId=${budgetId}` : ''
  redirect(`/rubros/${id}/edit${budgetQuery}`)
}

export async function copyRubroAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid rubro id')
  }

  const copied = await copyRubro(id)
  redirect(`/rubros/${copied.id}/edit`)
}

export async function addRubroMaterialAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroMaterialInput(data)

  await addRubroMaterial(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function deleteRubroMaterialAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro material delete data')
  }

  await deleteRubroMaterial(id)
  redirect(`/rubros/${rubroId}/edit`)
}

export async function updateRubroMaterialAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroMaterialUpdateInput(data)

  await updateRubroMaterial(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function addRubroLaborAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroLaborInput(data)

  await addRubroLabor(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function addRubroEquipmentAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroEquipmentInput(data)

  await addRubroEquipment(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function addRubroTransportAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroTransportInput(data)

  await addRubroTransport(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function updateRubroLaborAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroLaborUpdateInput(data)

  await updateRubroLabor(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function updateRubroEquipmentAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroEquipmentUpdateInput(data)

  await updateRubroEquipment(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function updateRubroTransportAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroTransportUpdateInput(data)

  await updateRubroTransport(parsed)
  redirect(`/rubros/${parsed.rubroId}/edit`)
}

export async function deleteRubroLaborAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro labor delete data')
  }

  await deleteRubroLabor(id)
  redirect(`/rubros/${rubroId}/edit`)
}

export async function deleteRubroEquipmentAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro equipment delete data')
  }

  await deleteRubroEquipment(id)
  redirect(`/rubros/${rubroId}/edit`)
}

export async function deleteRubroTransportAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro transport delete data')
  }

  await deleteRubroTransport(id)
  redirect(`/rubros/${rubroId}/edit`)
}
