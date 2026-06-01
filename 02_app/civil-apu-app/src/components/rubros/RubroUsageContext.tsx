import Link from 'next/link'
import type { getRubroUsageContexts } from '@/src/lib/db/rubros'

type RubroUsageContextProps = {
  contexts: Awaited<ReturnType<typeof getRubroUsageContexts>>
}

export default function RubroUsageContext({ contexts }: RubroUsageContextProps) {
  if (contexts.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Uso en presupuestos</p>
        <p className="mt-2 text-sm text-zinc-600">Este rubro todavia no esta asociado a ningun presupuesto.</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Uso en presupuestos</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Proyecto y presupuesto asociados</h2>
      </div>

      <div className="space-y-3">
        {contexts.map((context) => (
          <div key={context.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-950">{context.budget.project.name}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Presupuesto: {context.budget.name} - Item {context.itemNumber}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Indirectos aplicados en este item: {context.indirectPercentageApplied.toString()}%
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Costo directo snapshot: {context.directCostSnapshot.toString()} - Precio unitario snapshot: {context.unitPriceSnapshot.toString()}
                </p>
              </div>
              <Link
                href={`/projects/${context.budget.projectId}/budgets/${context.budgetId}/edit`}
                className="inline-flex rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                Ver presupuesto
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
