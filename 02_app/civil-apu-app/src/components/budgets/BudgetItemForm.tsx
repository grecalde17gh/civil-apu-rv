import type { Rubro } from '@prisma/client'

type BudgetItemFormProps = {
  action: (formData: FormData) => Promise<void>
  budgetId: string
  projectId?: string
  rubros: Rubro[]
}

export default function BudgetItemForm({ action, budgetId, projectId, rubros }: BudgetItemFormProps) {
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
