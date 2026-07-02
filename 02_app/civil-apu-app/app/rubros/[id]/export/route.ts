import { NextResponse } from 'next/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/src/lib/db/prisma'
import { safeExcelFileName, workbookToBuffer } from '@/src/lib/export/excel'
import { buildRubroWorkbook } from '@/src/lib/export/rubrosExcel'

type RubroExportRouteProps = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: RubroExportRouteProps) {
  const { id } = await params
  const selectedProjectId = new URL(request.url).searchParams.get('projectId')
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

  const usageContexts = await prisma.budgetItem.findMany({
    where: { rubroId: id },
    select: {
      budget: {
        select: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  const projectById = new Map(usageContexts.map((context) => [context.budget.project.id, context.budget.project]))
  const usedProjects = [...projectById.values()]
  const exportProject =
    usedProjects.length === 0
      ? null
      : selectedProjectId
        ? projectById.get(selectedProjectId)
        : usedProjects.length === 1
          ? usedProjects[0]
          : null

  if (selectedProjectId && !exportProject) {
    return NextResponse.json({ error: 'El proyecto seleccionado no usa este rubro.' }, { status: 400 })
  }

  if (usedProjects.length > 1 && !selectedProjectId) {
    return NextResponse.json({ error: 'Seleccione el proyecto para la exportacion.' }, { status: 400 })
  }

  const workbook = await buildRubroWorkbook({
    code: rubro.code,
    description: rubro.description,
    technicalSpecification: rubro.technicalSpecification,
    unit: rubro.unit,
    status: rubro.status,
    directCost: rubro.directCost,
    indirectCost: rubro.indirectCost,
    indirectPercentage: rubro.indirectPercentage,
    unitPrice: rubro.unitPrice,
    projectName: exportProject?.name ?? '',
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
