import Link from 'next/link'
import { getRubros } from '@/src/lib/db/rubros'
import type { Rubro } from '@prisma/client'
import { copyRubroAction } from './actions'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'

const getStatusLabel = (status: Rubro['status']) => {
  switch (status) {
    case 'DRAFT':
      return 'Borrador'
    case 'VALIDATED':
      return 'Validado'
    case 'ARCHIVED':
      return 'Archivado'
    default:
      return status
  }
}

const getCalculationStatusLabel = (status: Rubro['calculationStatus']) => {
  switch (status) {
    case 'PENDING':
      return 'Pendiente'
    case 'CALCULATED':
      return 'Calculado'
    case 'WITH_OBSERVATIONS':
      return 'Con observaciones'
    case 'ERROR':
      return 'Error'
    default:
      return status
  }
}

const getMoneyValue = (value: Rubro['directCost']) => value?.toString() ?? '-'

export default async function RubrosPage() {
  const rubros = await getRubros()
  const units = [...new Set(rubros.map((rubro) => rubro.unit).filter(Boolean))].sort()
  const calculatedCount = rubros.filter((rubro) => rubro.calculationStatus === 'CALCULATED').length
  const validatedCount = rubros.filter((rubro) => rubro.status === 'VALIDATED').length
  const withDirectCostCount = rubros.filter((rubro) => rubro.directCost !== null).length

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Catalogo tecnico</p>
              <h1 className="text-xl font-semibold">Rubros/APU</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/rubros/new"
                className="inline-flex h-8 items-center rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
              >
                Nuevo rubro
              </Link>
              <Link
                href="/rubros/export"
                className="inline-flex h-8 items-center rounded border border-emerald-300 bg-emerald-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-800"
              >
                Exportar rubros
              </Link>
              <Link
                href="/imports/materials"
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Importar
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
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total rubros</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{rubros.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Con costo directo</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{withDirectCostCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Calculados</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{calculatedCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Validados</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{validatedCount}</p>
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
                    list="rubro-search-options"
                    placeholder="Codigo o descripcion"
                    className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
                  />
                  <datalist id="rubro-search-options">
                    {rubros.map((rubro) => (
                      <option key={rubro.id} value={`${rubro.code} - ${rubro.description}`} />
                    ))}
                  </datalist>
                </label>

                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Unidad
                  <select className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950">
                    <option>Todas</option>
                    {units.map((unit) => (
                      <option key={unit}>{unit}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                  <select className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950">
                    <option>Todos</option>
                    <option>Borrador</option>
                    <option>Validado</option>
                    <option>Archivado</option>
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
                  href="/rubros/new"
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                >
                  Nuevo rubro
                </Link>
                <Link
                  href="/projects"
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                >
                  Proyectos
                </Link>
                <Link
                  href="/materials"
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                >
                  Materiales
                </Link>
              </div>
            </section>
          </aside>

          <section className="min-w-0 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Catalogo compacto de APUs</p>
              <ExportVisibleTableButton tableId="rubros-table" fileName="rubros-apu-visible" />
            </div>

            <div className="overflow-x-auto">
              <table id="rubros-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                    <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura ocupacional</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">VAE</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">CPC</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo directo</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Indirectos ref.</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio unitario</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Calculo</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rubros.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-3 py-10 text-center text-sm text-slate-500">
                        No hay rubros registrados.
                      </td>
                    </tr>
                  ) : (
                    rubros.map((rubro) => (
                      <tr key={rubro.id} className="hover:bg-blue-50/60">
                        <td className="px-3 py-2 font-mono font-semibold text-slate-800">{rubro.code}</td>
                        <td className="px-3 py-2 text-slate-800">{rubro.description}</td>
                        <td className="px-3 py-2 text-slate-700">{rubro.unit}</td>
                        <td className="px-3 py-2 text-slate-700">Pendiente</td>
                        <td className="px-3 py-2 text-slate-700"></td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{getMoneyValue(rubro.directCost)}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">
                          {rubro.indirectPercentage.toString()}%
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">
                          {getMoneyValue(rubro.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{getStatusLabel(rubro.status)}</td>
                        <td className="px-3 py-2 text-slate-700">{getCalculationStatusLabel(rubro.calculationStatus)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/rubros/${rubro.id}/edit`}
                              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Editar
                            </Link>
                            <form action={copyRubroAction} className="inline">
                              <input type="hidden" name="id" value={rubro.id} />
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
    </div>
  )
}
