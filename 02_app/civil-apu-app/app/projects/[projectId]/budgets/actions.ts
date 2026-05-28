'use server'

import { redirect } from 'next/navigation'
import { validateBudgetInput } from '@/src/lib/validations/budget'
import { createBudget, updateBudget } from '@/src/lib/db/budgets'
import { getProjectById } from '@/src/lib/db/projects'
import { validateBudgetItemInput } from '@/src/lib/validations/budget'
import { getRubroById } from '@/src/lib/db/rubros'
import { createBudgetItem, recalculateBudgetTotals, getBudgetItemsByBudgetId, deleteBudgetItem } from '@/src/lib/db/budgets'
import { calculateBudgetItemTotal } from '@/src/lib/calculations/budget'

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

export async function addBudgetItemAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateBudgetItemInput(data)

  const budgetId = formData.get('budgetId')
  if (typeof budgetId !== 'string') {
    throw new Error('BudgetId es requerido')
  }

  const rubro = await getRubroById(parsed.rubroId)
  if (!rubro) {
    throw new Error('Rubro no encontrado')
  }

  if (rubro.unitPrice == null) {
    throw new Error('El rubro seleccionado no tiene precio unitario calculado. No se puede agregar.')
  }

  const unitPriceSnapshot = Number(rubro.unitPrice.toString())
  const totalPrice = calculateBudgetItemTotal(parsed.quantity, unitPriceSnapshot)

  const existingItems = await getBudgetItemsByBudgetId(budgetId)
  const itemNumber = String(existingItems.length + 1)

  await createBudgetItem({
    budgetId,
    rubroId: parsed.rubroId,
    itemNumber,
    rubroCodeSnapshot: rubro.code,
    descriptionSnapshot: rubro.description,
    unitSnapshot: rubro.unit,
    quantity: parsed.quantity,
    unitPriceSnapshot,
    totalPrice,
  })

  await recalculateBudgetTotals(budgetId)

  const projectId = formData.get('projectId')
  if (typeof projectId === 'string') {
    redirect(`/projects/${projectId}/budgets/${budgetId}/edit`)
  }
  // fallback
  redirect(`/projects`)
}

export async function deleteBudgetItemAction(formData: FormData) {
  const budgetItemId = formData.get('budgetItemId')
  const budgetId = formData.get('budgetId')

  if (typeof budgetItemId !== 'string' || typeof budgetId !== 'string') {
    throw new Error('Invalid params')
  }

  await deleteBudgetItem(budgetItemId)
  await recalculateBudgetTotals(budgetId)

  const projectId = formData.get('projectId')
  if (typeof projectId === 'string') {
    redirect(`/projects/${projectId}/budgets/${budgetId}/edit`)
  } else {
    redirect('/projects')
  }
}
