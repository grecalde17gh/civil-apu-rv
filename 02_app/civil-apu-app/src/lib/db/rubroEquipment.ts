import { prisma } from './prisma'
import type { EquipmentItem, RubroEquipment } from '@prisma/client'
import { calculateEquipmentCost } from '@/src/lib/calculations/equipment'
import { updateRubroTotals } from './rubros'

export type RubroEquipmentWithItem = RubroEquipment & {
  equipmentItem: EquipmentItem
}

export async function getRubroEquipment(rubroId: string): Promise<RubroEquipmentWithItem[]> {
  return prisma.rubroEquipment.findMany({
    where: { rubroId },
    include: { equipmentItem: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function addRubroEquipment(params: {
  rubroId: string
  equipmentItemId: string
  equipmentQuantity: number
  timeRequired: number
  notes?: string
}): Promise<RubroEquipment> {
  const equipmentItem = await prisma.equipmentItem.findUnique({
    where: { id: params.equipmentItemId },
  })

  if (!equipmentItem) {
    throw new Error('Equipo no encontrado')
  }

  if (equipmentItem.hourlyRate === null) {
    throw new Error('El equipo seleccionado no tiene tarifa horaria vigente')
  }

  const rateSnapshot = Number(equipmentItem.hourlyRate.toString())
  const totalCost = calculateEquipmentCost({
    equipmentQuantity: params.equipmentQuantity,
    rate: rateSnapshot,
    timeRequired: params.timeRequired,
    performanceMode: 'MANUAL_TIME',
    rateType: 'HOURLY',
  })

  return prisma.$transaction(async (tx) => {
    const rubroEquipment = await tx.rubroEquipment.create({
      data: {
        rubroId: params.rubroId,
        equipmentItemId: params.equipmentItemId,
        equipmentQuantity: params.equipmentQuantity,
        rateType: 'HOURLY',
        rateSnapshot,
        timeRequired: params.timeRequired,
        performanceMode: 'MANUAL_TIME',
        totalCost,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroEquipment
  })
}

export async function updateRubroEquipment(params: {
  id: string
  rubroId: string
  equipmentQuantity: number
  timeRequired: number
  rateSnapshot: number
  notes?: string
}): Promise<RubroEquipment> {
  const totalCost = calculateEquipmentCost({
    equipmentQuantity: params.equipmentQuantity,
    rate: params.rateSnapshot,
    timeRequired: params.timeRequired,
    performanceMode: 'MANUAL_TIME',
    rateType: 'HOURLY',
  })

  return prisma.$transaction(async (tx) => {
    const rubroEquipment = await tx.rubroEquipment.update({
      where: { id: params.id },
      data: {
        equipmentQuantity: params.equipmentQuantity,
        rateSnapshot: params.rateSnapshot,
        timeRequired: params.timeRequired,
        totalCost,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroEquipment
  })
}

export async function deleteRubroEquipment(id: string): Promise<void> {
  const existing = await prisma.rubroEquipment.findUnique({
    where: { id },
    select: { rubroId: true },
  })

  if (!existing) {
    throw new Error('Línea de equipo no encontrada')
  }

  await prisma.$transaction(async (tx) => {
    await tx.rubroEquipment.delete({
      where: { id },
    })

    await updateRubroTotals(existing.rubroId, tx)
  })
}
