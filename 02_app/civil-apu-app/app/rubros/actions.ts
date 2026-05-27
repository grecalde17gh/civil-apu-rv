'use server'

import { redirect } from 'next/navigation'
import { createRubro, updateRubro } from '@/src/lib/db/rubros'
import { validateRubroInput } from '@/src/lib/validations/rubro'
import { addRubroMaterial, deleteRubroMaterial } from '@/src/lib/db/rubroMaterials'
import { validateRubroMaterialInput } from '@/src/lib/validations/rubroMaterial'
import { addRubroLabor, deleteRubroLabor } from '@/src/lib/db/rubroLabor'
import { validateRubroLaborInput } from '@/src/lib/validations/rubroLabor'
import { addRubroEquipment, deleteRubroEquipment } from '@/src/lib/db/rubroEquipment'
import { validateRubroEquipmentInput } from '@/src/lib/validations/rubroEquipment'
import { addRubroTransport, deleteRubroTransport } from '@/src/lib/db/rubroTransport'
import { validateRubroTransportInput } from '@/src/lib/validations/rubroTransport'

export async function createRubroAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateRubroInput(data)

  await createRubro(parsed)
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
  redirect('/rubros')
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
