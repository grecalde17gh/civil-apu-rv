import { prisma } from './prisma'
import type { Budget, BudgetStatus, BudgetItem } from '@prisma/client'
import { calculateBudgetTotal, calculateTaxAmount } from '@/src/lib/calculations/budget'

export async function getBudgetsByProjectId(projectId: string): Promise<Budget[]> {
  return prisma.budget.findMany({
    where: { projectId },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getBudgetById(budgetId: string): Promise<Budget | null> {
  return prisma.budget.findUnique({
    where: { id: budgetId },
  })
}

export async function getBudgetByIdWithProject(budgetId: string) {
  return prisma.budget.findUnique({
    where: { id: budgetId },
    include: { project: true, items: true },
  })
}

export async function getBudgetItemsByBudgetId(budgetId: string): Promise<BudgetItem[]> {
  return prisma.budgetItem.findMany({
    where: { budgetId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createBudgetItem(data: {
  budgetId: string
  rubroId: string
  itemNumber: string
  rubroCodeSnapshot: string
  descriptionSnapshot: string
  unitSnapshot: string
  quantity: number
  unitPriceSnapshot: number
  totalPrice: number
  notes?: string
}): Promise<BudgetItem> {
  return prisma.budgetItem.create({
    data: {
      budgetId: data.budgetId,
      rubroId: data.rubroId,
      itemNumber: data.itemNumber,
      rubroCodeSnapshot: data.rubroCodeSnapshot,
      descriptionSnapshot: data.descriptionSnapshot,
      unitSnapshot: data.unitSnapshot,
      quantity: data.quantity,
      unitPriceSnapshot: data.unitPriceSnapshot,
      totalPrice: data.totalPrice,
      notes: data.notes ?? undefined,
    },
  })
}

export async function deleteBudgetItem(budgetItemId: string): Promise<void> {
  await prisma.budgetItem.delete({ where: { id: budgetItemId } })
}

export async function recalculateBudgetTotals(budgetId: string): Promise<void> {
  const items = await prisma.budgetItem.findMany({ where: { budgetId } })

  const itemsForCalc = items.map((it) => ({ quantity: Number(it.quantity.toString()), unitPrice: Number(it.unitPriceSnapshot.toString()) }))

  const subtotal = calculateBudgetTotal(itemsForCalc)
  const budget = await prisma.budget.findUnique({ where: { id: budgetId } })

  const ivaPercentage = Number(budget?.ivaPercentage?.toString() ?? '0')
  const ivaAmount = calculateTaxAmount(subtotal, ivaPercentage)

  await prisma.budget.update({ where: { id: budgetId }, data: { subtotal, ivaAmount, total: subtotal } })
}

export async function createBudget(data: {
  projectId: string
  code?: string
  name: string
  status: BudgetStatus
  ivaPercentage: number
  notes?: string
  issuedAt?: Date
  clientNameSnapshot?: string
  locationSnapshot?: string
}): Promise<Budget> {
  return prisma.budget.create({
    data: {
      projectId: data.projectId,
      code: data.code ?? undefined,
      name: data.name,
      status: data.status,
      ivaPercentage: data.ivaPercentage,
      notes: data.notes ?? undefined,
      issuedAt: data.issuedAt ?? undefined,
      clientNameSnapshot: data.clientNameSnapshot ?? undefined,
      locationSnapshot: data.locationSnapshot ?? undefined,
    },
  })
}

export async function updateBudget(budgetId: string, data: {
  code?: string
  name: string
  status: BudgetStatus
  ivaPercentage: number
  notes?: string
  issuedAt?: Date
}): Promise<Budget> {
  return prisma.budget.update({
    where: { id: budgetId },
    data: {
      code: data.code ?? undefined,
      name: data.name,
      status: data.status,
      ivaPercentage: data.ivaPercentage,
      notes: data.notes ?? undefined,
      issuedAt: data.issuedAt ?? undefined,
    },
  })
}
