import { prisma } from './prisma'
import type { EquipmentItem, RubroEquipment } from '@prisma/client'
import { calculateEquipmentCost } from '@/src/lib/calculations/equipment'
import { resolveRubroTimeRequired } from '@/src/lib/calculations/rubroPerformance'
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

  const rubro = await prisma.rubro.findUnique({
    where: { id: params.rubroId },
    select: { performanceValue: true },
  })
  const rateSnapshot = Number(equipmentItem.hourlyRate.toString())
  const timeRequired = resolveRubroTimeRequired({
    rubroPerformanceValue: rubro?.performanceValue ? Number(rubro.performanceValue.toString()) : null,
    lineTimeRequired: params.timeRequired,
  })
  const totalCost = calculateEquipmentCost({
    equipmentQuantity: params.equipmentQuantity,
    rate: rateSnapshot,
    timeRequired,
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
        timeRequired,
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
  notes?: string
}): Promise<RubroEquipment> {
  const existing = await prisma.rubroEquipment.findUnique({
    where: { id: params.id },
    include: { equipmentItem: true },
  })

  if (!existing) {
    throw new Error('Linea de equipo no encontrada')
  }

  if (existing.equipmentItem.hourlyRate === null) {
    throw new Error('El equipo seleccionado no tiene tarifa horaria vigente')
  }

  const rateSnapshot = Number(existing.equipmentItem.hourlyRate.toString())
  const rubro = await prisma.rubro.findUnique({
    where: { id: params.rubroId },
    select: { performanceValue: true },
  })
  const timeRequired = resolveRubroTimeRequired({
    rubroPerformanceValue: rubro?.performanceValue ? Number(rubro.performanceValue.toString()) : null,
    lineTimeRequired: params.timeRequired,
  })
  const totalCost = calculateEquipmentCost({
    equipmentQuantity: params.equipmentQuantity,
    rate: rateSnapshot,
    timeRequired,
    performanceMode: 'MANUAL_TIME',
    rateType: 'HOURLY',
  })

  return prisma.$transaction(async (tx) => {
    const rubroEquipment = await tx.rubroEquipment.update({
      where: { id: params.id },
      data: {
        equipmentQuantity: params.equipmentQuantity,
        rateSnapshot,
        timeRequired,
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
