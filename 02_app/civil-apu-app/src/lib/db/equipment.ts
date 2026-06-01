import { prisma } from './prisma'
import type { EquipmentItem } from '@prisma/client'
import { buildCopyName, generateCopyCode } from './copy'

export type EquipmentFormInput = {
  code?: string
  description: string
  equipmentType?: string
  hourlyRate?: number
  dailyRate?: number
  purchaseCost?: number
  maintenanceRequired: boolean
  maintenanceNotes?: string
  cpc?: string
  vae?: number
  priceDate?: Date
  isActive: boolean
}

export async function getEquipmentItems(): Promise<EquipmentItem[]> {
  return prisma.equipmentItem.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getEquipmentById(id: string): Promise<EquipmentItem | null> {
  return prisma.equipmentItem.findUnique({
    where: { id },
  })
}

export async function createEquipment(data: EquipmentFormInput): Promise<EquipmentItem> {
  return prisma.equipmentItem.create({
    data: {
      code: data.code || undefined,
      description: data.description,
      equipmentType: data.equipmentType || undefined,
      hourlyRate: data.hourlyRate ?? undefined,
      dailyRate: data.dailyRate ?? undefined,
      purchaseCost: data.purchaseCost ?? undefined,
      maintenanceRequired: data.maintenanceRequired,
      maintenanceNotes: data.maintenanceNotes || undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      priceDate: data.priceDate ?? undefined,
      isActive: data.isActive,
    },
  })
}

export async function updateEquipment(id: string, data: EquipmentFormInput): Promise<EquipmentItem> {
  return prisma.equipmentItem.update({
    where: { id },
    data: {
      code: data.code || undefined,
      description: data.description,
      equipmentType: data.equipmentType || undefined,
      hourlyRate: data.hourlyRate ?? undefined,
      dailyRate: data.dailyRate ?? undefined,
      purchaseCost: data.purchaseCost ?? undefined,
      maintenanceRequired: data.maintenanceRequired,
      maintenanceNotes: data.maintenanceNotes || undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      priceDate: data.priceDate ?? undefined,
      isActive: data.isActive,
    },
  })
}

export async function toggleEquipmentActive(id: string, isActive: boolean): Promise<EquipmentItem> {
  return prisma.equipmentItem.update({
    where: { id },
    data: { isActive },
  })
}

export async function copyEquipment(id: string): Promise<EquipmentItem> {
  const equipment = await getEquipmentById(id)

  if (!equipment) {
    throw new Error('Equipo no encontrado')
  }

  const code = await generateCopyCode(equipment.code, async (candidate) => {
    const existing = await prisma.equipmentItem.findFirst({ where: { code: candidate }, select: { id: true } })
    return existing !== null
  })

  return prisma.equipmentItem.create({
    data: {
      code,
      description: buildCopyName(equipment.description),
      equipmentType: equipment.equipmentType,
      hourlyRate: equipment.hourlyRate,
      dailyRate: equipment.dailyRate,
      purchaseCost: equipment.purchaseCost,
      maintenanceRequired: equipment.maintenanceRequired,
      maintenanceNotes: equipment.maintenanceNotes,
      cpc: equipment.cpc,
      vae: equipment.vae,
      priceDate: equipment.priceDate,
      isActive: equipment.isActive,
    },
  })
}
