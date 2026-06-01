import { prisma } from './prisma'
import type { LaborItem, RubroLabor } from '@prisma/client'
import { calculateLaborCost } from '@/src/lib/calculations/labor'
import { updateRubroTotals } from './rubros'

export type RubroLaborWithLabor = RubroLabor & {
  laborItem: LaborItem
}

export async function getRubroLabor(rubroId: string): Promise<RubroLaborWithLabor[]> {
  return prisma.rubroLabor.findMany({
    where: { rubroId },
    include: { laborItem: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function addRubroLabor(params: {
  rubroId: string
  laborItemId: string
  workerQuantity: number
  timeRequired: number
  notes?: string
}): Promise<RubroLabor> {
  const laborItem = await prisma.laborItem.findUnique({
    where: { id: params.laborItemId },
  })

  if (!laborItem) {
    throw new Error('Mano de obra no encontrada')
  }

  const hourlyCostSnapshot = Number(laborItem.hourlyCost.toString())
  const totalCost = calculateLaborCost({
    workerQuantity: params.workerQuantity,
    hourlyCost: hourlyCostSnapshot,
    timeRequired: params.timeRequired,
    performanceMode: 'MANUAL_TIME',
  })

  return prisma.$transaction(async (tx) => {
    const rubroLabor = await tx.rubroLabor.create({
      data: {
        rubroId: params.rubroId,
        laborItemId: params.laborItemId,
        workerQuantity: params.workerQuantity,
        hourlyCostSnapshot,
        timeRequired: params.timeRequired,
        performanceMode: 'MANUAL_TIME',
        totalCost,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroLabor
  })
}

export async function updateRubroLabor(params: {
  id: string
  rubroId: string
  workerQuantity: number
  timeRequired: number
  hourlyCostSnapshot: number
  notes?: string
}): Promise<RubroLabor> {
  const totalCost = calculateLaborCost({
    workerQuantity: params.workerQuantity,
    hourlyCost: params.hourlyCostSnapshot,
    timeRequired: params.timeRequired,
    performanceMode: 'MANUAL_TIME',
  })

  return prisma.$transaction(async (tx) => {
    const rubroLabor = await tx.rubroLabor.update({
      where: { id: params.id },
      data: {
        workerQuantity: params.workerQuantity,
        hourlyCostSnapshot: params.hourlyCostSnapshot,
        timeRequired: params.timeRequired,
        totalCost,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroLabor
  })
}

export async function deleteRubroLabor(id: string): Promise<void> {
  const existing = await prisma.rubroLabor.findUnique({
    where: { id },
    select: { rubroId: true },
  })

  if (!existing) {
    throw new Error('Línea de mano de obra no encontrada')
  }

  await prisma.$transaction(async (tx) => {
    await tx.rubroLabor.delete({
      where: { id },
    })

    await updateRubroTotals(existing.rubroId, tx)
  })
}
