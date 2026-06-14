import Link from 'next/link'
import { getLaborItems } from '@/src/lib/db/labor'
import { copyLaborAction, toggleLaborActiveAction } from './actions'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'
import { filterLabor, type CatalogFilterParams } from '@/src/lib/catalogFilters'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

export default async function LaborPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const filters: CatalogFilterParams = {
    q: getParam(params, 'q') ?? '',
    category: 'all',
    status: getParam(params, 'status') ?? 'all',
    minCost: getParam(params, 'minCost') ?? '',
    maxCost: getParam(params, 'maxCost') ?? '',
  }
  const items = await getLaborItems()
  const filteredItems = filterLabor(items, filters)
  const denominationCount = items.filter((item) => item.denominationId).length
  const activeCount = items.filter((item) => item.isActive).length
  const withDailyCostCount = items.filter((item) => item.dailyCost !== null).length

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Catalogo tecnico</p>
              <h1 className="text-xl font-semibold">Mano de obra</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/labor/new" className="inline-flex h-8 items-center rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                Nuevo
              </Link>
              <Link href="/labor/import" className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700">
                Importar mano de obra
              </Link>
              <Link href="/" className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700">
                Volver
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total cargos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{items.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Activos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{activeCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Con jornal</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{withDailyCostCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Con denominacion IPCO</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{denominationCount}</p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Busqueda y filtros</p>
            </div>
            <form action="/labor" className="space-y-3 p-3">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Buscar
                <input name="q" defaultValue={filters.q} type="search" list="labor-search-options" placeholder="Codigo, rol, CPC o VAE" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
                <datalist id="labor-search-options">
                  {items.map((item) => (
                    <option key={item.id} value={`${item.code ?? ''} - ${item.roleName}`} />
                  ))}
                </datalist>
              </label>

              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Estado
                <select name="status" defaultValue={filters.status} className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm">
                  <option value="all">Todos</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Costo min.
                  <input name="minCost" defaultValue={filters.minCost} inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
                </label>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Costo max.
                  <input name="maxCost" defaultValue={filters.maxCost} inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="submit" className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                  Aplicar filtros
                </button>
                <Link href="/labor" className="inline-flex h-8 items-center justify-center rounded border border-slate-300 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-slate-800 transition hover:bg-slate-100">
                  Limpiar filtros
                </Link>
              </div>
            </form>
          </aside>

          <section className="min-w-0 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Tabla de mano de obra</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-white">Exportar mano de obra</span>
                <ExportVisibleTableButton tableId="labor-table" fileName="mano-de-obra" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table id="labor-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                    <th className="min-w-[260px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura organizacional</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">VAE</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">CPC</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominación IPCO</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-10 text-center text-sm text-slate-500">
                        {items.length === 0 ? 'No hay mano de obra registrada.' : 'No se encontraron registros con los filtros aplicados.'}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/60">
                        <td className="px-3 py-2 font-mono text-slate-700">{item.code || '-'}</td>
                        <td className="px-3 py-2 text-slate-800">{item.roleName}</td>
                        <td className="px-3 py-2 text-slate-700">hora</td>
                        <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{item.hourlyCost.toString()}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{item.vae?.toString() ?? ''}</td>
                        <td className="px-3 py-2 text-slate-700">{item.cpc ?? ''}</td>
                        <td className="px-3 py-2 text-slate-700">{item.denomination ? [item.denomination.code, item.denomination.name].filter(Boolean).join(' - ') : '-'}</td>
                        <td className="px-3 py-2 text-slate-700">{item.isActive ? 'Activo' : 'Inactivo'}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/labor/${item.id}/edit`} className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">Editar</Link>
                            <form action={copyLaborAction} className="inline">
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="rounded border border-blue-300 bg-blue-700 px-2 py-1 text-xs font-semibold text-white transition hover:bg-blue-800">Crear copia</button>
                            </form>
                            <form action={toggleLaborActiveAction} className="inline">
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="isActive" value={item.isActive ? 'false' : 'true'} />
                              <button type="submit" className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                                {item.isActive ? 'Desactivar' : 'Activar'}
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
