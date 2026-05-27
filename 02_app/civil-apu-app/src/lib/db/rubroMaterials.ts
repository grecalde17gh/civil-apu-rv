import { prisma } from './prisma'
import type { Material, RubroMaterial } from '@prisma/client'
import { calculateMaterialCost } from '@/src/lib/calculations/materials'
import { updateRubroTotals } from './rubros'

export type RubroMaterialWithMaterial = RubroMaterial & {
  material: Material
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
  notes?: string
}): Promise<RubroMaterial> {
  const material = await prisma.material.findUnique({
    where: { id: params.materialId },
  })

  if (!material) {
    throw new Error('Material no encontrado')
  }

  const unitCostSnapshot = Number(material.unitCost.toString())
  const totalCost = calculateMaterialCost(params.quantity, unitCostSnapshot)

  return prisma.$transaction(async (tx) => {
    const rubroMaterial = await tx.rubroMaterial.create({
      data: {
        rubroId: params.rubroId,
        materialId: params.materialId,
        quantity: params.quantity,
        unit: material.unit,
        unitCostSnapshot,
        totalCost,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroMaterial
  })
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
