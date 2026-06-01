import Link from 'next/link'
import RubroForm from '@/src/components/rubros/RubroForm'
import { createRubroAction } from '../actions'
import { getBudgetByIdWithProject } from '@/src/lib/db/budgets'

type NewRubroPageProps = {
  searchParams?: Promise<{
    budgetId?: string
    projectId?: string
  }>
}

export default async function NewRubroPage({ searchParams }: NewRubroPageProps) {
  const { budgetId, projectId } = (await searchParams) ?? {}
  const budget = budgetId ? await getBudgetByIdWithProject(budgetId) : null
  const validBudgetContext = budget && (!projectId || budget.projectId === projectId) ? budget : null
  const backHref = validBudgetContext ? `/projects/${validBudgetContext.projectId}/budgets/${validBudgetContext.id}/edit` : '/rubros'
  const initialData = validBudgetContext
    ? {
        indirectPercentage: Number(
          validBudgetContext.indirectPercentage?.toString() ??
            validBudgetContext.project.defaultIndirectPercentage?.toString() ??
            '0',
        ),
      }
    : undefined

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Rubro nuevo</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Crear rubro</h1>
          </div>
          <Link
            href={backHref}
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            {validBudgetContext ? 'Volver al presupuesto' : 'Volver a lista'}
          </Link>
        </div>

        {validBudgetContext ? (
          <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
            <p className="font-semibold text-zinc-900">Contexto del presupuesto</p>
            <p className="mt-1">
              Proyecto: {validBudgetContext.project.name} · Presupuesto: {validBudgetContext.name}
            </p>
          </div>
        ) : null}

        <RubroForm
          action={createRubroAction}
          submitLabel="Crear rubro"
          initialData={initialData}
          hiddenBudgetId={validBudgetContext?.id}
          hiddenProjectId={validBudgetContext?.projectId}
        />
      </div>
    </div>
  )
}
