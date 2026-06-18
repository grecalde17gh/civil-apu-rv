import { prisma } from './prisma'
import type { Budget, BudgetStatus, BudgetItem, Prisma } from '@prisma/client'
import { calculateBudgetGrandTotal, calculateBudgetItemSnapshots, calculateBudgetItemTotal, calculateTaxAmount } from '@/src/lib/calculations/budget'
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
                include: { material: { include: { denomination: true } } },
              },
              labor: {
                include: { laborItem: { include: { denomination: true } } },
              },
              equipment: {
                include: { equipmentItem: { include: { denomination: true } } },
              },
              transport: {
                include: { denomination: true },
              },
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
  technicalSpecificationSnapshot?: string
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
      technicalSpecificationSnapshot: data.technicalSpecificationSnapshot ?? undefined,
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

export async function updateBudgetItemQuantity(params: {
  budgetId: string
  budgetItemId: string
  quantity: number
}): Promise<BudgetItem> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.budgetItem.findUnique({
      where: { id: params.budgetItemId },
    })

    if (!item || item.budgetId !== params.budgetId) {
      throw new Error('Item de presupuesto no encontrado')
    }

    const unitPriceSnapshot = Number(item.unitPriceSnapshot.toString())
    const subtotalSnapshot = calculateBudgetItemTotal(params.quantity, unitPriceSnapshot)
    const updated = await tx.budgetItem.update({
      where: { id: params.budgetItemId },
      data: {
        quantity: params.quantity,
        subtotalSnapshot,
        totalPrice: subtotalSnapshot,
      },
    })

    await recalculateBudgetTotals(params.budgetId, tx)

    return updated
  })
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
  const total = calculateBudgetGrandTotal(subtotal, ivaPercentage)

  await tx.budget.update({ where: { id: budgetId }, data: { subtotal, ivaAmount, total } })
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
  return prisma.$transaction(async (tx) => {
    const updated = await tx.budget.update({
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

    const items = await tx.budgetItem.findMany({ where: { budgetId } })

    for (const item of items) {
      const quantity = Number(item.quantity.toString())
      const directCost = Number(item.directCostSnapshot.toString())
      const snapshots = calculateBudgetItemSnapshots({
        quantity,
        directCost,
        indirectPercentage: data.indirectPercentage,
      })

      await tx.budgetItem.update({
        where: { id: item.id },
        data: snapshots,
      })
    }

    await recalculateBudgetTotals(budgetId, tx)

    return updated
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
            technicalSpecificationSnapshot: item.technicalSpecificationSnapshot,
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
