import { prisma } from '@/src/lib/db/prisma'
import { safeExcelFileName, workbookToBuffer } from '@/src/lib/export/excel'
import { buildRubrosApuWorkbook } from '@/src/lib/export/rubrosExcel'

export async function GET() {
  const rubros = await prisma.rubro.findMany({
    include: {
      materials: { include: { material: true } },
      labor: { include: { laborItem: true } },
      equipment: { include: { equipmentItem: true } },
      transport: true,
    },
    orderBy: { code: 'asc' },
  })
  const workbook = await buildRubrosApuWorkbook(
    rubros.map((rubro) => ({
      code: rubro.code,
      description: rubro.description,
      technicalSpecification: rubro.technicalSpecification,
      unit: rubro.unit,
      status: rubro.status,
      directCost: rubro.directCost,
      indirectCost: rubro.indirectCost,
      indirectPercentage: rubro.indirectPercentage,
      unitPrice: rubro.unitPrice,
      projectName: '',
      performanceValue: rubro.performanceValue,
      performanceUnit: rubro.performanceUnit,
      materials: rubro.materials.map((line) => ({
        code: line.material.code ?? '-',
        description: line.material.description,
        unit: line.unit ?? line.material.unit,
        quantity: line.quantity,
        performance: '',
        unitCost: line.unitCostSnapshot,
        totalCost: line.totalCost,
        cpc: line.material.cpc ?? '-',
        vae: line.material.vae,
        notes: line.notes ?? '',
      })),
      labor: rubro.labor.map((line) => ({
        code: line.laborItem.code ?? '-',
        description: line.laborItem.roleName,
        unit: 'hora',
        quantity: line.workerQuantity,
        performance: line.timeRequired,
        unitCost: line.hourlyCostSnapshot,
        totalCost: line.totalCost,
        cpc: line.laborItem.cpc ?? '-',
        vae: line.laborItem.vae,
        notes: line.notes ?? '',
      })),
      equipment: rubro.equipment.map((line) => ({
        code: line.equipmentItem.code ?? '-',
        description: line.equipmentItem.description,
        unit: 'hora',
        quantity: line.equipmentQuantity,
        performance: line.timeRequired,
        unitCost: line.rateSnapshot,
        totalCost: line.totalCost,
        cpc: line.equipmentItem.cpc ?? '-',
        vae: line.equipmentItem.vae,
        notes: line.notes ?? '',
      })),
      transport: rubro.transport.map((line) => ({
        code: line.code ?? '-',
        description: line.description,
        unit: line.unit ?? '-',
        quantity: line.quantity,
        performance: '',
        unitCost: line.unitCost,
        totalCost: line.totalCost,
        cpc: '-',
        vae: '',
        notes: line.notes ?? '',
      })),
    })),
  )
  const buffer = await workbookToBuffer(workbook)
  const fileName = safeExcelFileName('rubros-apu')

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
