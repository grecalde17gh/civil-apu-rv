'use server'

import { redirect } from 'next/navigation'
import { validateBudgetInput } from '@/src/lib/validations/budget'
import { copyBudget, createBudget, updateBudget } from '@/src/lib/db/budgets'
import { getProjectById } from '@/src/lib/db/projects'
import { validateBudgetItemInput, validateBudgetItemQuantityInput } from '@/src/lib/validations/budget'
import { getRubroById } from '@/src/lib/db/rubros'
import {
  createBudgetItem,
  recalculateBudgetTotals,
  getBudgetItemsByBudgetId,
  deleteBudgetItem,
  getBudgetByIdWithProject,
  updateBudgetItemQuantity,
  updateBudgetIpcoOverride,
  restoreBudgetIpcoOverride,
  saveBudgetIpcoOverrideChanges,
} from '@/src/lib/db/budgets'
import { calculateBudgetItemSnapshots } from '@/src/lib/calculations/budget'
import { incompleteRubroMessage, isUsableRubroForBudget } from '@/src/lib/validations/rubroCompletion'
import { updateBudgetSchedule } from '@/src/lib/db/budgetSchedule'
import { validateBudgetScheduleInput } from '@/src/lib/validations/budgetSchedule'
import type { BudgetIpcoComponentType } from '@prisma/client'

export type BudgetItemActionState = {
  ok: boolean
  message: string | null
}

export type BudgetScheduleActionState = {
  ok: boolean
  message: string | null
}

const budgetIpcoComponentTypes = new Set<BudgetIpcoComponentType>(['MATERIAL', 'LABOR', 'EQUIPMENT', 'TRANSPORT'])

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

export async function updateBudgetScheduleAction(
  _previousState: BudgetScheduleActionState,
  formData: FormData,
): Promise<BudgetScheduleActionState> {
  const budgetId = formData.get('budgetId')

  if (typeof budgetId !== 'string') {
    return { ok: false, message: 'Presupuesto no encontrado.' }
  }

  try {
    const entriesRaw = formData.get('entries')
    const parsed = validateBudgetScheduleInput({
      weekCount: formData.get('weekCount'),
      entries: typeof entriesRaw === 'string' && entriesRaw.trim() !== '' ? JSON.parse(entriesRaw) : [],
    })

    await updateBudgetSchedule({
      budgetId,
      weekCount: parsed.weekCount,
      entries: parsed.entries,
    })

    return { ok: true, message: 'Cronograma valorado guardado.' }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'No se pudo guardar el cronograma valorado.',
    }
  }
}

function parseBudgetIpcoForm(formData: FormData): {
  budgetId: string
  projectId: string
  componentType: BudgetIpcoComponentType
  componentIds: string[]
  tab: string
} {
  const budgetId = formData.get('budgetId')
  const projectId = formData.get('projectId')
  const componentType = formData.get('componentType')
  const componentIdsValue = formData.get('componentIds')
  const tab = formData.get('tab')

  if (typeof budgetId !== 'string' || typeof projectId !== 'string') {
    throw new Error('Presupuesto no encontrado')
  }
  if (typeof componentType !== 'string' || !budgetIpcoComponentTypes.has(componentType as BudgetIpcoComponentType)) {
    throw new Error('Tipo de componente IPCO invalido')
  }
  if (typeof componentIdsValue !== 'string') {
    throw new Error('Componente IPCO no encontrado')
  }

  const componentIds = componentIdsValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (componentIds.length === 0) {
    throw new Error('Componente IPCO no encontrado')
  }

  return {
    budgetId,
    projectId,
    componentType: componentType as BudgetIpcoComponentType,
    componentIds,
    tab: typeof tab === 'string' ? tab : 'presupuesto',
  }
}

export async function updateBudgetIpcoOverrideAction(formData: FormData) {
  const parsed = parseBudgetIpcoForm(formData)
  const denominationId = formData.get('denominationId')

  if (typeof denominationId !== 'string' || denominationId.trim() === '') {
    throw new Error('Selecciona una Denominacion IPCO')
  }

  await updateBudgetIpcoOverride({
    budgetId: parsed.budgetId,
    componentType: parsed.componentType,
    componentIds: parsed.componentIds,
    denominationId,
  })

  redirect(`/projects/${parsed.projectId}/budgets/${parsed.budgetId}/edit?tab=${parsed.tab}`)
}

export async function restoreBudgetIpcoOverrideAction(formData: FormData) {
  const parsed = parseBudgetIpcoForm(formData)

  await restoreBudgetIpcoOverride({
    budgetId: parsed.budgetId,
    componentType: parsed.componentType,
    componentIds: parsed.componentIds,
  })

  redirect(`/projects/${parsed.projectId}/budgets/${parsed.budgetId}/edit?tab=${parsed.tab}`)
}

export async function saveBudgetIpcoOverridesAction(formData: FormData) {
  const budgetId = formData.get('budgetId')
  const projectId = formData.get('projectId')
  const tab = formData.get('tab')
  const changesRaw = formData.get('changes')

  if (typeof budgetId !== 'string' || typeof projectId !== 'string') {
    throw new Error('Presupuesto no encontrado')
  }
  if (typeof changesRaw !== 'string') {
    throw new Error('Cambios IPCO invalidos')
  }

  const changes = JSON.parse(changesRaw) as Array<{
    componentType: BudgetIpcoComponentType
    componentIds: string[]
    denominationId: string | null
    originalDenominationId: string | null
  }>

  const validChanges = changes.filter((change) =>
    budgetIpcoComponentTypes.has(change.componentType) &&
    Array.isArray(change.componentIds) &&
    change.componentIds.length > 0,
  )

  if (validChanges.length > 0) {
    await saveBudgetIpcoOverrideChanges({ budgetId, changes: validChanges })
  }

  redirect(`/projects/${projectId}/budgets/${budgetId}/edit?tab=${typeof tab === 'string' ? tab : 'presupuesto'}`)
}
