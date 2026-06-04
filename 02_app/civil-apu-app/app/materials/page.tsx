import Link from 'next/link'
import { getMaterials } from '@/src/lib/db/materials'
import { copyMaterialAction, toggleMaterialActiveAction } from './actions'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'

export default async function MaterialsPage() {
  const materials = await getMaterials()
  const units = [...new Set(materials.map((material) => material.unit).filter(Boolean))].sort()
  const activeCount = materials.filter((material) => material.isActive).length
  const category1Count = materials.filter((material) => material.usesCategory1).length
  const category2Count = materials.filter((material) => material.usesCategory2).length

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Catalogo tecnico</p>
              <h1 className="text-xl font-semibold">Materiales</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/materials/new" className="inline-flex h-8 items-center rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                Nuevo
              </Link>
              <Link href="/imports/materials" className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700">
                Importar
              </Link>
              <Link href="/" className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700">
                Volver
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total materiales</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{materials.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Activos</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{activeCount}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unidades</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{units.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cat. 1 / Cat. 2</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{category1Count} / {category2Count}</p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Busqueda y filtros</p>
            </div>
            <div className="space-y-3 p-3">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Buscar
                <input type="search" list="material-search-options" placeholder="Codigo o descripcion" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
                <datalist id="material-search-options">
                  {materials.map((material) => (
                    <option key={material.id} value={`${material.code ?? ''} - ${material.description}`} />
                  ))}
                </datalist>
              </label>

              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Unidad
                <select className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm">
                  <option>Todas</option>
                  {units.map((unit) => (
                    <option key={unit}>{unit}</option>
                  ))}
                </select>
              </label>

              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Estado
                <select className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm">
                  <option>Todos</option>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </label>
            </div>
          </aside>

          <section className="min-w-0 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Tabla de materiales</p>
              <ExportVisibleTableButton tableId="materials-table" fileName="materiales" />
            </div>
            <div className="overflow-x-auto">
              <table id="materials-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                    <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio unitario</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cat.1</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cat.2</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-500">No hay materiales registrados.</td>
                    </tr>
                  ) : (
                    materials.map((material) => (
                      <tr key={material.id} className="hover:bg-blue-50/60">
                        <td className="px-3 py-2 font-mono text-slate-700">{material.code || '-'}</td>
                        <td className="px-3 py-2 text-slate-800">{material.description}</td>
                        <td className="px-3 py-2 text-slate-700">{material.unit}</td>
                        <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{material.unitCost.toString()}</td>
                        <td className="px-3 py-2 text-slate-700">{material.usesCategory1 ? 'Si' : 'No'}</td>
                        <td className="px-3 py-2 text-slate-700">{material.usesCategory2 ? 'Si' : 'No'}</td>
                        <td className="px-3 py-2 text-slate-700">{material.isActive ? 'Activo' : 'Inactivo'}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/materials/${material.id}/edit`} className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">Editar</Link>
                            <form action={copyMaterialAction} className="inline">
                              <input type="hidden" name="id" value={material.id} />
                              <button type="submit" className="rounded border border-blue-300 bg-blue-700 px-2 py-1 text-xs font-semibold text-white transition hover:bg-blue-800">Crear copia</button>
                            </form>
                            <form action={toggleMaterialActiveAction} className="inline">
                              <input type="hidden" name="id" value={material.id} />
                              <input type="hidden" name="isActive" value={material.isActive ? 'false' : 'true'} />
                              <button type="submit" className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                                {material.isActive ? 'Desactivar' : 'Activar'}
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
