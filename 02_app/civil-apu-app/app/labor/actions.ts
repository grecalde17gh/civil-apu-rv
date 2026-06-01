'use server'

import { redirect } from 'next/navigation'
import { copyLabor, createLabor, updateLabor, toggleLaborActive } from '@/src/lib/db/labor'
import { validateLaborInput } from '@/src/lib/validations/labor'

export async function toggleLaborActiveAction(formData: FormData) {
  const id = formData.get('id')
  const isActive = formData.get('isActive')

  if (typeof id !== 'string' || typeof isActive !== 'string') {
    throw new Error('Invalid labor toggle data')
  }

  await toggleLaborActive(id, isActive === 'true')
  redirect('/labor')
}

export async function createLaborAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateLaborInput({
    ...data,
    isActive: formData.get('isActive') === 'on',
  })

  await createLabor(parsed)
  redirect('/labor')
}

export async function updateLaborAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid labor id')
  }

  const data = Object.fromEntries(formData)
  const parsed = validateLaborInput({
    ...data,
    isActive: formData.get('isActive') === 'on',
  })

  await updateLabor(id, parsed)
  redirect('/labor')
}

export async function copyLaborAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid labor id')
  }

  const copied = await copyLabor(id)
  redirect(`/labor/${copied.id}/edit`)
}
