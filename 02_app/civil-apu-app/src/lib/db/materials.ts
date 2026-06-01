import { prisma } from './prisma'
import type { Material } from '@prisma/client'
import { buildCopyName, generateCopyCode } from './copy'

export type MaterialFormInput = {
  code?: string
  description: string
  unit: string
  unitCost: number
  stockQuantity?: number
  cpc?: string
  vae?: number
  category?: string
  source?: string
  priceDate?: Date
  isActive: boolean
}

export async function getMaterials(): Promise<Material[]> {
  return prisma.material.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getMaterialById(id: string): Promise<Material | null> {
  return prisma.material.findUnique({
    where: { id },
  })
}

export async function createMaterial(data: MaterialFormInput): Promise<Material> {
  return prisma.material.create({
    data: {
      code: data.code || undefined,
      description: data.description,
      unit: data.unit,
      unitCost: data.unitCost,
      stockQuantity: data.stockQuantity ?? undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      category: data.category || undefined,
      source: data.source || undefined,
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
      unitCost: data.unitCost,
      stockQuantity: data.stockQuantity ?? undefined,
      cpc: data.cpc || undefined,
      vae: data.vae ?? undefined,
      category: data.category || undefined,
      source: data.source || undefined,
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

  const code = await generateCopyCode(material.code, async (candidate) => {
    const existing = await prisma.material.findFirst({ where: { code: candidate }, select: { id: true } })
    return existing !== null
  })

  return prisma.material.create({
    data: {
      code,
      description: buildCopyName(material.description),
      unit: material.unit,
      unitCost: material.unitCost,
      stockQuantity: material.stockQuantity,
      cpc: material.cpc,
      vae: material.vae,
      category: material.category,
      source: material.source,
      priceDate: material.priceDate,
      isActive: material.isActive,
    },
  })
}
