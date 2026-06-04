import type { Material } from '@prisma/client'
import type { RubroMaterialWithMaterial } from '@/src/lib/db/rubroMaterials'
import { addRubroMaterialAction, deleteRubroMaterialAction, updateRubroMaterialAction } from '@/app/rubros/actions'
import InlineEditableCell from './InlineEditableCell'

type RubroMaterialsSectionProps = {
  rubroId: string
  materials: Material[]
  rubroMaterials: RubroMaterialWithMaterial[]
}

export default function RubroMaterialsSection({ rubroId, materials, rubroMaterials }: RubroMaterialsSectionProps) {
  return (
    <section id="materiales" className="scroll-mt-14 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Materiales</p>
          <h2 className="text-base font-semibold text-slate-950">Composicion de materiales</h2>
        </div>

        <form action={addRubroMaterialAction} className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_110px_130px]">
          <input type="hidden" name="rubroId" value={rubroId} />

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Material
            <select name="materialId" required className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm">
              <option value="">Selecciona un material</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.code ? `${material.code} - ${material.description}` : material.description}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cantidad
            <input name="quantity" required inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <div className="flex items-end">
            <button type="submit" className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
              Agregar
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Observacion</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rubroMaterials.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-5 text-sm text-slate-500">
                  No hay materiales agregados al rubro.
                </td>
              </tr>
            ) : (
              rubroMaterials.map((line) => {
                const payload = {
                  id: line.id,
                  rubroId,
                  quantity: line.quantity.toString(),
                  unit: line.unit ?? line.material.unit,
                  unitCostSnapshot: line.unitCostSnapshot.toString(),
                  notes: line.notes ?? '',
                }

                return (
                  <tr key={line.id} className="hover:bg-blue-50/60">
                    <td className="px-3 py-2 font-mono text-slate-700">{line.material.code ?? '-'}</td>
                    <td className="px-3 py-2 text-slate-800">{line.material.description}</td>
                    <td className="px-3 py-2 text-slate-700">{line.unit ?? line.material.unit}</td>
                    <InlineEditableCell
                      actionName="material"
                      fieldName="quantity"
                      value={line.quantity.toString()}
                      payload={payload}
                      required
                    />
                    <InlineEditableCell
                      actionName="material"
                      fieldName="unitCostSnapshot"
                      value={line.unitCostSnapshot.toString()}
                      payload={payload}
                      required
                    />
                    <td className="bg-slate-50 px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">
                      {line.totalCost.toString()}
                    </td>
                    <InlineEditableCell
                      actionName="material"
                      fieldName="notes"
                      value={line.notes ?? ''}
                      payload={payload}
                      type="text"
                      align="left"
                    />
                    <td className="px-3 py-2 text-slate-700">
                    <details className="mb-2">
                      <summary className="cursor-pointer rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                        Editar
                      </summary>
                      <form action={updateRubroMaterialAction} className="mt-3 grid min-w-64 gap-2 rounded border border-slate-200 bg-white p-2 shadow-sm">
                        <input type="hidden" name="id" value={line.id} />
                        <input type="hidden" name="rubroId" value={rubroId} />
                        <label className="text-xs font-medium text-slate-600">
                          Cantidad
                          <input name="quantity" defaultValue={line.quantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Unidad
                          <input name="unit" defaultValue={line.unit ?? line.material.unit} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Precio
                          <input name="unitCostSnapshot" defaultValue={line.unitCostSnapshot.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Observacion
                          <input name="notes" defaultValue={line.notes ?? ''} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <button type="submit" className="rounded bg-blue-700 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-800">
                          Guardar
                        </button>
                      </form>
                    </details>
                    <form action={deleteRubroMaterialAction} className="inline">
                      <input type="hidden" name="id" value={line.id} />
                      <input type="hidden" name="rubroId" value={rubroId} />
                      <button type="submit" className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700">
                        Eliminar
                      </button>
                    </form>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
