import { prisma } from './prisma'
import type { LaborItem, Prisma } from '@prisma/client'
import { generateNextCatalogCode } from '../catalogCodes'
import { buildCopyName } from './copy'

export type LaborFormInput = {
  code?: string
  roleName: string
  hourlyCost: number
  dailyCost?: number
  cpc?: string
  vae?: number
  category?: string
  denominationId?: string
  priceDate?: Date
  isActive: boolean
}

export type LaborWithDenomination = Prisma.LaborItemGetPayload<{ include: { denomination: true } }>

export async function getLaborItems(): Promise<LaborWithDenomination[]> {
  return prisma.laborItem.findMany({
    include: { denomination: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getLaborById(id: string): Promise<LaborItem | null> {
  return prisma.laborItem.findUnique({
    where: { id },
  })
}

export async function createLabor(data: LaborFormInput): Promise<LaborItem> {
  const code = data.code || (await generateNextLaborCode())

  return prisma.laborItem.create({
    data: {
      code,
      roleName: data.roleName,
      hourlyCost: data.hourlyCost,
      dailyCost: data.dailyCost ?? undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      category: data.category || undefined,
      denominationId: data.denominationId || undefined,
      priceDate: data.priceDate ?? undefined,
      isActive: data.isActive,
    },
  })
}

export async function updateLabor(id: string, data: LaborFormInput): Promise<LaborItem> {
  return prisma.laborItem.update({
    where: { id },
    data: {
      code: data.code || undefined,
      roleName: data.roleName,
      hourlyCost: data.hourlyCost,
      dailyCost: data.dailyCost ?? undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      category: data.category || undefined,
      denominationId: data.denominationId || null,
      priceDate: data.priceDate ?? undefined,
      isActive: data.isActive,
    },
  })
}

export async function toggleLaborActive(id: string, isActive: boolean): Promise<LaborItem> {
  return prisma.laborItem.update({
    where: { id },
    data: { isActive },
  })
}

export async function copyLabor(id: string): Promise<LaborItem> {
  const labor = await getLaborById(id)

  if (!labor) {
    throw new Error('Mano de obra no encontrada')
  }

  const code = await generateNextLaborCode()

  return prisma.laborItem.create({
    data: {
      code,
      roleName: buildCopyName(labor.roleName),
      hourlyCost: labor.hourlyCost,
      dailyCost: labor.dailyCost,
      cpc: labor.cpc,
      vae: labor.vae,
      category: labor.category,
      denominationId: labor.denominationId,
      priceDate: labor.priceDate,
      isActive: labor.isActive,
    },
  })
}

async function generateNextLaborCode(): Promise<string> {
  const labor = await prisma.laborItem.findMany({ select: { code: true } })
  return generateNextCatalogCode(labor.map((item) => item.code), 'MO')
}
