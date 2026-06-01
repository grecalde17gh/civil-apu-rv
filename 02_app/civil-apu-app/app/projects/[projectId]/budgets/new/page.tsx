import Link from 'next/link'
import { notFound } from 'next/navigation'
import BudgetForm from '@/src/components/budgets/BudgetForm'
import { getProjectById } from '@/src/lib/db/projects'
import { createBudgetAction } from '../actions'

type NewBudgetPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function NewBudgetPage({ params }: NewBudgetPageProps) {
  const { projectId } = await params
  const project = await getProjectById(projectId)

  if (!project) {
    notFound()
  }

  const initialData = {
    status: 'DRAFT' as const,
    indirectPercentage: Number(project.defaultIndirectPercentage?.toString() ?? '20'),
    ivaPercentage: Number(project.defaultIvaPercentage?.toString() ?? '0'),
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Nuevo presupuesto</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Crear presupuesto para {project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Cliente: {project.clientName ?? 'Sin cliente'} · Ubicación: {project.location ?? 'Sin ubicación'}
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
          action={createBudgetAction}
          submitLabel="Crear presupuesto"
          initialData={initialData}
          hiddenProjectId={projectId}
        />
      </div>
    </div>
  )
}
