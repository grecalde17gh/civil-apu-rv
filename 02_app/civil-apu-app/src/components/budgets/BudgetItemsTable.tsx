import type { BudgetItem } from '@prisma/client'

type BudgetItemsTableProps = {
  items: BudgetItem[]
  budgetId: string
  projectId?: string
  deleteAction: (formData: FormData) => Promise<void>
}

export default function BudgetItemsTable({ items, budgetId, projectId, deleteAction }: BudgetItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-left">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">#</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Descripción</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Unidad</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Cantidad</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Precio unitario</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Total</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-500">
                No hay ítems en este presupuesto.
              </td>
            </tr>
          ) : (
            items.map((it, idx) => (
              <tr key={it.id} className="hover:bg-zinc-50">
                <td className="px-4 py-4 text-sm text-zinc-700">{it.itemNumber ?? idx + 1}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{it.rubroCodeSnapshot}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{it.descriptionSnapshot}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{it.unitSnapshot}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{it.quantity.toString()}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{it.unitPriceSnapshot.toString()}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{it.totalPrice.toString()}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">
                  <form action={deleteAction}>
                    <input type="hidden" name="budgetId" value={budgetId} />
                    <input type="hidden" name="budgetItemId" value={it.id} />
                    {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
                    <button type="submit" className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100">
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
  )
}
