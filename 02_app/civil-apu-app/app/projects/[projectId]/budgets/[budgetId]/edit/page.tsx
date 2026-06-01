import Link from 'next/link'
import { notFound } from 'next/navigation'
import BudgetForm from '@/src/components/budgets/BudgetForm'
import { getBudgetByIdWithProject } from '@/src/lib/db/budgets'
import { updateBudgetAction, addBudgetItemAction, deleteBudgetItemAction, copyBudgetAction } from '../../actions'
import BudgetItemForm from '@/src/components/budgets/BudgetItemForm'
import BudgetItemsTable from '@/src/components/budgets/BudgetItemsTable'
import { getRubros } from '@/src/lib/db/rubros'

type EditBudgetPageProps = {
  params: Promise<{
    projectId: string
    budgetId: string
  }>
}

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { projectId, budgetId } = await params
  const budget = await getBudgetByIdWithProject(budgetId)

  const rubros = await getRubros()

  if (!budget || budget.projectId !== projectId) {
    notFound()
  }

  const initialData = {
    code: budget.code ?? undefined,
    name: budget.name,
    status: budget.status,
    indirectPercentage: Number(budget.indirectPercentage?.toString() ?? budget.project.defaultIndirectPercentage?.toString() ?? '20'),
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
          <div className="flex flex-wrap gap-3">
            <form action={copyBudgetAction}>
              <input type="hidden" name="budgetId" value={budgetId} />
              <input type="hidden" name="projectId" value={projectId} />
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Crear copia
              </button>
            </form>
            <Link
              href={`/projects/${projectId}/budgets`}
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Volver a presupuestos
            </Link>
          </div>
        </div>

        <BudgetForm
          action={updateBudgetAction}
          submitLabel="Guardar presupuesto"
          initialData={initialData}
          hiddenId={budgetId}
          hiddenProjectId={projectId}
        />
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-500">Subtotal</p>
              <p className="text-lg font-medium text-zinc-900">{budget.subtotal?.toString() ?? '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">IVA ({budget.ivaPercentage?.toString() ?? '0'}%)</p>
              <p className="text-lg font-medium text-zinc-900">{budget.ivaAmount?.toString() ?? '0.00'}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-zinc-500">Total (neto sin IVA)</p>
            <p className="text-2xl font-semibold text-zinc-900">{budget.total?.toString() ?? budget.subtotal?.toString() ?? '0.00'}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Agregar rubro al presupuesto</h2>
              <Link
                href={`/rubros/new?budgetId=${budgetId}&projectId=${projectId}`}
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                Crear rubro nuevo
              </Link>
            </div>
            <BudgetItemForm action={addBudgetItemAction} budgetId={budgetId} projectId={projectId} rubros={rubros} />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Ítems del presupuesto</h2>
            <div className="rounded-2xl border border-zinc-200 bg-white">
              <BudgetItemsTable items={budget.items} budgetId={budgetId} projectId={projectId} deleteAction={deleteBudgetItemAction} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
