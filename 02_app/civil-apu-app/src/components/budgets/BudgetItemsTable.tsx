import type { BudgetItem } from '@prisma/client'
import Link from 'next/link'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'

type BudgetItemsTableProps = {
  items: BudgetItem[]
  budgetId: string
  projectId?: string
  deleteAction: (formData: FormData) => Promise<void>
  updateQuantityAction: (formData: FormData) => Promise<void>
}

function getItemSubtotal(item: BudgetItem) {
  const subtotalSnapshot = Number(item.subtotalSnapshot.toString())
  return subtotalSnapshot > 0 ? item.subtotalSnapshot : item.totalPrice
}

export default function BudgetItemsTable({ items, budgetId, projectId, deleteAction, updateQuantityAction }: BudgetItemsTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">Tabla del presupuesto</p>
        <ExportVisibleTableButton tableId="budget-items-table" fileName="rubros-del-presupuesto" />
      </div>
      <div className="overflow-x-auto">
      <table id="budget-items-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">No.</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
            <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">VAE</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo dir.</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Indirectos</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">P. unitario</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">P. total</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-3 py-10 text-center text-sm text-slate-500">
                No hay items en este presupuesto.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/60">
                <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{item.itemNumber ?? index + 1}</td>
                <td className="px-3 py-2 font-mono text-slate-700">
                  <Link href={`/rubros/${item.rubroId}/edit?budgetId=${budgetId}`} className="font-semibold text-blue-900 hover:underline">
                    {item.rubroCodeSnapshot}
                  </Link>
                </td>
                <td className="px-3 py-2 text-slate-800">{item.descriptionSnapshot}</td>
                <td className="px-3 py-2 text-slate-700">{item.unitSnapshot}</td>
                <td className="px-3 py-2 text-slate-700">Pendiente</td>
                <td className="px-3 py-2">
                  <form action={updateQuantityAction} className="flex min-w-40 items-center gap-2">
                    <input type="hidden" name="budgetId" value={budgetId} />
                    <input type="hidden" name="budgetItemId" value={item.id} />
                    {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
                    <input
                      name="quantity"
                      defaultValue={item.quantity.toString()}
                      required
                      inputMode="decimal"
                      className="h-7 w-24 rounded border border-slate-300 px-2 text-right font-mono text-xs tabular-nums text-slate-800"
                    />
                    <button type="submit" className="h-7 rounded border border-slate-300 px-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100">
                      Guardar
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{item.directCostSnapshot.toString()}</td>
                <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{item.indirectPercentageApplied.toString()}%</td>
                <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{item.unitPriceSnapshot.toString()}</td>
                <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{getItemSubtotal(item).toString()}</td>
                <td className="px-3 py-2 text-slate-700">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/rubros/${item.rubroId}/edit?budgetId=${budgetId}`}
                      className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Editar
                    </Link>
                    <form action={deleteAction}>
                      <input type="hidden" name="budgetId" value={budgetId} />
                      <input type="hidden" name="budgetItemId" value={item.id} />
                      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
                      <button type="submit" className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-rose-700">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
