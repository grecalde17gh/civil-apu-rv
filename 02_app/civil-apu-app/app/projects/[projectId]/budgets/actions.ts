'use server'

import { redirect } from 'next/navigation'
import { validateBudgetInput } from '@/src/lib/validations/budget'
import { createBudget, updateBudget } from '@/src/lib/db/budgets'
import { getProjectById } from '@/src/lib/db/projects'

export async function createBudgetAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateBudgetInput(data)

  const projectId = formData.get('projectId')
  if (typeof projectId !== 'string') {
    throw new Error('ProjectId es requerido')
  }

  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  await createBudget({
    projectId,
    code: parsed.code,
    name: parsed.name,
    status: parsed.status,
    ivaPercentage: parsed.ivaPercentage ?? 0,
    notes: parsed.notes,
    issuedAt: parsed.issuedAt,
    clientNameSnapshot: project.clientName ?? undefined,
    locationSnapshot: project.location ?? undefined,
  })

  redirect(`/projects/${projectId}/budgets`)
}

export async function updateBudgetAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid budget id')
  }

  const data = Object.fromEntries(formData)
  const parsed = validateBudgetInput(data)

  await updateBudget(id, {
    code: parsed.code,
    name: parsed.name,
    status: parsed.status,
    ivaPercentage: parsed.ivaPercentage ?? 0,
    notes: parsed.notes,
    issuedAt: parsed.issuedAt,
  })

  const projectId = formData.get('projectId')
  if (typeof projectId !== 'string') {
    redirect('/projects')
    return
  }

  redirect(`/projects/${projectId}/budgets`)
}
