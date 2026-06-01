'use server'

import { redirect } from 'next/navigation'
import { copyEquipment, createEquipment, updateEquipment, toggleEquipmentActive } from '@/src/lib/db/equipment'
import { validateEquipmentInput } from '@/src/lib/validations/equipment'

export async function toggleEquipmentActiveAction(formData: FormData) {
  const id = formData.get('id')
  const isActive = formData.get('isActive')

  if (typeof id !== 'string' || typeof isActive !== 'string') {
    throw new Error('Invalid equipment toggle data')
  }

  await toggleEquipmentActive(id, isActive === 'true')
  redirect('/equipment')
}

export async function createEquipmentAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateEquipmentInput({
    ...data,
    maintenanceRequired: formData.get('maintenanceRequired') === 'on',
    isActive: formData.get('isActive') === 'on',
  })

  await createEquipment(parsed)
  redirect('/equipment')
}

export async function updateEquipmentAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid equipment id')
  }

  const data = Object.fromEntries(formData)
  const parsed = validateEquipmentInput({
    ...data,
    maintenanceRequired: formData.get('maintenanceRequired') === 'on',
    isActive: formData.get('isActive') === 'on',
  })

  await updateEquipment(id, parsed)
  redirect('/equipment')
}

export async function copyEquipmentAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid equipment id')
  }

  const copied = await copyEquipment(id)
  redirect(`/equipment/${copied.id}/edit`)
}
