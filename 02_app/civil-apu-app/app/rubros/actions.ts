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

function buildRubroEditUrl(rubroId: string, budgetId?: FormDataEntryValue | null, message?: string) {
  const params = new URLSearchParams()

  if (typeof budgetId === 'string' && budgetId.trim() !== '') {
    params.set('budgetId', budgetId)
  }

  if (message) {
    params.set('componentError', message)
  }

  const query = params.toString()
  return `/rubros/${rubroId}/edit${query ? `?${query}` : ''}`
}

function getRubroRedirectData(formData: FormData) {
  const rubroId = formData.get('rubroId')
  const budgetId = formData.get('budgetId')

  if (typeof rubroId !== 'string') {
    throw new Error('RubroId es requerido')
  }

  return { rubroId, budgetId }
}

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
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroMaterialInput(data)
    await addRubroMaterial(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione un material y registre una cantidad valida antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function deleteRubroMaterialAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro material delete data')
  }

  await deleteRubroMaterial(id)
  redirect(buildRubroEditUrl(rubroId, formData.get('budgetId')))
}

export async function updateRubroMaterialAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroMaterialUpdateInput(data)
    await updateRubroMaterial(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione un material y registre una cantidad valida antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function addRubroLaborAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroLaborInput(data)
    await addRubroLabor(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione mano de obra y registre cantidad/rendimiento validos antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function addRubroEquipmentAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroEquipmentInput(data)
    await addRubroEquipment(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione un equipo y registre cantidad/rendimiento validos antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function addRubroTransportAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroTransportInput(data)
    await addRubroTransport(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione transporte y registre cantidad/precio validos antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function updateRubroLaborAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroLaborUpdateInput(data)
    await updateRubroLabor(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione mano de obra y registre cantidad/rendimiento validos antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function updateRubroEquipmentAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroEquipmentUpdateInput(data)
    await updateRubroEquipment(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione un equipo y registre cantidad/rendimiento validos antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function updateRubroTransportAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const { rubroId, budgetId } = getRubroRedirectData(formData)
  let redirectUrl = buildRubroEditUrl(rubroId, budgetId)

  try {
    const parsed = validateRubroTransportUpdateInput(data)
    await updateRubroTransport(parsed)
    redirectUrl = buildRubroEditUrl(parsed.rubroId, budgetId)
  } catch {
    redirectUrl = buildRubroEditUrl(rubroId, budgetId, 'Seleccione transporte y registre cantidad/precio validos antes de guardar.')
  }

  redirect(redirectUrl)
}

export async function deleteRubroLaborAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro labor delete data')
  }

  await deleteRubroLabor(id)
  redirect(buildRubroEditUrl(rubroId, formData.get('budgetId')))
}

export async function deleteRubroEquipmentAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro equipment delete data')
  }

  await deleteRubroEquipment(id)
  redirect(buildRubroEditUrl(rubroId, formData.get('budgetId')))
}

export async function deleteRubroTransportAction(formData: FormData) {
  const id = formData.get('id')
  const rubroId = formData.get('rubroId')

  if (typeof id !== 'string' || typeof rubroId !== 'string') {
    throw new Error('Invalid rubro transport delete data')
  }

  await deleteRubroTransport(id)
  redirect(buildRubroEditUrl(rubroId, formData.get('budgetId')))
}
