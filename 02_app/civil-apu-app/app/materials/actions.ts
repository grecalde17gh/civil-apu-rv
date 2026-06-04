'use server'

import { redirect } from 'next/navigation'
import { copyMaterial, createMaterial, updateMaterial, toggleMaterialActive } from '@/src/lib/db/materials'
import { validateMaterialInput } from '@/src/lib/validations/material'

export async function toggleMaterialActiveAction(formData: FormData) {
  const id = formData.get('id')
  const isActive = formData.get('isActive')

  if (typeof id !== 'string' || typeof isActive !== 'string') {
    throw new Error('Invalid material toggle data')
  }

  await toggleMaterialActive(id, isActive === 'true')
  redirect('/materials')
}

export async function createMaterialAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateMaterialInput({
    ...data,
    usesCategory1: formData.get('usesCategory1') === 'on',
    usesCategory2: formData.get('usesCategory2') === 'on',
    isActive: formData.get('isActive') === 'on',
  })

  await createMaterial(parsed)
  redirect('/materials')
}

export async function updateMaterialAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid material id')
  }

  const data = Object.fromEntries(formData)
  const parsed = validateMaterialInput({
    ...data,
    usesCategory1: formData.get('usesCategory1') === 'on',
    usesCategory2: formData.get('usesCategory2') === 'on',
    isActive: formData.get('isActive') === 'on',
  })

  await updateMaterial(id, parsed)
  redirect('/materials')
}

export async function copyMaterialAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid material id')
  }

  const copied = await copyMaterial(id)
  redirect(`/materials/${copied.id}/edit`)
}
