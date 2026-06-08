import { prisma } from './prisma'
import type { EquipmentItem, Prisma } from '@prisma/client'
import { generateNextCatalogCode } from '../catalogCodes'
import { buildCopyName } from './copy'

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
  denominationId?: string
  priceDate?: Date
  isActive: boolean
}

export type EquipmentWithDenomination = Prisma.EquipmentItemGetPayload<{ include: { denomination: true } }>

export async function getEquipmentItems(): Promise<EquipmentWithDenomination[]> {
  return prisma.equipmentItem.findMany({
    include: { denomination: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getEquipmentById(id: string): Promise<EquipmentItem | null> {
  return prisma.equipmentItem.findUnique({
    where: { id },
  })
}

export async function createEquipment(data: EquipmentFormInput): Promise<EquipmentItem> {
  const code = data.code || (await generateNextEquipmentCode())

  return prisma.equipmentItem.create({
    data: {
      code,
      description: data.description,
      equipmentType: data.equipmentType || undefined,
      hourlyRate: data.hourlyRate ?? undefined,
      dailyRate: data.dailyRate ?? undefined,
      purchaseCost: data.purchaseCost ?? undefined,
      maintenanceRequired: data.maintenanceRequired,
      maintenanceNotes: data.maintenanceNotes || undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      denominationId: data.denominationId || undefined,
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
      denominationId: data.denominationId || null,
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

  const code = await generateNextEquipmentCode()

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
      denominationId: equipment.denominationId,
      priceDate: equipment.priceDate,
      isActive: equipment.isActive,
    },
  })
}

async function generateNextEquipmentCode(): Promise<string> {
  const equipment = await prisma.equipmentItem.findMany({ select: { code: true } })
  return generateNextCatalogCode(equipment.map((item) => item.code), 'EQ')
}
