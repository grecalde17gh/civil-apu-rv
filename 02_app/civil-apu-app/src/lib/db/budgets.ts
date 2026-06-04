import { prisma } from './prisma'
import type { Budget, BudgetStatus, BudgetItem, Prisma } from '@prisma/client'
import { calculateTaxAmount } from '@/src/lib/calculations/budget'
import { buildCopyName, generateCopyCode } from './copy'

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

export async function getBudgetByIdForEdit(budgetId: string) {
  return prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      project: true,
      items: {
        orderBy: { createdAt: 'asc' },
        include: {
          rubro: {
            include: {
              materials: {
                include: { material: true },
              },
              labor: {
                include: { laborItem: true },
              },
              equipment: {
                include: { equipmentItem: true },
              },
              transport: true,
            },
          },
        },
      },
    },
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
  indirectPercentageApplied: number
  directCostSnapshot: number
  indirectCostSnapshot: number
  unitPriceSnapshot: number
  subtotalSnapshot: number
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
      indirectPercentageApplied: data.indirectPercentageApplied,
      directCostSnapshot: data.directCostSnapshot,
      indirectCostSnapshot: data.indirectCostSnapshot,
      unitPriceSnapshot: data.unitPriceSnapshot,
      subtotalSnapshot: data.subtotalSnapshot,
      totalPrice: data.totalPrice,
      notes: data.notes ?? undefined,
    },
  })
}

export async function deleteBudgetItem(budgetItemId: string): Promise<void> {
  await prisma.budgetItem.delete({ where: { id: budgetItemId } })
}

export async function recalculateBudgetTotals(budgetId: string, tx: Prisma.TransactionClient = prisma): Promise<void> {
  const items = await tx.budgetItem.findMany({ where: { budgetId } })

  const subtotal = items.reduce((sum, item) => {
    const subtotalSnapshot = Number(item.subtotalSnapshot.toString())
    const legacyTotalPrice = Number(item.totalPrice.toString())
    return sum + (subtotalSnapshot > 0 ? subtotalSnapshot : legacyTotalPrice)
  }, 0)

  const budget = await tx.budget.findUnique({ where: { id: budgetId } })

  const ivaPercentage = Number(budget?.ivaPercentage?.toString() ?? '0')
  const ivaAmount = calculateTaxAmount(subtotal, ivaPercentage)

  await tx.budget.update({ where: { id: budgetId }, data: { subtotal, ivaAmount, total: subtotal } })
}

export async function createBudget(data: {
  projectId: string
  code?: string
  name: string
  status: BudgetStatus
  ivaPercentage: number
  indirectPercentage: number
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
      indirectPercentage: data.indirectPercentage,
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
  indirectPercentage: number
  notes?: string
  issuedAt?: Date
}): Promise<Budget> {
  return prisma.budget.update({
    where: { id: budgetId },
    data: {
      code: data.code ?? undefined,
      name: data.name,
      status: data.status,
      indirectPercentage: data.indirectPercentage,
      ivaPercentage: data.ivaPercentage,
      notes: data.notes ?? undefined,
      issuedAt: data.issuedAt ?? undefined,
    },
  })
}

export async function copyBudget(budgetId: string): Promise<Budget> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { items: true },
  })

  if (!budget) {
    throw new Error('Presupuesto no encontrado')
  }

  const code = await generateCopyCode(budget.code, async (candidate) => {
    const existing = await prisma.budget.findFirst({
      where: {
        projectId: budget.projectId,
        code: candidate,
      },
      select: { id: true },
    })
    return existing !== null
  })

  return prisma.$transaction(async (tx) => {
    const copied = await tx.budget.create({
      data: {
        projectId: budget.projectId,
        code,
        name: buildCopyName(budget.name),
        clientNameSnapshot: budget.clientNameSnapshot,
        locationSnapshot: budget.locationSnapshot,
        status: 'DRAFT',
        subtotal: budget.subtotal,
        indirectPercentage: budget.indirectPercentage,
        ivaPercentage: budget.ivaPercentage,
        ivaAmount: budget.ivaAmount,
        total: budget.total,
        notes: budget.notes,
        items: {
          create: budget.items.map((item) => ({
            rubroId: item.rubroId,
            itemNumber: item.itemNumber,
            rubroCodeSnapshot: item.rubroCodeSnapshot,
            descriptionSnapshot: item.descriptionSnapshot,
            unitSnapshot: item.unitSnapshot,
            quantity: item.quantity,
            indirectPercentageApplied: item.indirectPercentageApplied,
            directCostSnapshot: item.directCostSnapshot,
            indirectCostSnapshot: item.indirectCostSnapshot,
            unitPriceSnapshot: item.unitPriceSnapshot,
            subtotalSnapshot: item.subtotalSnapshot,
            totalPrice: item.totalPrice,
            notes: item.notes,
          })),
        },
      },
    })

    await recalculateBudgetTotals(copied.id, tx)

    const updated = await tx.budget.findUnique({ where: { id: copied.id } })
    if (!updated) {
      throw new Error('No se pudo recuperar la copia del presupuesto')
    }

    return updated
  })
}
