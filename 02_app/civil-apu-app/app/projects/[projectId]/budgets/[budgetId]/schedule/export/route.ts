import { notFound } from 'next/navigation'
import { getBudgetScheduleForEdit } from '@/src/lib/db/budgetSchedule'
import { getBudgetByIdForEdit } from '@/src/lib/db/budgets'
import { buildBudgetScheduleWorkbook, type BudgetScheduleExportRow } from '@/src/lib/export/budgetScheduleExcel'
import { safeExcelFileName, workbookToBuffer } from '@/src/lib/export/excel'

type BudgetScheduleExportRouteProps = {
  params: Promise<{
    projectId: string
    budgetId: string
  }>
}

function serializeRows(schedule: Awaited<ReturnType<typeof getBudgetScheduleForEdit>>): BudgetScheduleExportRow[] {
  return schedule.entries.map((entry) => ({
    budgetItemId: entry.budgetItemId,
    itemNumber: entry.budgetItem.itemNumber,
    code: entry.budgetItem.rubroCodeSnapshot,
    description: entry.budgetItem.descriptionSnapshot,
    unit: entry.budgetItem.unitSnapshot,
    quantity: entry.budgetItem.quantity.toString(),
    totalAmount: Number(entry.budgetItem.subtotalSnapshot?.toString() ?? entry.budgetItem.totalPrice?.toString() ?? '0'),
    groupName: entry.groupName || 'Grupo 1',
    startWeek: entry.startWeek,
    endWeek: entry.endWeek,
  }))
}

export async function GET(_request: Request, { params }: BudgetScheduleExportRouteProps) {
  const { projectId, budgetId } = await params
  const budget = await getBudgetByIdForEdit(budgetId)

  if (!budget || budget.projectId !== projectId) {
    notFound()
  }

  const schedule = await getBudgetScheduleForEdit(budgetId)
  const workbook = buildBudgetScheduleWorkbook({
    projectName: budget.project.name,
    budgetName: budget.name,
    budgetCode: budget.code,
    weekCount: schedule.weekCount,
    rows: serializeRows(schedule),
  })
  const buffer = await workbookToBuffer(workbook)
  const fileName = safeExcelFileName(`cronograma-valorado-${budget.code ?? budget.name}`)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
