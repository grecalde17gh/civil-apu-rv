import type { Material } from '@prisma/client'
import type { RubroMaterialWithMaterial } from '@/src/lib/db/rubroMaterials'
import { addRubroMaterialAction, deleteRubroMaterialAction } from '@/app/rubros/actions'

type RubroMaterialsSectionProps = {
  rubroId: string
  materials: Material[]
  rubroMaterials: RubroMaterialWithMaterial[]
}

export default function RubroMaterialsSection({ rubroId, materials, rubroMaterials }: RubroMaterialsSectionProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Materiales del rubro</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Agregar materiales</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Selecciona materiales del catálogo, guarda la cantidad y el costo unitario vigente.
          </p>
        </div>
      </div>

      <form action={addRubroMaterialAction} className="grid gap-4 sm:grid-cols-[1fr_120px_160px]">
        <input type="hidden" name="rubroId" value={rubroId} />

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Material
          <select
            name="materialId"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecciona un material</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.code ? `${material.code} - ${material.description}` : material.description}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Cantidad
          <input
            name="quantity"
            required
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Agregar material
          </button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200 text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Descripción</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Cantidad</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Unidad</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo unitario</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo total</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Notas</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rubroMaterials.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-sm text-zinc-500">
                  No hay materiales agregados al rubro.
                </td>
              </tr>
            ) : (
              rubroMaterials.map((line) => (
                <tr key={line.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.material.code ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.material.description}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.quantity.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.unit ?? line.material.unit}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.unitCostSnapshot.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.totalCost.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.notes ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    <form action={deleteRubroMaterialAction} className="inline">
                      <input type="hidden" name="id" value={line.id} />
                      <input type="hidden" name="rubroId" value={rubroId} />
                      <button
                        type="submit"
                        className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
