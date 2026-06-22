'use server'

import { redirect } from 'next/navigation'
import { createIpcoDenomination, setIpcoDenominationActive, updateIpcoDenomination } from '@/src/lib/db/denominations'

function normalizeOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function parseDenominationForm(formData: FormData) {
  const name = normalizeOptionalText(formData.get('name'))
  const code = normalizeOptionalText(formData.get('code'))

  if (!name) {
    throw new Error('La Denominacion IPCO es obligatoria')
  }

  return {
    code,
    name,
    isActive: formData.get('isActive') === 'on',
  }
}

function adminRedirect() {
  redirect('/admin/ipco-denominations')
}

function duplicateMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes('Unique constraint')) {
    return 'Ya existe una Denominacion IPCO con ese codigo o nombre'
  }
  return error instanceof Error ? error.message : 'No se pudo guardar la Denominacion IPCO'
}

export async function createIpcoDenominationAction(formData: FormData) {
  try {
    await createIpcoDenomination(parseDenominationForm(formData))
  } catch (error) {
    throw new Error(duplicateMessage(error))
  }

  adminRedirect()
}

export async function updateIpcoDenominationAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Denominacion IPCO no encontrada')
  }

  try {
    await updateIpcoDenomination(id, parseDenominationForm(formData))
  } catch (error) {
    throw new Error(duplicateMessage(error))
  }

  adminRedirect()
}

export async function toggleIpcoDenominationActiveAction(formData: FormData) {
  const id = formData.get('id')
  const isActive = formData.get('isActive') === 'true'

  if (typeof id !== 'string') {
    throw new Error('Denominacion IPCO no encontrada')
  }

  await setIpcoDenominationActive(id, isActive)
  adminRedirect()
}
