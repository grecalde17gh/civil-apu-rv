import { notFound } from 'next/navigation'
import { calculateAPU } from '@/src/lib/calculations/apu'
import { prisma } from '@/src/lib/db/prisma'
import { safeExcelFileName, workbookToBuffer } from '@/src/lib/export/excel'
import { buildRubroWorkbook } from '@/src/lib/export/rubrosExcel'

type RubroExportRouteProps = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, { params }: RubroExportRouteProps) {
  const { id } = await params
  const rubro = await prisma.rubro.findUnique({
    where: { id },
    include: {
      materials: { include: { material: true } },
      labor: { include: { laborItem: true } },
      equipment: { include: { equipmentItem: true } },
      transport: true,
    },
  })

  if (!rubro) {
    notFound()
  }

  const totals = calculateAPU({
    materials: rubro.materials.map((line) => Number(line.totalCost.toString())),
    labor: rubro.labor.map((line) => Number(line.totalCost.toString())),
    equipment: rubro.equipment.map((line) => Number(line.totalCost.toString())),
    transport: rubro.transport.map((line) => Number(line.totalCost.toString())),
    indirectPercentage: Number(rubro.indirectPercentage.toString()),
  })

  const workbook = buildRubroWorkbook({
    code: rubro.code,
    description: rubro.description,
    unit: rubro.unit,
    status: rubro.status,
    directCost: rubro.directCost,
    indirectPercentage: rubro.indirectPercentage,
    unitPrice: rubro.unitPrice,
    performanceValue: rubro.performanceValue,
    performanceUnit: rubro.performanceUnit,
    totals,
    materials: rubro.materials.map((line) => ({
      code: line.material.code ?? '-',
      description: line.material.description,
      unit: line.unit ?? line.material.unit,
      quantity: line.quantity,
      unitCost: line.unitCostSnapshot,
      totalCost: line.totalCost,
      notes: line.notes ?? '',
    })),
    labor: rubro.labor.map((line) => ({
      code: line.laborItem.code ?? '-',
      description: line.laborItem.roleName,
      unit: 'hora',
      quantity: line.workerQuantity,
      unitCost: line.hourlyCostSnapshot,
      totalCost: line.totalCost,
      notes: line.notes ?? '',
    })),
    equipment: rubro.equipment.map((line) => ({
      code: line.equipmentItem.code ?? '-',
      description: line.equipmentItem.description,
      unit: 'hora',
      quantity: line.equipmentQuantity,
      unitCost: line.rateSnapshot,
      totalCost: line.totalCost,
      notes: line.notes ?? '',
    })),
    transport: rubro.transport.map((line) => ({
      code: line.code ?? '-',
      description: line.description,
      unit: line.unit ?? '-',
      quantity: line.quantity,
      unitCost: line.unitCost,
      totalCost: line.totalCost,
      notes: line.notes ?? '',
    })),
  })
  const buffer = await workbookToBuffer(workbook)
  const fileName = safeExcelFileName(`rubro-${rubro.code}`)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
