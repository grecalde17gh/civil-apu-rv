import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProjectById } from '@/src/lib/db/projects'
import { getBudgetsByProjectId } from '@/src/lib/db/budgets'

type BudgetListPageProps = {
  params: Promise<{
    projectId: string
  }>
}

const getBudgetStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Borrador'
    case 'REVIEWED':
      return 'Revisado'
    case 'ISSUED':
      return 'Emitido'
    case 'ARCHIVED':
      return 'Archivado'
    default:
      return status
  }
}

export default async function BudgetListPage({ params }: BudgetListPageProps) {
  const { projectId } = await params
  const project = await getProjectById(projectId)

  if (!project) {
    notFound()
  }

  const budgets = await getBudgetsByProjectId(projectId)

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Presupuestos</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Presupuestos del proyecto</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Proyecto: {project.name} · Cliente: {project.clientName ?? 'Sin cliente'} · Ubicación: {project.location ?? 'Sin ubicación'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/projects/${projectId}/budgets/new`}
              className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Nuevo presupuesto
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Volver a proyectos
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Nombre</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">IVA (%)</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Emitido</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Creado</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {budgets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-500">
                    No hay presupuestos creados para este proyecto.
                  </td>
                </tr>
              ) : (
                budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-4 text-sm text-zinc-700">{budget.code ?? '-'}</td>
                    <td className="px-4 py-4 text-sm text-zinc-700">{budget.name}</td>
                    <td className="px-4 py-4 text-sm text-zinc-700">{getBudgetStatusLabel(budget.status)}</td>
                    <td className="px-4 py-4 text-sm text-zinc-700">{budget.ivaPercentage?.toString() ?? '0'}%</td>
                    <td className="px-4 py-4 text-sm text-zinc-700">{budget.issuedAt?.toISOString().slice(0, 10) ?? '-'}</td>
                    <td className="px-4 py-4 text-sm text-zinc-700">{budget.createdAt.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-4 text-sm text-zinc-700">
                      <Link
                        href={`/projects/${projectId}/budgets/${budget.id}/edit`}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
