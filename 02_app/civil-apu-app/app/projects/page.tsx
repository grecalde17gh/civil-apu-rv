import Link from 'next/link'
import { getProjects } from '@/src/lib/db/projects'
import type { Project } from '@prisma/client'

const getStatusLabel = (status: Project['status']) => {
  switch (status) {
    case 'ACTIVE':
      return 'Activo'
    case 'PAUSED':
      return 'Pausado'
    case 'CLOSED':
      return 'Cerrado'
    case 'ARCHIVED':
      return 'Archivado'
    default:
      return status
  }
}

function formatDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : '-'
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const activeCount = projects.filter((project) => project.status === 'ACTIVE').length
  const pausedCount = projects.filter((project) => project.status === 'PAUSED').length
  const closedCount = projects.filter((project) => project.status === 'CLOSED').length
  const totalBudgets = projects.reduce((sum, project) => sum + project._count.budgets, 0)

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Civil APU RV</p>
              <h1 className="text-xl font-semibold">Proyectos</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/projects/new"
                className="inline-flex h-8 items-center rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
              >
                Nuevo proyecto
              </Link>
              <Link
                href="/"
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Volver
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total proyectos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{projects.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Activos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{activeCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pausados / cerrados</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{pausedCount + closedCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Presupuestos asociados</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{totalBudgets}</p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white">Busqueda y filtros</p>
              </div>
              <div className="space-y-3 p-3">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Buscar
                  <input
                    type="search"
                    list="project-search-options"
                    placeholder="Proyecto, cliente o ubicacion"
                    className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
                  />
                  <datalist id="project-search-options">
                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={`${project.name} ${project.clientName ?? ''} ${project.location ?? ''}`}
                      />
                    ))}
                  </datalist>
                </label>

                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                  <select className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950">
                    <option>Todos</option>
                    <option>Activo</option>
                    <option>Pausado</option>
                    <option>Cerrado</option>
                    <option>Archivado</option>
                  </select>
                </label>

                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Orden
                  <select className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950">
                    <option>Ultima actualizacion</option>
                    <option>Nombre</option>
                    <option>Cliente</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white">Accesos</p>
              </div>
              <div className="grid gap-2 p-3">
                <Link
                  href="/projects/new"
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                >
                  Nuevo proyecto
                </Link>
                <Link
                  href="/rubros"
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                >
                  Rubros/APU
                </Link>
                <Link
                  href="/imports/materials"
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                >
                  Importar materiales
                </Link>
              </div>
            </section>
          </aside>

          <section className="min-w-0 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Listado tecnico de proyectos</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo / ID</th>
                    <th className="min-w-[260px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Nombre del proyecto</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cliente</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Ubicacion</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Presupuestos</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">% indirectos base</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Inicio</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Fin</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-sm text-slate-500">
                        No hay proyectos registrados.
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id} className="hover:bg-blue-50/60">
                        <td className="px-3 py-2 font-mono text-slate-700">{project.id.slice(0, 8)}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{project.name}</td>
                        <td className="px-3 py-2 text-slate-700">{project.clientName ?? '-'}</td>
                        <td className="px-3 py-2 text-slate-700">{project.location ?? '-'}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{project._count.budgets}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">
                          {project.defaultIndirectPercentage?.toString() ?? '20'}%
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatDate(project.startDate)}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatDate(project.endDate)}</td>
                        <td className="px-3 py-2 text-slate-700">{getStatusLabel(project.status)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Ver/Editar
                            </Link>
                            <Link
                              href={`/projects/${project.id}/budgets/new`}
                              className="rounded border border-blue-300 bg-blue-700 px-2 py-1 text-xs font-semibold text-white transition hover:bg-blue-800"
                            >
                              Crear presupuesto
                            </Link>
                            <Link
                              href={`/projects/${project.id}/budgets`}
                              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Presupuestos
                            </Link>
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
    </div>
  )
}
