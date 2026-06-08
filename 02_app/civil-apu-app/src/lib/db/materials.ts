import { prisma } from './prisma'
import type { Material, Prisma } from '@prisma/client'
import { generateNextCatalogCode } from '../catalogCodes'
import { buildCopyName } from './copy'

export type MaterialFormInput = {
  code?: string
  description: string
  unit: string
  price1: number
  price2?: number
  price3?: number
  cpc?: string
  vae?: number
  denominationId?: string
  usesCategory1: boolean
  usesCategory2: boolean
  priceDate?: Date
  isActive: boolean
}

export type MaterialWithDenomination = Prisma.MaterialGetPayload<{ include: { denomination: true } }>

export async function getMaterials(): Promise<MaterialWithDenomination[]> {
  return prisma.material.findMany({
    include: { denomination: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getMaterialById(id: string): Promise<Material | null> {
  return prisma.material.findUnique({
    where: { id },
  })
}

export async function createMaterial(data: MaterialFormInput): Promise<Material> {
  const code = data.code || (await generateNextMaterialCode())

  return prisma.material.create({
    data: {
      code,
      description: data.description,
      unit: data.unit,
      price1: data.price1,
      price2: data.price2 ?? undefined,
      price3: data.price3 ?? undefined,
      unitCost: data.price1,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      denominationId: data.denominationId || undefined,
      usesCategory1: data.usesCategory1,
      usesCategory2: data.usesCategory2,
      priceDate: data.priceDate ?? undefined,
      isActive: data.isActive,
    },
  })
}

export async function updateMaterial(id: string, data: MaterialFormInput): Promise<Material> {
  return prisma.material.update({
    where: { id },
    data: {
      code: data.code || undefined,
      description: data.description,
      unit: data.unit,
      price1: data.price1,
      price2: data.price2 ?? undefined,
      price3: data.price3 ?? undefined,
      unitCost: data.price1,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      denominationId: data.denominationId || null,
      usesCategory1: data.usesCategory1,
      usesCategory2: data.usesCategory2,
      priceDate: data.priceDate ?? undefined,
      isActive: data.isActive,
    },
  })
}

export async function toggleMaterialActive(id: string, isActive: boolean): Promise<Material> {
  return prisma.material.update({
    where: { id },
    data: { isActive },
  })
}

export async function copyMaterial(id: string): Promise<Material> {
  const material = await getMaterialById(id)

  if (!material) {
    throw new Error('Material no encontrado')
  }

  const code = await generateNextMaterialCode()

  return prisma.material.create({
    data: {
      code,
      description: buildCopyName(material.description),
      unit: material.unit,
      price1: material.price1,
      price2: material.price2,
      price3: material.price3,
      unitCost: material.unitCost,
      cpc: material.cpc,
      vae: material.vae,
      denominationId: material.denominationId,
      usesCategory1: material.usesCategory1,
      usesCategory2: material.usesCategory2,
      priceDate: material.priceDate,
      isActive: material.isActive,
    },
  })
}

async function generateNextMaterialCode(): Promise<string> {
  const materials = await prisma.material.findMany({ select: { code: true } })
  return generateNextCatalogCode(materials.map((material) => material.code), 'MAT')
}
