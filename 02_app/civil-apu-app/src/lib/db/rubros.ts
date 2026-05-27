import { prisma } from './prisma'
import type { Rubro } from '@prisma/client'
import type { RubroFormInput } from '@/src/lib/validations/rubro'
import { calculateDirectCost, calculateIndirectCost, calculateUnitPrice } from '@/src/lib/calculations/apu'

export async function getRubros(): Promise<Rubro[]> {
  return prisma.rubro.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getRubroById(id: string): Promise<Rubro | null> {
  return prisma.rubro.findUnique({
    where: { id },
  })
}

export async function createRubro(data: RubroFormInput): Promise<Rubro> {
  return prisma.rubro.create({
    data: {
      code: data.code,
      description: data.description,
      unit: data.unit,
      category: data.category ?? undefined,
      performanceValue: data.performanceValue ?? undefined,
      performanceUnit: data.performanceUnit ?? undefined,
      indirectPercentage: data.indirectPercentage,
      notes: data.notes ?? undefined,
      status: data.status,
      calculationStatus: data.calculationStatus,
    },
  })
}

export async function updateRubro(id: string, data: RubroFormInput): Promise<Rubro> {
  return prisma.rubro.update({
    where: { id },
    data: {
      code: data.code,
      description: data.description,
      unit: data.unit,
      category: data.category ?? undefined,
      performanceValue: data.performanceValue ?? undefined,
      performanceUnit: data.performanceUnit ?? undefined,
      indirectPercentage: data.indirectPercentage,
      notes: data.notes ?? undefined,
      status: data.status,
      calculationStatus: data.calculationStatus,
    },
  })
}

export async function updateRubroTotals(rubroId: string, tx = prisma): Promise<void> {
  const materialsAggregate = await tx.rubroMaterial.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const laborAggregate = await tx.rubroLabor.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const equipmentAggregate = await tx.rubroEquipment.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const transportAggregate = await tx.rubroTransport.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const materialsSubtotal = Number(materialsAggregate._sum.totalCost?.toString() ?? '0')
  const laborSubtotal = Number(laborAggregate._sum.totalCost?.toString() ?? '0')
  const equipmentSubtotal = Number(equipmentAggregate._sum.totalCost?.toString() ?? '0')
  const transportSubtotal = Number(transportAggregate._sum.totalCost?.toString() ?? '0')

  const rubro = await tx.rubro.findUnique({
    where: { id: rubroId },
    select: { indirectPercentage: true },
  })

  if (!rubro) {
    throw new Error('Rubro no encontrado')
  }

  const directCost = calculateDirectCost({
    materialsSubtotal,
    laborSubtotal,
    equipmentSubtotal,
    transportSubtotal,
  })

  const indirectCost = calculateIndirectCost(directCost, Number(rubro.indirectPercentage.toString()))
  const unitPrice = calculateUnitPrice(directCost, Number(rubro.indirectPercentage.toString()))

  await tx.rubro.update({
    where: { id: rubroId },
    data: {
      directCost,
      indirectCost,
      unitPrice,
    },
  })
}
