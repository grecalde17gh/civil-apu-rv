import type { Prisma } from '@prisma/client'
import {
  calculateWeeklyScheduleAmount,
  clampScheduleWeekCount,
  DEFAULT_SCHEDULE_WEEK_COUNT,
  normalizeScheduleRange,
} from '@/src/lib/calculations/budgetSchedule'
import { prisma } from './prisma'

export type BudgetScheduleEntryInput = {
  budgetItemId: string
  groupName: string
  startWeek: number | null
  endWeek: number | null
}

export type BudgetScheduleForEdit = Awaited<ReturnType<typeof getBudgetScheduleForEdit>>

function getBudgetItemAmount(item: {
  subtotalSnapshot: { toString(): string } | null
  totalPrice: { toString(): string } | null
}): number {
  const subtotal = Number(item.subtotalSnapshot?.toString() ?? '0')
  if (subtotal > 0) return subtotal

  return Number(item.totalPrice?.toString() ?? '0')
}

async function ensureScheduleEntries(
  budgetId: string,
  scheduleId: string,
  tx: Prisma.TransactionClient = prisma,
) {
  const items = await tx.budgetItem.findMany({
    where: { budgetId },
    select: {
      id: true,
      subtotalSnapshot: true,
      totalPrice: true,
    },
  })

  for (const item of items) {
    await tx.budgetScheduleEntry.upsert({
      where: {
        scheduleId_budgetItemId: {
          scheduleId,
          budgetItemId: item.id,
        },
      },
      update: {
        totalAmountSnapshot: getBudgetItemAmount(item),
      },
      create: {
        scheduleId,
        budgetItemId: item.id,
        groupName: 'Grupo 1',
        totalAmountSnapshot: getBudgetItemAmount(item),
        weeklyAmountSnapshot: 0,
      },
    })
  }
}

async function ensureBudgetSchedule(
  budgetId: string,
  weekCount: number = DEFAULT_SCHEDULE_WEEK_COUNT,
  tx: Prisma.TransactionClient = prisma,
) {
  const existing = await tx.budgetSchedule.findUnique({ where: { budgetId } })
  if (existing) return existing

  try {
    return await tx.budgetSchedule.create({
      data: {
        budgetId,
        weekCount,
      },
    })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return tx.budgetSchedule.findUniqueOrThrow({ where: { budgetId } })
    }

    throw error
  }
}

export async function getBudgetScheduleForEdit(budgetId: string) {
  return prisma.$transaction(async (tx) => {
    const schedule = await ensureBudgetSchedule(budgetId, DEFAULT_SCHEDULE_WEEK_COUNT, tx)

    await ensureScheduleEntries(budgetId, schedule.id, tx)

    return tx.budgetSchedule.findUniqueOrThrow({
      where: { id: schedule.id },
      include: {
        entries: {
          orderBy: [{ groupName: 'asc' }, { budgetItem: { createdAt: 'asc' } }],
          include: {
            budgetItem: true,
          },
        },
      },
    })
  })
}

export async function updateBudgetSchedule(params: {
  budgetId: string
  weekCount: number
  entries: BudgetScheduleEntryInput[]
}) {
  const weekCount = clampScheduleWeekCount(params.weekCount)

  return prisma.$transaction(async (tx) => {
    const schedule = await ensureBudgetSchedule(params.budgetId, weekCount, tx)
    await tx.budgetSchedule.update({
      where: { id: schedule.id },
      data: { weekCount },
    })

    await ensureScheduleEntries(params.budgetId, schedule.id, tx)

    const items = await tx.budgetItem.findMany({
      where: { budgetId: params.budgetId },
      select: {
        id: true,
        subtotalSnapshot: true,
        totalPrice: true,
      },
    })
    const itemAmounts = new Map(items.map((item) => [item.id, getBudgetItemAmount(item)]))

    for (const entry of params.entries) {
      if (!itemAmounts.has(entry.budgetItemId)) continue

      const range = normalizeScheduleRange(
        {
          startWeek: entry.startWeek,
          endWeek: entry.endWeek,
        },
        weekCount,
      )
      const totalAmount = itemAmounts.get(entry.budgetItemId) ?? 0
      const weeklyAmount = calculateWeeklyScheduleAmount(totalAmount, range)
      const groupName = entry.groupName.trim() || 'Grupo 1'

      await tx.budgetScheduleEntry.upsert({
        where: {
          scheduleId_budgetItemId: {
            scheduleId: schedule.id,
            budgetItemId: entry.budgetItemId,
          },
        },
        update: {
          groupName,
          startWeek: range.startWeek,
          endWeek: range.endWeek,
          totalAmountSnapshot: totalAmount,
          weeklyAmountSnapshot: weeklyAmount,
        },
        create: {
          scheduleId: schedule.id,
          budgetItemId: entry.budgetItemId,
          groupName,
          startWeek: range.startWeek,
          endWeek: range.endWeek,
          totalAmountSnapshot: totalAmount,
          weeklyAmountSnapshot: weeklyAmount,
        },
      })
    }

    return schedule
  })
}
