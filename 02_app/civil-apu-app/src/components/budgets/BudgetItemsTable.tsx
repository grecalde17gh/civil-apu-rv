import type { BudgetItem } from '@prisma/client'
import Link from 'next/link'

type BudgetItemsTableProps = {
  items: BudgetItem[]
  budgetId: string
  projectId?: string
  deleteAction: (formData: FormData) => Promise<void>
}

function getItemSubtotal(item: BudgetItem) {
  const subtotalSnapshot = Number(item.subtotalSnapshot.toString())
  return subtotalSnapshot > 0 ? item.subtotalSnapshot : item.totalPrice
}

export default function BudgetItemsTable({ items, budgetId, projectId, deleteAction }: BudgetItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-left">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">#</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Codigo</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Descripcion</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Unidad</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Cantidad</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Indirectos</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo directo</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Precio unitario</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Total</th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-10 text-center text-sm text-zinc-500">
                No hay items en este presupuesto.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="px-4 py-4 text-sm text-zinc-700">{item.itemNumber ?? index + 1}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">
                  <Link href={`/rubros/${item.rubroId}/edit?budgetId=${budgetId}`} className="font-semibold text-zinc-950 hover:underline">
                    {item.rubroCodeSnapshot}
                  </Link>
                </td>
                <td className="px-4 py-4 text-sm text-zinc-700">{item.descriptionSnapshot}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{item.unitSnapshot}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{item.quantity.toString()}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{item.indirectPercentageApplied.toString()}%</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{item.directCostSnapshot.toString()}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{item.unitPriceSnapshot.toString()}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">{getItemSubtotal(item).toString()}</td>
                <td className="px-4 py-4 text-sm text-zinc-700">
                  <form action={deleteAction}>
                    <input type="hidden" name="budgetId" value={budgetId} />
                    <input type="hidden" name="budgetItemId" value={item.id} />
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
