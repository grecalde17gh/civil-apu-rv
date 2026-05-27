import Link from 'next/link'
import { notFound } from 'next/navigation'
import BudgetForm from '@/src/components/budgets/BudgetForm'
import { getBudgetByIdWithProject } from '@/src/lib/db/budgets'
import { updateBudgetAction } from '../../actions'

type EditBudgetPageProps = {
  params: Promise<{
    projectId: string
    budgetId: string
  }>
}

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { projectId, budgetId } = await params
  const budget = await getBudgetByIdWithProject(budgetId)

  if (!budget || budget.projectId !== projectId) {
    notFound()
  }

  const initialData = {
    code: budget.code ?? undefined,
    name: budget.name,
    status: budget.status,
    ivaPercentage: Number(budget.ivaPercentage?.toString() ?? '0'),
    notes: budget.notes ?? undefined,
    issuedAt: budget.issuedAt ?? undefined,
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Editar presupuesto</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Presupuesto: {budget.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Proyecto: {budget.project.name} · Cliente: {budget.clientNameSnapshot ?? budget.project.clientName ?? 'Sin cliente'} · Ubicación: {budget.locationSnapshot ?? budget.project.location ?? 'Sin ubicación'}
            </p>
          </div>
          <Link
            href={`/projects/${projectId}/budgets`}
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a presupuestos
          </Link>
        </div>

        <BudgetForm
          action={updateBudgetAction}
          submitLabel="Guardar presupuesto"
          initialData={initialData}
          hiddenId={budgetId}
          hiddenProjectId={projectId}
        />
      </div>
    </div>
  )
}
