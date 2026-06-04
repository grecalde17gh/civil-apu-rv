import type { Rubro } from '@prisma/client'

type BudgetItemFormProps = {
  action: (formData: FormData) => Promise<void>
  budgetId: string
  projectId?: string
  rubros: Rubro[]
  variant?: 'default' | 'catalog'
}

export default function BudgetItemForm({ action, budgetId, projectId, rubros, variant = 'default' }: BudgetItemFormProps) {
  if (variant === 'catalog') {
    return (
      <aside className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Rubros disponibles</p>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 p-3">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Buscar
            <input
              type="search"
              list="budget-rubro-search-options"
              placeholder="Codigo, descripcion o unidad"
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
            <datalist id="budget-rubro-search-options">
              {rubros.map((r) => (
                <option key={r.id} value={`${r.code} - ${r.description} (${r.unit})`} />
              ))}
            </datalist>
          </label>
        </div>

        <form action={action} className="space-y-3 border-b border-slate-200 p-3">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rubro
            <select name="rubroId" required className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950">
              <option value="">Selecciona un rubro</option>
              {rubros.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.description}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cantidad
            <input
              name="quantity"
              required
              inputMode="decimal"
              defaultValue="1"
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
          </label>

          <input type="hidden" name="budgetId" value={budgetId} />
          {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
          <button type="submit" className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
            Agregar
          </button>
        </form>

        <div className="max-h-[520px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                <th className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">Rubro</th>
                <th className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">Und.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rubros.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-sm text-slate-500">
                    No hay rubros disponibles.
                  </td>
                </tr>
              ) : (
                rubros.slice(0, 80).map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/60">
                    <td className="px-2 py-2 font-mono text-slate-700">{r.code}</td>
                    <td className="px-2 py-2 text-slate-800">{r.description}</td>
                    <td className="px-2 py-2 text-slate-600">{r.unit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </aside>
    )
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Rubro
          <select name="rubroId" required className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
            <option value="">Selecciona un rubro</option>
            {rubros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} — {r.description}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Cantidad
          <input name="quantity" required inputMode="decimal" defaultValue="1" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </label>

        <div className="flex items-end">
          <input type="hidden" name="budgetId" value={budgetId} />
          {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
          <button type="submit" className="w-full rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
            Agregar rubro
          </button>
        </div>
      </div>
    </form>
  )
}
