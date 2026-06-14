'use server'

import { redirect } from 'next/navigation'
import { validateBudgetInput } from '@/src/lib/validations/budget'
import { copyBudget, createBudget, updateBudget } from '@/src/lib/db/budgets'
import { getProjectById } from '@/src/lib/db/projects'
import { validateBudgetItemInput, validateBudgetItemQuantityInput } from '@/src/lib/validations/budget'
import { getRubroById } from '@/src/lib/db/rubros'
import { createBudgetItem, recalculateBudgetTotals, getBudgetItemsByBudgetId, deleteBudgetItem, getBudgetByIdWithProject, updateBudgetItemQuantity } from '@/src/lib/db/budgets'
import { calculateBudgetItemSnapshots } from '@/src/lib/calculations/budget'
import { incompleteRubroMessage, isUsableRubroForBudget } from '@/src/lib/validations/rubroCompletion'

export type BudgetItemActionState = {
  ok: boolean
  message: string | null
}

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

  const budget = await createBudget({
    projectId,
    code: parsed.code,
    name: parsed.name,
    status: parsed.status,
    indirectPercentage: parsed.indirectPercentage ?? 0,
    ivaPercentage: parsed.ivaPercentage ?? 0,
    notes: parsed.notes,
    issuedAt: parsed.issuedAt,
    clientNameSnapshot: project.clientName ?? undefined,
    locationSnapshot: project.location ?? undefined,
  })

  redirect(`/projects/${projectId}/budgets/${budget.id}/edit`)
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
    indirectPercentage: parsed.indirectPercentage ?? 0,
    ivaPercentage: parsed.ivaPercentage ?? 0,
    notes: parsed.notes,
    issuedAt: parsed.issuedAt,
  })

  const projectId = formData.get('projectId')
  if (typeof projectId !== 'string') {
    redirect('/projects')
    return
  }

  redirect(`/projects/${projectId}/budgets/${id}/edit`)
}

async function createBudgetItemFromForm(formData: FormData): Promise<string> {
  const data = Object.fromEntries(formData)
  const parsed = validateBudgetItemInput(data)

  const budgetId = formData.get('budgetId')
  if (typeof budgetId !== 'string') {
    throw new Error('BudgetId es requerido')
  }

  const budget = await getBudgetByIdWithProject(budgetId)
  if (!budget) {
    throw new Error('Presupuesto no encontrado')
  }

  const rubro = await getRubroById(parsed.rubroId)
  if (!rubro) {
    throw new Error('Rubro no encontrado')
  }

  if (!isUsableRubroForBudget(rubro)) {
    throw new Error(incompleteRubroMessage)
  }

  const directCost = Number(rubro.directCost?.toString() ?? '0')
  const indirectPercentage = Number(
    budget.indirectPercentage?.toString() ??
      budget.project.defaultIndirectPercentage?.toString() ??
      rubro.indirectPercentage.toString(),
  )
  const itemSnapshots = calculateBudgetItemSnapshots({
    quantity: parsed.quantity,
    directCost,
    indirectPercentage,
  })

  const existingItems = await getBudgetItemsByBudgetId(budgetId)
  const itemNumber = String(existingItems.length + 1)

  await createBudgetItem({
    budgetId,
    rubroId: parsed.rubroId,
    itemNumber,
    rubroCodeSnapshot: rubro.code,
    descriptionSnapshot: rubro.description,
    technicalSpecificationSnapshot: rubro.technicalSpecification ?? undefined,
    unitSnapshot: rubro.unit,
    quantity: parsed.quantity,
    indirectPercentageApplied: itemSnapshots.indirectPercentageApplied,
    directCostSnapshot: itemSnapshots.directCostSnapshot,
    indirectCostSnapshot: itemSnapshots.indirectCostSnapshot,
    unitPriceSnapshot: itemSnapshots.unitPriceSnapshot,
    subtotalSnapshot: itemSnapshots.subtotalSnapshot,
    totalPrice: itemSnapshots.totalPrice,
  })

  await recalculateBudgetTotals(budgetId)

  const projectId = formData.get('projectId')
  if (typeof projectId === 'string') {
    return `/projects/${projectId}/budgets/${budgetId}/edit`
  }

  return '/projects'
}

export async function addBudgetItemAction(formData: FormData) {
  const redirectUrl = await createBudgetItemFromForm(formData)
  redirect(redirectUrl)
}

export async function addBudgetItemFormAction(
  _previousState: BudgetItemActionState,
  formData: FormData,
): Promise<BudgetItemActionState> {
  let redirectUrl = '/projects'

  try {
    redirectUrl = await createBudgetItemFromForm(formData)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'No se pudo agregar el rubro al presupuesto.',
    }
  }

  redirect(redirectUrl)
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

export async function updateBudgetItemQuantityAction(formData: FormData) {
  const parsed = validateBudgetItemQuantityInput(Object.fromEntries(formData))

  await updateBudgetItemQuantity(parsed)

  const projectId = formData.get('projectId')
  if (typeof projectId === 'string') {
    redirect(`/projects/${projectId}/budgets/${parsed.budgetId}/edit`)
  }

  redirect('/projects')
}

export async function copyBudgetAction(formData: FormData) {
  const budgetId = formData.get('budgetId')
  const projectId = formData.get('projectId')

  if (typeof budgetId !== 'string' || typeof projectId !== 'string') {
    throw new Error('Invalid budget copy params')
  }

  const copied = await copyBudget(budgetId)
  redirect(`/projects/${projectId}/budgets/${copied.id}/edit`)
}
