import type { EquipmentItem, IpcoDenomination } from '@prisma/client'
import type { RubroEquipmentWithItem } from '@/src/lib/db/rubroEquipment'
import { addRubroEquipmentAction, deleteRubroEquipmentAction, updateRubroEquipmentAction } from '@/app/rubros/actions'
import CatalogCombobox from '@/src/components/shared/CatalogCombobox'
import { formatCatalogOption } from '@/src/lib/catalogSearch'
import InlineEditableCell from './InlineEditableCell'

type RubroEquipmentSectionProps = {
  rubroId: string
  equipmentItems: Array<EquipmentItem & { denomination?: IpcoDenomination | null }>
  rubroEquipment: RubroEquipmentWithItem[]
}

export default function RubroEquipmentSection({ rubroId, equipmentItems, rubroEquipment }: RubroEquipmentSectionProps) {
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
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Equipos</p>
          <h2 className="text-base font-semibold text-slate-950">Equipos y herramientas</h2>
        </div>

        <form action={addRubroEquipmentAction} className="grid gap-2 lg:grid-cols-[minmax(250px,1fr)_95px_110px_130px]">
          <input type="hidden" name="rubroId" value={rubroId} />

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
            Rend./horas
            <input name="timeRequired" required inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
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
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Rendimiento</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tarifa</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Observacion</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rubroEquipment.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-5 text-sm text-slate-500">
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
                    <InlineEditableCell
                      actionName="equipment"
                      fieldName="timeRequired"
                      value={timeRequired}
                      payload={payload}
                      required
                    />
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{line.rateSnapshot.toString()}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{line.totalCost.toString()}</td>
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
                        <label className="text-xs font-medium text-slate-600">
                          Cantidad
                          <input name="equipmentQuantity" defaultValue={line.equipmentQuantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Rendimiento/horas
                          <input name="timeRequired" defaultValue={line.timeRequired?.toString() ?? '0'} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
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
