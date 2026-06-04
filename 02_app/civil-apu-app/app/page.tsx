import Link from 'next/link'
import { getDashboardSummary } from '@/src/lib/db/dashboard'

const toolbarLinks = [
  { label: 'Proyectos', href: '/projects' },
  { label: 'Presupuestos', href: '/projects' },
  { label: 'Rubros/APU', href: '/rubros' },
  { label: 'Materiales', href: '/materials' },
  { label: 'Mano de obra', href: '/labor' },
  { label: 'Equipos', href: '/equipment' },
  { label: 'Importar', href: '/imports/materials' },
]

const quickActions = [
  { label: 'Nuevo proyecto', href: '/projects/new' },
  { label: 'Nuevo rubro', href: '/rubros/new' },
  { label: 'Importar materiales', href: '/imports/materials' },
]

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default async function Home() {
  const { counts, recentProjects, recentBudgets } = await getDashboardSummary()

  const summaryRows = [
    { label: 'Total materiales', value: counts.materials },
    { label: 'Total mano de obra', value: counts.labor },
    { label: 'Total equipos', value: counts.equipment },
    { label: 'Total rubros', value: counts.rubros },
    { label: 'Total proyectos', value: counts.projects },
    { label: 'Total presupuestos', value: counts.budgets },
  ]

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Sistema tecnico de presupuestos</p>
              <h1 className="text-xl font-semibold">Civil APU RV</h1>
            </div>

            <nav className="flex flex-wrap gap-2">
              {toolbarLinks.map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-blue-300 hover:bg-blue-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Modulo activo</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">Panel operativo</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Presupuestos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{counts.budgets}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rubros/APU</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{counts.rubros}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Catalogos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">
                {counts.materials + counts.labor + counts.equipment}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <aside className="space-y-4">
            <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white">Accesos rapidos</p>
              </div>
              <div className="grid gap-2 p-3">
                {quickActions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white">Proyectos recientes</p>
              </div>
              <div className="divide-y divide-slate-200">
                {recentProjects.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-slate-500">No hay proyectos registrados.</p>
                ) : (
                  recentProjects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}/budgets`}
                      className="block px-3 py-2 text-sm transition hover:bg-blue-50"
                    >
                      <span className="block font-semibold text-slate-900">{project.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {project.clientName ?? 'Sin cliente'} · {project._count.budgets} presupuestos
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </aside>

          <section className="min-w-0 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-300 bg-slate-800 px-3 py-2 text-white sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide">Proyectos y presupuestos recientes</p>
              <Link
                href="/projects"
                className="inline-flex h-7 items-center rounded border border-slate-500 bg-slate-700 px-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-blue-700"
              >
                Ver proyectos
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Proyecto</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cliente</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Presupuestos</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Ultima actualizacion</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
                        No hay proyectos registrados.
                      </td>
                    </tr>
                  ) : (
                    recentProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-blue-50/60">
                        <td className="px-3 py-2 font-semibold text-slate-900">{project.name}</td>
                        <td className="px-3 py-2 text-slate-700">{project.clientName ?? 'Sin cliente'}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{project._count.budgets}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatDate(project.updatedAt)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/projects/${project.id}/budgets`}
                              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Presupuestos
                            </Link>
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Editar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-300 bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Presupuestos recientes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Presupuesto</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Proyecto</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Rubros</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentBudgets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                        No hay presupuestos registrados.
                      </td>
                    </tr>
                  ) : (
                    recentBudgets.map((budget) => (
                      <tr key={budget.id} className="hover:bg-blue-50/60">
                        <td className="px-3 py-2 font-semibold text-slate-900">
                          {budget.code ? `${budget.code} - ` : null}
                          {budget.name}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{budget.project.name}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{budget._count.items}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">
                          {budget.total?.toString() ?? budget.subtotal?.toString() ?? '0.00'}
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/projects/${budget.projectId}/budgets/${budget.id}/edit`}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="sticky top-4 self-start overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Resumen del sistema</p>
            </div>
            <div className="divide-y divide-slate-200 text-sm">
              {summaryRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-950">{row.value}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
