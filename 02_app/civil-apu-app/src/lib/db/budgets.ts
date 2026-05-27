import { prisma } from './prisma'
import type { Budget, BudgetStatus } from '@prisma/client'

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
    include: { project: true },
  })
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
