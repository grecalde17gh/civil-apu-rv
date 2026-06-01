import Link from 'next/link'
import { getEquipmentItems } from '@/src/lib/db/equipment'
import type { EquipmentItem } from '@prisma/client'
import { copyEquipmentAction, toggleEquipmentActiveAction } from './actions'

export default async function EquipmentPage() {
  const items = await getEquipmentItems()

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Equipos y herramientas</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Catálogo de equipos</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">Lista de equipos y herramientas activos e inactivos. Cree, edite o active/desactive equipos.</p>
          </div>
          <Link
            href="/equipment/new"
            className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Nuevo equipo
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Descripción</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Tipo</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Tarifa hora</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Tarifa día</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo compra</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Mantenimiento</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item: EquipmentItem) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.code || '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.description}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.equipmentType ?? '-'}</td>
                  <td className="px-4 py-4 text-sm font-medium text-zinc-900">{item.hourlyRate !== null && item.hourlyRate !== undefined ? item.hourlyRate.toString() : '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.dailyRate !== null && item.dailyRate !== undefined ? item.dailyRate.toString() : '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.purchaseCost !== null && item.purchaseCost !== undefined ? item.purchaseCost.toString() : '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{item.maintenanceRequired ? 'Sí' : 'No'}</td>
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
                        href={`/equipment/${item.id}/edit`}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        Editar
                      </Link>
                      <form action={toggleEquipmentActiveAction} className="inline">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="isActive" value={item.isActive ? 'false' : 'true'} />
                        <button
                          type="submit"
                          className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-zinc-800"
                        >
                          {item.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                      <form action={copyEquipmentAction} className="inline">
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          Crear copia
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
