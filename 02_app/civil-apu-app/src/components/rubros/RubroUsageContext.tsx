import Link from 'next/link'
import type { getRubroUsageContexts } from '@/src/lib/db/rubros'

type RubroUsageContextProps = {
  contexts: Awaited<ReturnType<typeof getRubroUsageContexts>>
}

export default function RubroUsageContext({ contexts }: RubroUsageContextProps) {
  if (contexts.length === 0) {
    return (
      <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Uso en presupuestos</p>
        </div>
        <p className="px-3 py-5 text-sm text-slate-500">Este rubro todavia no esta asociado a ningun presupuesto.</p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">Uso en presupuestos</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Proyecto</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Presupuesto</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Item</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Indirectos</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo directo</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio unitario</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {contexts.map((context) => (
              <tr key={context.id} className="hover:bg-blue-50/60">
                <td className="px-3 py-2 font-semibold text-slate-900">{context.budget.project.name}</td>
                <td className="px-3 py-2 text-slate-700">{context.budget.name}</td>
                <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{context.itemNumber}</td>
                <td className="px-3 py-2 font-mono tabular-nums text-slate-700">
                  {context.indirectPercentageApplied.toString()}%
                </td>
                <td className="px-3 py-2 font-mono tabular-nums text-slate-700">
                  {context.directCostSnapshot.toString()}
                </td>
                <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">
                  {context.unitPriceSnapshot.toString()}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/projects/${context.budget.projectId}/budgets/${context.budgetId}/edit`}
                    className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Ver presupuesto
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
