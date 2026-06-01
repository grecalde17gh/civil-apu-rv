import type { LaborItem } from '@prisma/client'
import type { RubroLaborWithLabor } from '@/src/lib/db/rubroLabor'
import { addRubroLaborAction, deleteRubroLaborAction, updateRubroLaborAction } from '@/app/rubros/actions'

type RubroLaborSectionProps = {
  rubroId: string
  laborItems: LaborItem[]
  rubroLabor: RubroLaborWithLabor[]
}

export default function RubroLaborSection({ rubroId, laborItems, rubroLabor }: RubroLaborSectionProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Mano de obra</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Agregar mano de obra</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Selecciona cargos de mano de obra y registra la cantidad y tiempo en horas.
          </p>
        </div>
      </div>

      <form action={addRubroLaborAction} className="grid gap-4 sm:grid-cols-[1fr_120px_120px_160px]">
        <input type="hidden" name="rubroId" value={rubroId} />

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Mano de obra
          <select
            name="laborItemId"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Selecciona un cargo</option>
            {laborItems.map((labor) => (
              <option key={labor.id} value={labor.id}>
                {labor.code ? `${labor.code} - ${labor.roleName}` : labor.roleName}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Cantidad
          <input
            name="workerQuantity"
            required
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Horas requeridas
          <input
            name="timeRequired"
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
            Agregar mano de obra
          </button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200 text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Rol</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Cantidad</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Horas</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo hora</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo total</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Notas</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rubroLabor.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-sm text-zinc-500">
                  No hay mano de obra agregada al rubro.
                </td>
              </tr>
            ) : (
              rubroLabor.map((line) => (
                <tr key={line.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.laborItem.code ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.laborItem.roleName}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.workerQuantity.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.timeRequired?.toString() ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.hourlyCostSnapshot.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.totalCost.toString()}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{line.notes ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    <details className="mb-2">
                      <summary className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100">
                        Editar
                      </summary>
                      <form action={updateRubroLaborAction} className="mt-3 grid min-w-64 gap-2">
                        <input type="hidden" name="id" value={line.id} />
                        <input type="hidden" name="rubroId" value={rubroId} />
                        <label className="text-xs font-medium text-zinc-600">
                          Cantidad
                          <input name="workerQuantity" defaultValue={line.workerQuantity.toString()} required inputMode="decimal" className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-zinc-600">
                          Horas
                          <input name="timeRequired" defaultValue={line.timeRequired?.toString() ?? '0'} required inputMode="decimal" className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-zinc-600">
                          Costo hora
                          <input name="hourlyCostSnapshot" defaultValue={line.hourlyCostSnapshot.toString()} required inputMode="decimal" className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
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
                    <form action={deleteRubroLaborAction} className="inline">
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
