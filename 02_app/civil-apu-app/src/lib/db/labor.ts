import { prisma } from './prisma'
import type { LaborItem } from '@prisma/client'
import { buildCopyName, generateCopyCode } from './copy'

export type LaborFormInput = {
  code?: string
  roleName: string
  hourlyCost: number
  dailyCost?: number
  competencies?: string
  availability?: string
  cpc?: string
  vae?: number
  category?: string
  priceDate?: Date
  isActive: boolean
}

export async function getLaborItems(): Promise<LaborItem[]> {
  return prisma.laborItem.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getLaborById(id: string): Promise<LaborItem | null> {
  return prisma.laborItem.findUnique({
    where: { id },
  })
}

export async function createLabor(data: LaborFormInput): Promise<LaborItem> {
  return prisma.laborItem.create({
    data: {
      code: data.code || undefined,
      roleName: data.roleName,
      hourlyCost: data.hourlyCost,
      dailyCost: data.dailyCost ?? undefined,
      competencies: data.competencies || undefined,
      availability: data.availability || undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      category: data.category || undefined,
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
      competencies: data.competencies || undefined,
      availability: data.availability || undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      category: data.category || undefined,
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

  const code = await generateCopyCode(labor.code, async (candidate) => {
    const existing = await prisma.laborItem.findFirst({ where: { code: candidate }, select: { id: true } })
    return existing !== null
  })

  return prisma.laborItem.create({
    data: {
      code,
      roleName: buildCopyName(labor.roleName),
      hourlyCost: labor.hourlyCost,
      dailyCost: labor.dailyCost,
      competencies: labor.competencies,
      availability: labor.availability,
      cpc: labor.cpc,
      vae: labor.vae,
      category: labor.category,
      priceDate: labor.priceDate,
      isActive: labor.isActive,
    },
  })
}
