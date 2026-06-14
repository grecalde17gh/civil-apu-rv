import type { IpcoDenomination, RubroTransport } from '@prisma/client'
import { addRubroTransportAction, deleteRubroTransportAction, updateRubroTransportAction } from '@/app/rubros/actions'
import DenominationCombobox from '@/src/components/shared/DenominationCombobox'

type RubroTransportWithDenomination = RubroTransport & {
  denomination?: IpcoDenomination | null
}

type RubroTransportSectionProps = {
  rubroId: string
  rubroTransport: RubroTransportWithDenomination[]
  denominations?: IpcoDenomination[]
}

export default function RubroTransportSection({ rubroId, rubroTransport, denominations = [] }: RubroTransportSectionProps) {
  const denominationOptions = denominations.map((denomination) => ({
    id: denomination.id,
    label: [denomination.code, denomination.name].filter(Boolean).join(' - '),
    searchText: [denomination.code, denomination.name].filter(Boolean).join(' '),
  }))

  return (
    <section id="transporte" className="scroll-mt-14 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Transporte</p>
          <h2 className="text-base font-semibold text-slate-950">Costos de transporte</h2>
        </div>

        <form action={addRubroTransportAction} className="grid gap-2 lg:grid-cols-[110px_minmax(220px,1fr)_90px_95px_110px_minmax(220px,1fr)_130px]">
          <input type="hidden" name="rubroId" value={rubroId} />

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Codigo
            <input name="code" placeholder="TR-001" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Descripcion
            <input name="description" required className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Unidad
            <input name="unit" required className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cantidad
            <input name="quantity" required inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Precio
            <input name="unitCost" required inputMode="decimal" className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm" />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Denominación IPCO
            <DenominationCombobox options={denominationOptions} />
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
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura organizacional</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominación IPCO</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Observacion</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rubroTransport.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-5 text-sm text-slate-500">
                  No hay transporte registrado para este rubro.
                </td>
              </tr>
            ) : (
              rubroTransport.map((line) => (
                <tr key={line.id} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-mono text-slate-700">{line.code ?? '-'}</td>
                  <td className="px-3 py-2 text-slate-800">{line.description}</td>
                  <td className="px-3 py-2 text-slate-700">{line.unit ?? '-'}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{line.quantity.toString()}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{line.unitCost.toString()}</td>
                  <td className="px-3 py-2 text-slate-700">{line.denomination ? [line.denomination.code, line.denomination.name].filter(Boolean).join(' - ') : '-'}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{line.totalCost.toString()}</td>
                  <td className="px-3 py-2 text-slate-600">{line.notes ?? '-'}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <details className="mb-2">
                      <summary className="cursor-pointer rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                        Editar
                      </summary>
                      <form action={updateRubroTransportAction} className="mt-3 grid min-w-64 gap-2 rounded border border-slate-200 bg-white p-2 shadow-sm">
                        <input type="hidden" name="id" value={line.id} />
                        <input type="hidden" name="rubroId" value={rubroId} />
                        <label className="text-xs font-medium text-slate-600">
                          Codigo
                          <input name="code" defaultValue={line.code ?? ''} placeholder="TR-001" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Descripcion
                          <input name="description" defaultValue={line.description} required className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Unidad
                          <input name="unit" defaultValue={line.unit ?? ''} required className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Cantidad
                          <input name="quantity" defaultValue={line.quantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Precio
                          <input name="unitCost" defaultValue={line.unitCost.toString()} required inputMode="decimal" className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Denominación IPCO
                          <DenominationCombobox options={denominationOptions} initialId={line.denominationId ?? ''} />
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
                    <form action={deleteRubroTransportAction} className="inline">
                      <input type="hidden" name="id" value={line.id} />
                      <input type="hidden" name="rubroId" value={rubroId} />
                      <button type="submit" className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700">
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
