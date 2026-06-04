import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProjectById } from '@/src/lib/db/projects'
import { getBudgetsByProjectId } from '@/src/lib/db/budgets'
import { copyBudgetAction } from './actions'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'

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
  const issuedCount = budgets.filter((budget) => budget.status === 'ISSUED').length
  const draftCount = budgets.filter((budget) => budget.status === 'DRAFT').length

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Presupuestos</p>
              <h1 className="truncate text-xl font-semibold">{project.name}</h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-200">
                <span>Cliente: {project.clientName ?? 'Sin cliente'}</span>
                <span>Ubicacion: {project.location ?? 'Sin ubicacion'}</span>
                <span>Indirectos base: {project.defaultIndirectPercentage?.toString() ?? '20'}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/projects/${projectId}/budgets/new`}
                className="inline-flex h-8 items-center rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
              >
                Nuevo presupuesto
              </Link>
              <Link
                href="/projects"
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Volver
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total presupuestos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{budgets.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Borradores</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{draftCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Emitidos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{issuedCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Proyecto</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-950">{project.name}</p>
            </div>
          </div>
        </header>

        <section className="mt-4 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white">Listado tecnico de presupuestos</p>
            <ExportVisibleTableButton tableId="budgets-table" fileName={`presupuestos-${project.name}`} />
          </div>

          <div className="overflow-x-auto">
            <table id="budgets-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                  <th className="min-w-[260px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Nombre</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">IVA</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Emitido</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Creado</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {budgets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">
                      No hay presupuestos creados para este proyecto.
                    </td>
                  </tr>
                ) : (
                  budgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-blue-50/60">
                      <td className="px-3 py-2 font-mono text-slate-700">{budget.code ?? '-'}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{budget.name}</td>
                      <td className="px-3 py-2 text-slate-700">{getBudgetStatusLabel(budget.status)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{budget.ivaPercentage?.toString() ?? '0'}%</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{budget.issuedAt?.toISOString().slice(0, 10) ?? '-'}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{budget.createdAt.toISOString().slice(0, 10)}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/projects/${projectId}/budgets/${budget.id}/edit`}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Editar
                          </Link>
                          <form action={copyBudgetAction} className="inline">
                            <input type="hidden" name="budgetId" value={budget.id} />
                            <input type="hidden" name="projectId" value={projectId} />
                            <button
                              type="submit"
                              className="rounded border border-blue-300 bg-blue-700 px-2 py-1 text-xs font-semibold text-white transition hover:bg-blue-800"
                            >
                              Crear copia
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
