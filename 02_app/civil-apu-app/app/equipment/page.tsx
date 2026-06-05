import Link from 'next/link'
import { getEquipmentItems } from '@/src/lib/db/equipment'
import { copyEquipmentAction, toggleEquipmentActiveAction } from './actions'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'
import { filterEquipment, type CatalogFilterParams } from '@/src/lib/catalogFilters'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

export default async function EquipmentPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const filters: CatalogFilterParams = {
    q: getParam(params, 'q') ?? '',
    type: getParam(params, 'type') ?? 'all',
    status: getParam(params, 'status') ?? 'all',
    minCost: getParam(params, 'minCost') ?? '',
    maxCost: getParam(params, 'maxCost') ?? '',
  }
  const items = await getEquipmentItems()
  const filteredItems = filterEquipment(items, filters)
  const types = [...new Set(items.map((item) => item.equipmentType).filter(Boolean))].sort()
  const activeCount = items.filter((item) => item.isActive).length
  const withHourlyRateCount = items.filter((item) => item.hourlyRate !== null).length

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Catalogo tecnico</p>
              <h1 className="text-xl font-semibold">Equipos</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/equipment/new" className="inline-flex h-8 items-center rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                Nuevo
              </Link>
              <Link href="/equipment/import" className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700">
                Importar equipos
              </Link>
              <Link href="/" className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700">
                Volver
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total equipos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{items.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Activos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{activeCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Con tarifa hora</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{withHourlyRateCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tipos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{types.length}</p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Busqueda y filtros</p>
            </div>
            <form action="/equipment" className="space-y-3 p-3">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Buscar
                <input name="q" defaultValue={filters.q} type="search" list="equipment-search-options" placeholder="Codigo, descripcion, CPC o VAE" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
                <datalist id="equipment-search-options">
                  {items.map((item) => (
                    <option key={item.id} value={`${item.code ?? ''} - ${item.description}`} />
                  ))}
                </datalist>
              </label>

              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Tipo
                <select name="type" defaultValue={filters.type} className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm">
                  <option value="all">Todos</option>
                  {types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  Tarifa min.
                  <input name="minCost" defaultValue={filters.minCost} inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
                </label>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Tarifa max.
                  <input name="maxCost" defaultValue={filters.maxCost} inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="submit" className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                  Aplicar filtros
                </button>
                <Link href="/equipment" className="inline-flex h-8 items-center justify-center rounded border border-slate-300 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-slate-800 transition hover:bg-slate-100">
                  Limpiar filtros
                </Link>
              </div>
            </form>
          </aside>

          <section className="min-w-0 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Tabla de equipos</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-white">Exportar equipos</span>
                <ExportVisibleTableButton tableId="equipment-table" fileName="equipos" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table id="equipment-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                    <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tarifa</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Categoria</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">
                        {items.length === 0 ? 'No hay equipos registrados.' : 'No se encontraron registros con los filtros aplicados.'}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/60">
                        <td className="px-3 py-2 font-mono text-slate-700">{item.code || '-'}</td>
                        <td className="px-3 py-2 text-slate-800">{item.description}</td>
                        <td className="px-3 py-2 text-slate-700">hora</td>
                        <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">
                          {item.hourlyRate !== null && item.hourlyRate !== undefined ? item.hourlyRate.toString() : '-'}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{item.equipmentType ?? '-'}</td>
                        <td className="px-3 py-2 text-slate-700">{item.isActive ? 'Activo' : 'Inactivo'}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/equipment/${item.id}/edit`} className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">Editar</Link>
                            <form action={copyEquipmentAction} className="inline">
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="rounded border border-blue-300 bg-blue-700 px-2 py-1 text-xs font-semibold text-white transition hover:bg-blue-800">Crear copia</button>
                            </form>
                            <form action={toggleEquipmentActiveAction} className="inline">
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
