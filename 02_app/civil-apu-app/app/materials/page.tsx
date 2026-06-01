import Link from 'next/link'
import { getMaterials } from '@/src/lib/db/materials'
import type { Material } from '@prisma/client'
import { copyMaterialAction, toggleMaterialActiveAction } from './actions'

export default async function MaterialsPage() {
  const materials = await getMaterials()

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Materiales</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Catálogo de materiales</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Lista de materiales activos e inactivos. Cree, edite o active/desactive materiales.
            </p>
          </div>
          <Link
            href="/materials/new"
            className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Nuevo material
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Descripción</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Unidad</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo unitario</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Stock</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {materials.map((material: Material) => (
                <tr key={material.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{material.code || '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{material.description}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{material.unit}</td>
                  <td className="px-4 py-4 text-sm font-medium text-zinc-900">
                    {material.unitCost.toString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    {material.stockQuantity !== null && material.stockQuantity !== undefined ? material.stockQuantity.toString() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        material.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {material.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/materials/${material.id}/edit`}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        Editar
                      </Link>
                      <form action={toggleMaterialActiveAction} className="inline">
                        <input type="hidden" name="id" value={material.id} />
                        <input type="hidden" name="isActive" value={material.isActive ? 'false' : 'true'} />
                        <button
                          type="submit"
                          className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-zinc-800"
                        >
                          {material.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                      <form action={copyMaterialAction} className="inline">
                        <input type="hidden" name="id" value={material.id} />
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
