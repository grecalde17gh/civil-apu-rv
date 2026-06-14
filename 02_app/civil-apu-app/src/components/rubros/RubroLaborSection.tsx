import type { IpcoDenomination, LaborItem } from '@prisma/client'
import type { RubroLaborWithLabor } from '@/src/lib/db/rubroLabor'
import { addRubroLaborAction, deleteRubroLaborAction, updateRubroLaborAction } from '@/app/rubros/actions'
import CatalogCombobox from '@/src/components/shared/CatalogCombobox'
import { formatCatalogOption } from '@/src/lib/catalogSearch'
import InlineEditableCell from './InlineEditableCell'

type RubroLaborSectionProps = {
  rubroId: string
  laborItems: Array<LaborItem & { denomination?: IpcoDenomination | null }>
  rubroLabor: RubroLaborWithLabor[]
  rubroPerformanceValue?: number | null
}

export default function RubroLaborSection({ rubroId, laborItems, rubroLabor, rubroPerformanceValue }: RubroLaborSectionProps) {
  const hasRubroPerformance = typeof rubroPerformanceValue === 'number' && Number.isFinite(rubroPerformanceValue) && rubroPerformanceValue > 0
  const rubroPerformanceInputValue = hasRubroPerformance ? String(rubroPerformanceValue) : ''
  const laborOptions = laborItems.map((labor) => ({
    id: labor.id,
    label: formatCatalogOption([labor.code, labor.roleName, 'hora'], labor.hourlyCost.toString()),
    searchText: [labor.code, labor.roleName, labor.denomination?.code, labor.denomination?.name, 'hora', labor.hourlyCost.toString()].join(' '),
  }))

  return (
    <section id="mano-obra" className="scroll-mt-14 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Mano de obra</p>
          <h2 className="text-base font-semibold text-slate-950">Cuadrilla y rendimiento</h2>
        </div>

        <form action={addRubroLaborAction} className="grid gap-2 lg:grid-cols-[minmax(250px,1fr)_95px_130px_130px]">
          <input type="hidden" name="rubroId" value={rubroId} />
          <input type="hidden" name="timeRequired" value={rubroPerformanceInputValue} />

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cargo
            <CatalogCombobox
              name="laborItemId"
              options={laborOptions}
              placeholder="Codigo, rol o denominacion"
              emptyLabel="No hay mano de obra que coincida."
            />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cantidad
            <input name="workerQuantity" required inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rend. general
            <input value={rubroPerformanceInputValue} readOnly className="mt-1 h-8 w-full rounded border border-slate-200 bg-slate-100 px-2 text-sm text-slate-600" />
          </label>

          <div className="flex items-end">
            <button type="submit" disabled={!hasRubroPerformance} className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:border disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-500">
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
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura organizacional</th>
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
            {rubroLabor.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-5 text-sm text-slate-500">
                  No hay mano de obra agregada al rubro.
                </td>
              </tr>
            ) : (
              rubroLabor.map((line) => {
                const timeRequired = line.timeRequired?.toString() ?? '0'
                const payload = {
                  id: line.id,
                  rubroId,
                  workerQuantity: line.workerQuantity.toString(),
                  timeRequired,
                  notes: line.notes ?? '',
                }

                return (
                  <tr key={line.id} className="hover:bg-blue-50/60">
                    <td className="px-3 py-2 font-mono text-slate-700">{line.laborItem.code ?? '-'}</td>
                    <td className="px-3 py-2 text-slate-800">{line.laborItem.roleName}</td>
                    <td className="px-3 py-2 text-slate-700">hora</td>
                    <InlineEditableCell
                      actionName="labor"
                      fieldName="workerQuantity"
                      value={line.workerQuantity.toString()}
                      payload={payload}
                      required
                    />
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-600">{timeRequired}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-700">{line.hourlyCostSnapshot.toString()}</td>
                    <td className="bg-slate-50 px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">
                      {line.totalCost.toString()}
                    </td>
                    <InlineEditableCell
                      actionName="labor"
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
                      <form action={updateRubroLaborAction} className="mt-3 grid min-w-64 gap-2 rounded border border-slate-200 bg-white p-2 shadow-sm">
                        <input type="hidden" name="id" value={line.id} />
                        <input type="hidden" name="rubroId" value={rubroId} />
                        <input type="hidden" name="timeRequired" value={timeRequired} />
                        <label className="text-xs font-medium text-slate-600">
                          Cantidad
                          <input name="workerQuantity" defaultValue={line.workerQuantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <div className="text-xs font-medium text-slate-600">
                          Rendimiento/horas
                          <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm tabular-nums text-slate-700">{timeRequired}</p>
                        </div>
                        <div className="text-xs font-medium text-slate-600">
                          Tarifa
                          <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm tabular-nums text-slate-700">{line.hourlyCostSnapshot.toString()}</p>
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
                    <form action={deleteRubroLaborAction} className="inline">
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
