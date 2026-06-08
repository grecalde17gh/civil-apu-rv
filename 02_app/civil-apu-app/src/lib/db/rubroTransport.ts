import { prisma } from './prisma'
import type { RubroTransport } from '@prisma/client'
import { calculateTransportCost } from '@/src/lib/calculations/transport'
import { generateNextCatalogCode } from '../catalogCodes'
import { updateRubroTotals } from './rubros'

export async function getRubroTransport(rubroId: string): Promise<RubroTransport[]> {
  return prisma.rubroTransport.findMany({
    where: { rubroId },
    include: { denomination: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function addRubroTransport(params: {
  rubroId: string
  code?: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  denominationId?: string
  notes?: string
}): Promise<RubroTransport> {
  const unitCostSnapshot = params.unitCost
  const totalCost = calculateTransportCost(params.quantity, unitCostSnapshot)
  const code = params.code || (await generateNextTransportCode())

  return prisma.$transaction(async (tx) => {
    const rubroTransport = await tx.rubroTransport.create({
      data: {
        rubroId: params.rubroId,
        code,
        description: params.description,
        unit: params.unit,
        quantity: params.quantity,
        unitCost: unitCostSnapshot,
        totalCost,
        denominationId: params.denominationId || undefined,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroTransport
  })
}

export async function updateRubroTransport(params: {
  id: string
  rubroId: string
  code?: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  denominationId?: string
  notes?: string
}): Promise<RubroTransport> {
  const totalCost = calculateTransportCost(params.quantity, params.unitCost)

  return prisma.$transaction(async (tx) => {
    const rubroTransport = await tx.rubroTransport.update({
      where: { id: params.id },
      data: {
        code: params.code || (await generateNextTransportCode()),
        description: params.description,
        unit: params.unit,
        quantity: params.quantity,
        unitCost: params.unitCost,
        totalCost,
        denominationId: params.denominationId || null,
        notes: params.notes?.trim() || undefined,
      },
    })

    await updateRubroTotals(params.rubroId, tx)

    return rubroTransport
  })
}

async function generateNextTransportCode(): Promise<string> {
  const transport = await prisma.rubroTransport.findMany({ select: { code: true } })
  return generateNextCatalogCode(transport.map((item) => item.code), 'TR')
}

export async function deleteRubroTransport(id: string): Promise<void> {
  const existing = await prisma.rubroTransport.findUnique({
    where: { id },
    select: { rubroId: true },
  })

  if (!existing) {
    throw new Error('Línea de transporte no encontrada')
  }

  await prisma.$transaction(async (tx) => {
    await tx.rubroTransport.delete({
      where: { id },
    })

    await updateRubroTotals(existing.rubroId, tx)
  })
}
