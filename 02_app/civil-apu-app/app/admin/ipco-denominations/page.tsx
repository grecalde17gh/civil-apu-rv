import Link from 'next/link'
import { getIpcoDenominations } from '@/src/lib/db/denominations'
import {
  createIpcoDenominationAction,
  updateIpcoDenominationAction,
} from './actions'

type IpcoDenominationsPageProps = {
  searchParams?: Promise<{
    q?: string
  }>
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function matchesQuery(value: string | null | undefined, query: string): boolean {
  return (value ?? '').toLowerCase().includes(query.toLowerCase())
}

export default async function IpcoDenominationsPage({ searchParams }: IpcoDenominationsPageProps) {
  const { q = '' } = (await searchParams) ?? {}
  const denominations = await getIpcoDenominations({ includeInactive: true })
  const filtered = q.trim()
    ? denominations.filter((item) => matchesQuery(item.code, q) || matchesQuery(item.name, q))
    : denominations

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Administracion</p>
              <h1 className="text-xl font-semibold">Denominaciones IPCO</h1>
            </div>

            <div className="flex flex-wrap gap-2">
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
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{denominations.length}</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Activas</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">
                {denominations.filter((item) => item.isActive).length}
              </p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Inactivas</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">
                {denominations.filter((item) => !item.isActive).length}
              </p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Resultado busqueda</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{filtered.length}</p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white">Buscar</p>
              </div>
              <form className="grid gap-2 p-3">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Codigo o denominacion
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="Buscar IPCO"
                    className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm normal-case tracking-normal"
                  />
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                    Buscar
                  </button>
                  <Link href="/admin/ipco-denominations" className="inline-flex h-8 items-center rounded border border-slate-300 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-slate-800 transition hover:bg-slate-100">
                    Limpiar
                  </Link>
                </div>
              </form>
            </section>

            <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-white">Nueva denominacion</p>
              </div>
              <form action={createIpcoDenominationAction} className="grid gap-3 p-3">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Codigo IPCO
                  <input name="code" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm normal-case tracking-normal" />
                </label>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Denominacion IPCO
                  <input
                    name="name"
                    required
                    placeholder="Componentes no principales"
                    className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm normal-case tracking-normal"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-slate-300" />
                  Activo
                </label>
                <button type="submit" className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                  Crear denominacion
                </button>
              </form>
            </section>
          </aside>

          <section className="min-w-0 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Listado de denominaciones IPCO</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo IPCO</th>
                    <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominacion IPCO</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Activo</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Fecha de creacion</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Ultima actualizacion</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-500">
                        No hay denominaciones IPCO registradas.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/60">
                        <td colSpan={6} className="p-0">
                          <form action={updateIpcoDenominationAction} className="grid min-w-[980px] grid-cols-[150px_minmax(320px,1fr)_100px_150px_170px_190px] items-center gap-px bg-slate-200">
                            <input type="hidden" name="id" value={item.id} />
                            <div className="bg-white px-3 py-2">
                              <input
                                name="code"
                                defaultValue={item.code ?? ''}
                                className="h-8 w-full rounded border border-slate-300 px-2 font-mono text-xs"
                              />
                            </div>
                            <div className="bg-white px-3 py-2">
                              <input
                                name="name"
                                required
                                defaultValue={item.name}
                                className="h-8 w-full rounded border border-slate-300 px-2 text-xs"
                              />
                            </div>
                            <div className="bg-white px-3 py-2">
                              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <input type="checkbox" name="isActive" defaultChecked={item.isActive} className="h-4 w-4 rounded border-slate-300" />
                                {item.isActive ? 'Si' : 'No'}
                              </label>
                            </div>
                            <div className="bg-white px-3 py-2 font-mono tabular-nums text-slate-700">{formatDate(item.createdAt)}</div>
                            <div className="bg-white px-3 py-2 font-mono tabular-nums text-slate-700">{formatDate(item.updatedAt)}</div>
                            <div className="flex flex-wrap gap-2 bg-white px-3 py-2">
                              <button type="submit" className="h-8 rounded bg-blue-700 px-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
                                Guardar
                              </button>
                            </div>
                          </form>
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
