import { prisma } from './prisma'
import type { IpcoDenomination, Material, RubroMaterial } from '@prisma/client'
import { calculateMaterialCost } from '@/src/lib/calculations/materials'
import { updateRubroTotals } from './rubros'

export type RubroMaterialWithMaterial = RubroMaterial & {
  material: Material & { denomination?: IpcoDenomination | null }
}

export async function getRubroMaterials(rubroId: string): Promise<RubroMaterialWithMaterial[]> {
  return prisma.rubroMaterial.findMany({
    where: { rubroId },
    include: { material: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function addRubroMaterial(params: {
  rubroId: string
  materialId: string
  quantity: number
  priceOption: number
  notes?: string
}): Promise<RubroMaterial> {
  const material = await prisma.material.findUnique({
    where: { id: params.materialId },
  })

  if (!material) {
    throw new Error('Material no encontrado')
  }

  const unitCostSnapshot = getMaterialPrice(material, params.priceOption)
  const totalCost = calculateMaterialCost(params.quantity, unitCostSnapshot)

  return prisma.$transaction(async (tx) => {
    const rubroMaterial = await tx.rubroMaterial.create({
      data: {
        rubroId: params.rubroId,
        materialId: params.materialId,
        quantity: params.quantity,
        unit: material.unit,
        priceOption: params.priceOption,
        unitCostSnapshot,
        totalCost,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroMaterial
  })
}

export async function updateRubroMaterial(params: {
  id: string
  rubroId: string
  quantity: number
  unit?: string
  priceOption?: number
  notes?: string
}): Promise<RubroMaterial> {
  const existing = await prisma.rubroMaterial.findUnique({
    where: { id: params.id },
    include: { material: { include: { denomination: true } } },
  })

  if (!existing) {
    throw new Error('Material del rubro no encontrado')
  }

  const priceOption = params.priceOption ?? existing.priceOption
  const unitCostSnapshot = getMaterialPrice(existing.material, priceOption)
  const totalCost = calculateMaterialCost(params.quantity, unitCostSnapshot)

  return prisma.$transaction(async (tx) => {
    const rubroMaterial = await tx.rubroMaterial.update({
      where: { id: params.id },
      data: {
        quantity: params.quantity,
        unit: params.unit?.trim() || undefined,
        priceOption,
        unitCostSnapshot,
        totalCost,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroMaterial
  })
}

function getMaterialPrice(material: Material, priceOption: number): number {
  const price = priceOption === 1 ? material.price1 : priceOption === 2 ? material.price2 : material.price3

  if (price === null || price === undefined) {
    throw new Error(`Precio ${priceOption} no disponible para el material seleccionado`)
  }

  return Number(price.toString())
}

export async function deleteRubroMaterial(id: string): Promise<void> {
  const existing = await prisma.rubroMaterial.findUnique({
    where: { id },
    select: { rubroId: true },
  })

  if (!existing) {
    throw new Error('Material del rubro no encontrado')
  }

  await prisma.$transaction(async (tx) => {
    await tx.rubroMaterial.delete({
      where: { id },
    })

    await updateRubroTotals(existing.rubroId, tx)
  })
}
