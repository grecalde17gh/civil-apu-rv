import type { RubroTransport } from '@prisma/client'
import { addRubroTransportAction, deleteRubroTransportAction, updateRubroTransportAction } from '@/app/rubros/actions'

type RubroTransportSectionProps = {
  rubroId: string
  rubroTransport: RubroTransport[]
}

export default function RubroTransportSection({ rubroId, rubroTransport }: RubroTransportSectionProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Transporte</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Agregar transporte</h2>
          <p className="mt-2 text-sm text-zinc-600">Registra servicios de transporte con unidad, cantidad y costo unitario.</p>
        </div>
      </div>

      <form action={addRubroTransportAction} className="grid gap-4 sm:grid-cols-[1fr_120px_120px_160px]">
        <input type="hidden" name="rubroId" value={rubroId} />

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Descripción
          <input name="description" required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Unidad
          <input name="unit" required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Cantidad
          <input name="quantity" required inputMode="decimal" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Costo unitario
          <input name="unitCost" required inputMode="decimal" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </label>

        <div className="flex items-end">
          <button type="submit" className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Agregar transporte
          </button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200 text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Descripción</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Unidad</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Cantidad</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo unitario</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo total</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Notas</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rubroTransport.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm text-zinc-500">
                  No hay transporte registrado para este rubro.
                </td>
              </tr>
            ) : (
              rubroTransport.map((line) => (
                <tr key={line.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.description}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.unit ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.quantity.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.unitCost.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.totalCost.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.notes ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    <details className="mb-2">
                      <summary className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100">
                        Editar
                      </summary>
                      <form action={updateRubroTransportAction} className="mt-3 grid min-w-64 gap-2">
                        <input type="hidden" name="id" value={line.id} />
                        <input type="hidden" name="rubroId" value={rubroId} />
                        <label className="text-xs font-medium text-zinc-600">
                          Descripcion
                          <input name="description" defaultValue={line.description} required className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-zinc-600">
                          Unidad
                          <input name="unit" defaultValue={line.unit ?? ''} required className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-zinc-600">
                          Cantidad
                          <input name="quantity" defaultValue={line.quantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-zinc-600">
                          Costo unitario
                          <input name="unitCost" defaultValue={line.unitCost.toString()} required inputMode="decimal" className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-zinc-600">
                          Notas
                          <input name="notes" defaultValue={line.notes ?? ''} className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
                        </label>
                        <button type="submit" className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-zinc-800">
                          Guardar
                        </button>
                      </form>
                    </details>
                    <form action={deleteRubroTransportAction} className="inline">
                      <input type="hidden" name="id" value={line.id} />
                      <input type="hidden" name="rubroId" value={rubroId} />
                      <button type="submit" className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700">Eliminar</button>
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
