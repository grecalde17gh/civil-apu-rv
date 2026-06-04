import { notFound } from 'next/navigation'
import { consolidateBudgetComponents } from '@/src/lib/calculations/budgetConsolidation'
import { getBudgetByIdForEdit } from '@/src/lib/db/budgets'
import { buildBudgetWorkbook } from '@/src/lib/export/budgetExcel'
import { safeExcelFileName, workbookToBuffer } from '@/src/lib/export/excel'

type BudgetExportRouteProps = {
  params: Promise<{
    projectId: string
    budgetId: string
  }>
}

export async function GET(_request: Request, { params }: BudgetExportRouteProps) {
  const { projectId, budgetId } = await params
  const budget = await getBudgetByIdForEdit(budgetId)

  if (!budget || budget.projectId !== projectId) {
    notFound()
  }

  const consolidation = consolidateBudgetComponents(budget)
  const workbook = buildBudgetWorkbook(
    {
      projectName: budget.project.name,
      budgetName: budget.name,
      budgetCode: budget.code,
      createdAt: budget.createdAt,
      indirectPercentage: budget.indirectPercentage,
      ivaPercentage: budget.ivaPercentage,
      subtotal: budget.subtotal,
      ivaAmount: budget.ivaAmount,
      total: budget.total,
      items: budget.items,
    },
    consolidation,
  )
  const buffer = await workbookToBuffer(workbook)
  const fileName = safeExcelFileName(`presupuesto-${budget.code ?? budget.name}`)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
