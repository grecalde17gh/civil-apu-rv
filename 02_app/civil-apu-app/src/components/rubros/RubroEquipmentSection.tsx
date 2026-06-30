import type { EquipmentItem, IpcoDenomination } from '@prisma/client'
import type { RubroEquipmentWithItem } from '@/src/lib/db/rubroEquipment'
import { addRubroEquipmentAction, deleteRubroEquipmentAction, updateRubroEquipmentAction } from '@/app/rubros/actions'
import CatalogCombobox from '@/src/components/shared/CatalogCombobox'
import { formatCatalogOption } from '@/src/lib/catalogSearch'
import { calculateNpEpNd, calculateRelativeWeight, calculateVaeElement } from '@/src/lib/calculations/rubroComponentParticipation'
import { formatMoney2, formatOptionalRatio5, formatRatio5, sumComponentSubtotal } from '@/src/lib/rubros/rubroDisplayTotals'
import InlineEditableCell from './InlineEditableCell'

type RubroEquipmentSectionProps = {
  rubroId: string
  budgetId?: string
  equipmentItems: Array<EquipmentItem & { denomination?: IpcoDenomination | null }>
  rubroEquipment: RubroEquipmentWithItem[]
  rubroPerformanceValue?: number | null
  rubroDirectTotal: number
}

export default function RubroEquipmentSection({ rubroId, budgetId, equipmentItems, rubroEquipment, rubroPerformanceValue, rubroDirectTotal }: RubroEquipmentSectionProps) {
  const hasRubroPerformance = typeof rubroPerformanceValue === 'number' && Number.isFinite(rubroPerformanceValue) && rubroPerformanceValue > 0
  const rubroPerformanceInputValue = hasRubroPerformance ? String(rubroPerformanceValue) : ''
  const subtotal = sumComponentSubtotal(
    rubroEquipment.map((line) => ({ totalCost: line.totalCost, vae: line.equipmentItem.vae })),
    rubroDirectTotal,
  )
  const equipmentOptions = equipmentItems.map((item) => ({
    id: item.id,
    label: formatCatalogOption([item.code, item.description, 'hora'], item.hourlyRate?.toString() ?? 'sin tarifa'),
    searchText: [item.code, item.description, item.equipmentType, item.denomination?.code, item.denomination?.name, 'hora', item.hourlyRate?.toString() ?? ''].join(' '),
    disabled: item.hourlyRate === null,
    disabledReason: item.hourlyRate === null ? 'Sin tarifa horaria vigente' : undefined,
  }))

  return (
    <section id="equipos" className="scroll-mt-14 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Equipos</h2>
        </div>

        <form action={addRubroEquipmentAction} className="grid gap-2 lg:grid-cols-[minmax(250px,1fr)_95px_130px_130px]">
          <input type="hidden" name="rubroId" value={rubroId} />
          {budgetId ? <input type="hidden" name="budgetId" value={budgetId} /> : null}
          <input type="hidden" name="timeRequired" value={rubroPerformanceInputValue} />

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Equipo
            <CatalogCombobox
              name="equipmentItemId"
              options={equipmentOptions}
              placeholder="Codigo, equipo o denominacion"
              emptyLabel="No hay equipos que coincidan."
            />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cantidad
            <input name="equipmentQuantity" required inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rend. general
            <input value={rubroPerformanceInputValue} readOnly className="mt-1 h-8 w-full rounded border border-slate-200 bg-slate-100 px-2 text-sm text-slate-600" />
          </label>

          <div className="flex items-end">
            <button type="submit" disabled={!hasRubroPerformance} className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:border disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-500">
              Insertar Equipos
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
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Rendimiento</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tarifa</th>
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
            {rubroEquipment.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-5 text-sm text-slate-500">
                  No hay equipos agregados al rubro.
                </td>
              </tr>
            ) : (
              rubroEquipment.map((line) => {
                const timeRequired = line.timeRequired?.toString() ?? '0'
                const payload = {
                  id: line.id,
                  rubroId,
                  equipmentQuantity: line.equipmentQuantity.toString(),
                  timeRequired,
                  notes: line.notes ?? '',
                }
                const relativeWeight = calculateRelativeWeight(Number(line.totalCost.toString()), rubroDirectTotal)
                const vae = line.equipmentItem.vae
                const vaeElement = calculateVaeElement(relativeWeight, vae)

                return (
                  <tr key={line.id} className="hover:bg-blue-50/60">
                    <td className="px-3 py-2 font-mono text-slate-700">{line.equipmentItem.code ?? '-'}</td>
                    <td className="px-3 py-2 text-slate-800">{line.equipmentItem.description}</td>
                    <td className="px-3 py-2 text-slate-700">hora</td>
                    <InlineEditableCell
                      actionName="equipment"
                      fieldName="equipmentQuantity"
                      value={line.equipmentQuantity.toString()}
                      payload={payload}
                      required
                    />
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-600">{timeRequired}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{formatMoney2(line.rateSnapshot)}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatMoney2(line.totalCost)}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{formatRatio5(relativeWeight)}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{line.equipmentItem.cpc ?? '-'}</td>
                    <td className="px-3 py-2 font-semibold text-slate-700">{calculateNpEpNd(vae)}</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatVae(vae)}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{formatRatio5(vaeElement)}</td>
                    <InlineEditableCell
                      actionName="equipment"
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
                      <form action={updateRubroEquipmentAction} className="mt-3 grid min-w-64 gap-2 rounded border border-slate-200 bg-white p-2 shadow-sm">
                        <input type="hidden" name="id" value={line.id} />
                        <input type="hidden" name="rubroId" value={rubroId} />
                        {budgetId ? <input type="hidden" name="budgetId" value={budgetId} /> : null}
                        <input type="hidden" name="timeRequired" value={timeRequired} />
                        <label className="text-xs font-medium text-slate-600">
                          Cantidad
                          <input name="equipmentQuantity" defaultValue={line.equipmentQuantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <div className="text-xs font-medium text-slate-600">
                          Rendimiento/horas
                          <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm tabular-nums text-slate-700">{timeRequired}</p>
                        </div>
                        <div className="text-xs font-medium text-slate-600">
                          Tarifa
                          <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm tabular-nums text-slate-700">{line.rateSnapshot.toString()}</p>
                        </div>
                        <label className="text-xs font-medium text-slate-600">
                          Observacion
                          <input name="notes" defaultValue={line.notes ?? ''} className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <button type="submit" className="rounded bg-blue-700 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-800">
                          Guardar
                        </button>
                      </form>
                    </details>
                    <form action={deleteRubroEquipmentAction} className="inline">
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

function formatVae(value: EquipmentItem['vae']): string {
  if (value === null || value === undefined) {
    return '-'
  }

  const numericValue = Number(value.toString())
  return Number.isFinite(numericValue) ? formatOptionalRatio5(numericValue) : '-'
}
