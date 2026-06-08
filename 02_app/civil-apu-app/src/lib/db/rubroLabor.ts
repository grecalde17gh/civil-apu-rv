import { prisma } from './prisma'
import type { LaborItem, RubroLabor } from '@prisma/client'
import { calculateLaborCost } from '@/src/lib/calculations/labor'
import { resolveRubroTimeRequired } from '@/src/lib/calculations/rubroPerformance'
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

  const rubro = await prisma.rubro.findUnique({
    where: { id: params.rubroId },
    select: { performanceValue: true },
  })
  const hourlyCostSnapshot = Number(laborItem.hourlyCost.toString())
  const timeRequired = resolveRubroTimeRequired({
    rubroPerformanceValue: rubro?.performanceValue ? Number(rubro.performanceValue.toString()) : null,
    lineTimeRequired: params.timeRequired,
  })
  const totalCost = calculateLaborCost({
    workerQuantity: params.workerQuantity,
    hourlyCost: hourlyCostSnapshot,
    timeRequired,
    performanceMode: 'MANUAL_TIME',
  })

  return prisma.$transaction(async (tx) => {
    const rubroLabor = await tx.rubroLabor.create({
      data: {
        rubroId: params.rubroId,
        laborItemId: params.laborItemId,
        workerQuantity: params.workerQuantity,
        hourlyCostSnapshot,
        timeRequired,
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
  notes?: string
}): Promise<RubroLabor> {
  const existing = await prisma.rubroLabor.findUnique({
    where: { id: params.id },
    include: { laborItem: true },
  })

  if (!existing) {
    throw new Error('Linea de mano de obra no encontrada')
  }

  const hourlyCostSnapshot = Number(existing.laborItem.hourlyCost.toString())
  const rubro = await prisma.rubro.findUnique({
    where: { id: params.rubroId },
    select: { performanceValue: true },
  })
  const timeRequired = resolveRubroTimeRequired({
    rubroPerformanceValue: rubro?.performanceValue ? Number(rubro.performanceValue.toString()) : null,
    lineTimeRequired: params.timeRequired,
  })
  const totalCost = calculateLaborCost({
    workerQuantity: params.workerQuantity,
    hourlyCost: hourlyCostSnapshot,
    timeRequired,
    performanceMode: 'MANUAL_TIME',
  })

  return prisma.$transaction(async (tx) => {
    const rubroLabor = await tx.rubroLabor.update({
      where: { id: params.id },
      data: {
        workerQuantity: params.workerQuantity,
        hourlyCostSnapshot,
        timeRequired,
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
