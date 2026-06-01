import { prisma } from './prisma'
import type { Prisma, Rubro } from '@prisma/client'
import type { RubroFormInput } from '@/src/lib/validations/rubro'
import { calculateDirectCost, calculateIndirectCost, calculateUnitPrice } from '@/src/lib/calculations/apu'
import { buildCopyName, generateCopyCode } from './copy'

export async function getRubros(): Promise<Rubro[]> {
  return prisma.rubro.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getRubroById(id: string): Promise<Rubro | null> {
  return prisma.rubro.findUnique({
    where: { id },
  })
}

export async function createRubro(data: RubroFormInput): Promise<Rubro> {
  return prisma.rubro.create({
    data: {
      code: data.code,
      description: data.description,
      unit: data.unit,
      category: data.category ?? undefined,
      performanceValue: data.performanceValue ?? undefined,
      performanceUnit: data.performanceUnit ?? undefined,
      indirectPercentage: data.indirectPercentage,
      notes: data.notes ?? undefined,
      status: data.status,
      calculationStatus: data.calculationStatus,
    },
  })
}

export async function updateRubro(id: string, data: RubroFormInput): Promise<Rubro> {
  await prisma.rubro.update({
    where: { id },
    data: {
      code: data.code,
      description: data.description,
      unit: data.unit,
      category: data.category ?? undefined,
      performanceValue: data.performanceValue ?? undefined,
      performanceUnit: data.performanceUnit ?? undefined,
      indirectPercentage: data.indirectPercentage,
      notes: data.notes ?? undefined,
      status: data.status,
      calculationStatus: data.calculationStatus,
    },
  })

  await updateRubroTotals(id)

  const updated = await getRubroById(id)
  if (!updated) {
    throw new Error('Rubro no encontrado')
  }

  return updated
}

export async function copyRubro(id: string): Promise<Rubro> {
  const rubro = await prisma.rubro.findUnique({
    where: { id },
    include: {
      materials: true,
      labor: true,
      equipment: true,
      transport: true,
    },
  })

  if (!rubro) {
    throw new Error('Rubro no encontrado')
  }

  const code = await generateCopyCode(rubro.code, async (candidate) => {
    const existing = await prisma.rubro.findUnique({ where: { code: candidate }, select: { id: true } })
    return existing !== null
  })

  if (!code) {
    throw new Error('No se pudo generar codigo para la copia del rubro')
  }

  return prisma.$transaction(async (tx) => {
    const copied = await tx.rubro.create({
      data: {
        code,
        description: buildCopyName(rubro.description),
        unit: rubro.unit,
        category: rubro.category,
        performanceValue: rubro.performanceValue,
        performanceUnit: rubro.performanceUnit,
        indirectPercentage: rubro.indirectPercentage,
        directCost: rubro.directCost,
        indirectCost: rubro.indirectCost,
        unitPrice: rubro.unitPrice,
        status: 'DRAFT',
        calculationStatus: rubro.calculationStatus,
        notes: rubro.notes,
        sourceExcelSheet: rubro.sourceExcelSheet,
        materials: {
          create: rubro.materials.map((line) => ({
            materialId: line.materialId,
            quantity: line.quantity,
            unit: line.unit,
            unitCostSnapshot: line.unitCostSnapshot,
            totalCost: line.totalCost,
            notes: line.notes,
          })),
        },
        labor: {
          create: rubro.labor.map((line) => ({
            laborItemId: line.laborItemId,
            workerQuantity: line.workerQuantity,
            hourlyCostSnapshot: line.hourlyCostSnapshot,
            timeRequired: line.timeRequired,
            performanceValue: line.performanceValue,
            performanceMode: line.performanceMode,
            totalCost: line.totalCost,
            notes: line.notes,
          })),
        },
        equipment: {
          create: rubro.equipment.map((line) => ({
            equipmentItemId: line.equipmentItemId,
            equipmentQuantity: line.equipmentQuantity,
            rateType: line.rateType,
            rateSnapshot: line.rateSnapshot,
            timeRequired: line.timeRequired,
            performanceValue: line.performanceValue,
            performanceMode: line.performanceMode,
            totalCost: line.totalCost,
            notes: line.notes,
          })),
        },
        transport: {
          create: rubro.transport.map((line) => ({
            description: line.description,
            unit: line.unit,
            quantity: line.quantity,
            unitCost: line.unitCost,
            totalCost: line.totalCost,
            notes: line.notes,
          })),
        },
      },
    })

    await updateRubroTotals(copied.id, tx)

    const updated = await tx.rubro.findUnique({ where: { id: copied.id } })
    if (!updated) {
      throw new Error('No se pudo recuperar la copia del rubro')
    }

    return updated
  })
}

export async function getRubroUsageContexts(rubroId: string) {
  return prisma.budgetItem.findMany({
    where: { rubroId },
    include: {
      budget: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateRubroTotals(rubroId: string, tx: Prisma.TransactionClient = prisma): Promise<void> {
  const materialsAggregate = await tx.rubroMaterial.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const laborAggregate = await tx.rubroLabor.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const equipmentAggregate = await tx.rubroEquipment.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const transportAggregate = await tx.rubroTransport.aggregate({
    where: { rubroId },
    _sum: {
      totalCost: true,
    },
  })

  const materialsSubtotal = Number(materialsAggregate._sum.totalCost?.toString() ?? '0')
  const laborSubtotal = Number(laborAggregate._sum.totalCost?.toString() ?? '0')
  const equipmentSubtotal = Number(equipmentAggregate._sum.totalCost?.toString() ?? '0')
  const transportSubtotal = Number(transportAggregate._sum.totalCost?.toString() ?? '0')

  const rubro = await tx.rubro.findUnique({
    where: { id: rubroId },
    select: { indirectPercentage: true },
  })

  if (!rubro) {
    throw new Error('Rubro no encontrado')
  }

  const directCost = calculateDirectCost({
    materialsSubtotal,
    laborSubtotal,
    equipmentSubtotal,
    transportSubtotal,
  })

  const indirectCost = calculateIndirectCost(directCost, Number(rubro.indirectPercentage.toString()))
  const unitPrice = calculateUnitPrice(directCost, Number(rubro.indirectPercentage.toString()))

  await tx.rubro.update({
    where: { id: rubroId },
    data: {
      directCost,
      indirectCost,
      unitPrice,
    },
  })
}
