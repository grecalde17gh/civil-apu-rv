import type { IpcoDenomination, Material } from '@prisma/client'
import type { RubroMaterialWithMaterial } from '@/src/lib/db/rubroMaterials'
import { addRubroMaterialAction, deleteRubroMaterialAction, updateRubroMaterialAction } from '@/app/rubros/actions'
import CatalogCombobox from '@/src/components/shared/CatalogCombobox'
import { formatCatalogOption } from '@/src/lib/catalogSearch'
import { calculateNpEpNd, calculateRelativeWeight, calculateVaeElement } from '@/src/lib/calculations/rubroComponentParticipation'
import { formatMoney2, formatOptionalRatio5, formatRatio5, sumComponentSubtotal } from '@/src/lib/rubros/rubroDisplayTotals'
import InlineEditableCell from './InlineEditableCell'

type RubroMaterialsSectionProps = {
  rubroId: string
  budgetId?: string
  materials: Array<Material & { denomination?: IpcoDenomination | null }>
  rubroMaterials: RubroMaterialWithMaterial[]
  rubroDirectTotal: number
}

export default function RubroMaterialsSection({ rubroId, budgetId, materials, rubroMaterials, rubroDirectTotal }: RubroMaterialsSectionProps) {
  const subtotal = sumComponentSubtotal(
    rubroMaterials.map((line) => ({ totalCost: line.totalCost, vae: line.material.vae })),
    rubroDirectTotal,
  )
  const materialOptions = materials.map((material) => ({
    id: material.id,
    label: formatCatalogOption(
      [material.code, material.description, material.unit],
      material.price1.toString(),
    ),
    searchText: [material.code, material.description, material.unit, material.denomination?.code, material.denomination?.name, material.price1.toString()].join(' '),
  }))

  return (
    <section id="materiales" className="scroll-mt-14 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Materiales</h2>
        </div>

        <form action={addRubroMaterialAction} className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_110px_110px_130px]">
          <input type="hidden" name="rubroId" value={rubroId} />
          {budgetId ? <input type="hidden" name="budgetId" value={budgetId} /> : null}

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Material
            <CatalogCombobox
              name="materialId"
              options={materialOptions}
              placeholder="Codigo, descripcion o denominacion"
              emptyLabel="No hay materiales que coincidan."
            />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cantidad
            <input name="quantity" required inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Precio
            <select name="priceOption" defaultValue="1" className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm">
              <option value="1">Precio 1</option>
              <option value="2">Precio 2</option>
              <option value="3">Precio 3</option>
            </select>
          </label>

          <div className="flex items-end">
            <button type="submit" className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
              Insertar Material
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura ocupacional</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio aplicado</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo unitario</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo total</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Peso relativo %</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">CPC elemento</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">NP/EP/ND</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">VAE %</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">VAE % elemento</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Observacion</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rubroMaterials.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-5 text-sm text-slate-500">
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
                  priceOption: line.priceOption.toString(),
                  notes: line.notes ?? '',
                }
                const priceOptions = [
                  { value: 1, label: 'Precio 1', available: true },
                  { value: 2, label: 'Precio 2', available: line.material.price2 !== null },
                  { value: 3, label: 'Precio 3', available: line.material.price3 !== null },
                ]
                const relativeWeight = calculateRelativeWeight(Number(line.totalCost.toString()), rubroDirectTotal)
                const vae = line.material.vae
                const vaeElement = calculateVaeElement(relativeWeight, vae)

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
                    <td className="px-3 py-2 text-slate-700">
                      <form action={updateRubroMaterialAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={line.id} />
                        <input type="hidden" name="rubroId" value={rubroId} />
                        {budgetId ? <input type="hidden" name="budgetId" value={budgetId} /> : null}
                        <input type="hidden" name="quantity" value={line.quantity.toString()} />
                        <input type="hidden" name="unit" value={line.unit ?? line.material.unit} />
                        <input type="hidden" name="notes" value={line.notes ?? ''} />
                        <select name="priceOption" defaultValue={line.priceOption.toString()} className="h-7 rounded border border-slate-300 bg-white px-2 text-xs">
                          {priceOptions.map((option) => (
                            <option key={option.value} value={option.value} disabled={!option.available}>
                              {option.label}{option.available ? '' : ' (no disponible)'}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="h-7 rounded border border-slate-300 px-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100">
                          Cambiar
                        </button>
                      </form>
                    </td>
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{formatMoney2(line.unitCostSnapshot)}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">
                      {formatMoney2(line.totalCost)}
                    </td>
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{formatRatio5(relativeWeight)}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{line.material.cpc ?? '-'}</td>
                    <td className="px-3 py-2 font-semibold text-slate-700">{calculateNpEpNd(vae)}</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatVae(vae)}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{formatRatio5(vaeElement)}</td>
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
                        {budgetId ? <input type="hidden" name="budgetId" value={budgetId} /> : null}
                        <label className="text-xs font-medium text-slate-600">
                          Cantidad
                          <input name="quantity" defaultValue={line.quantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Unidad
                          <input name="unit" defaultValue={line.unit ?? line.material.unit} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Precio aplicado
                          <select name="priceOption" defaultValue={line.priceOption.toString()} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm">
                            {priceOptions.map((option) => (
                              <option key={option.value} value={option.value} disabled={!option.available}>
                                {option.label}{option.available ? '' : ' (no disponible)'}
                              </option>
                            ))}
                          </select>
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
                      {budgetId ? <input type="hidden" name="budgetId" value={budgetId} /> : null}
                      <button type="submit" className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700">
                        Quitar / Eliminar
                      </button>
                    </form>
                    </td>
                  </tr>
                )
              })
            )}
            <tr className="bg-slate-100 font-semibold text-slate-950">
              <td colSpan={6} className="px-3 py-2 uppercase tracking-wide">SUBTOTAL</td>
              <td className="px-3 py-2 font-mono tabular-nums">{formatMoney2(subtotal.totalCost)}</td>
              <td className="px-3 py-2 font-mono tabular-nums">{formatRatio5(subtotal.relativeWeight)}</td>
              <td colSpan={3} className="px-3 py-2"></td>
              <td className="px-3 py-2 font-mono tabular-nums">{formatRatio5(subtotal.vaeElement)}</td>
              <td colSpan={2} className="px-3 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatVae(value: Material['vae']): string {
  if (value === null || value === undefined) {
    return '-'
  }

  const numericValue = Number(value.toString())
  return Number.isFinite(numericValue) ? formatOptionalRatio5(numericValue) : '-'
}
