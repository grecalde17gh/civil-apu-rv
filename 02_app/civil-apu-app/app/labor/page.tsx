import Link from 'next/link'
import { getLaborItems } from '@/src/lib/db/labor'
import type { LaborItem } from '@prisma/client'
import { toggleLaborActiveAction } from './actions'

export default async function LaborPage() {
  const items = await getLaborItems()

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Mano de obra</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Catálogo de mano de obra</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">Lista de mano de obra activos e inactivos. Cree, edite o active/desactive items.</p>
          </div>
          <Link
            href="/labor/new"
            className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Nuevo item
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Rol / Nombre</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo hora</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo diario</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Competencias</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Disponibilidad</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item: LaborItem) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.code || '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.roleName}</td>
                  <td className="px-4 py-4 text-sm font-medium text-zinc-900">{item.hourlyCost.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.dailyCost !== null && item.dailyCost !== undefined ? item.dailyCost.toString() : '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.competencies ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.availability ?? '-'}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/labor/${item.id}/edit`}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        Editar
                      </Link>
                      <form action={toggleLaborActiveAction} className="inline">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="isActive" value={item.isActive ? 'false' : 'true'} />
                        <button
                          type="submit"
                          className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-zinc-800"
                        >
                          {item.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
