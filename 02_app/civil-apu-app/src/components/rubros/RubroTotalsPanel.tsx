'use client'

import { useEffect, useMemo, useState } from 'react'
import { calculateIndirectCost, calculateUnitPrice } from '@/src/lib/calculations/apu'

type RubroTotalsPanelProps = {
  materialsSubtotal: number
  laborSubtotal: number
  equipmentSubtotal: number
  transportSubtotal: number
  directCost: number
  indirectPercentage: number
  variant?: 'default' | 'sidebar'
}

const moneyFormatter = new Intl.NumberFormat('es-EC', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

export default function RubroTotalsPanel({
  materialsSubtotal,
  laborSubtotal,
  equipmentSubtotal,
  transportSubtotal,
  directCost,
  indirectPercentage,
  variant = 'default',
}: RubroTotalsPanelProps) {
  const [currentIndirectPercentage, setCurrentIndirectPercentage] = useState(indirectPercentage)

  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('input[name="indirectPercentage"]')
    if (!input) return

    const syncIndirectPercentage = () => {
      const nextValue = Number(input.value)
      setCurrentIndirectPercentage(Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0)
    }

    syncIndirectPercentage()
    input.addEventListener('input', syncIndirectPercentage)
    return () => input.removeEventListener('input', syncIndirectPercentage)
  }, [])

  const totals = useMemo(() => {
    const indirectCost = calculateIndirectCost(directCost, currentIndirectPercentage)
    const unitPrice = calculateUnitPrice(directCost, currentIndirectPercentage)

    return {
      indirectCost,
      unitPrice,
    }
  }, [currentIndirectPercentage, directCost])

  const rows = [
    { label: 'Total materiales', value: materialsSubtotal },
    { label: 'Total mano de obra', value: laborSubtotal },
    { label: 'Total equipos', value: equipmentSubtotal },
    { label: 'Total transporte', value: transportSubtotal },
    { label: 'Costo directo', value: directCost },
    { label: 'Costos indirectos', value: totals.indirectCost },
    { label: 'Precio unitario final', value: totals.unitPrice },
  ]

  if (variant === 'sidebar') {
    return (
      <aside className="sticky top-4 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Resumen APU</p>
        </div>

        <div className="divide-y divide-slate-200 text-sm">
          {rows.slice(0, 4).map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">{row.label}</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{formatMoney(row.value)}</span>
            </div>
          ))}

          <div className="grid grid-cols-[1fr_auto] gap-3 bg-slate-50 px-3 py-2">
            <span className="font-semibold text-slate-700">Costo directo</span>
            <span className="font-mono font-bold tabular-nums text-slate-950">{formatMoney(directCost)}</span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
            <span className="text-slate-600">% indirectos</span>
            <span className="font-mono font-semibold tabular-nums text-slate-950">
              {formatMoney(currentIndirectPercentage)}%
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
            <span className="text-slate-600">Valor indirectos</span>
            <span className="font-mono font-semibold tabular-nums text-slate-950">
              {formatMoney(totals.indirectCost)}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 bg-blue-50 px-3 py-3">
            <span className="font-bold text-blue-950">Precio unitario final</span>
            <span className="font-mono text-lg font-bold tabular-nums text-blue-950">
              {formatMoney(totals.unitPrice)}
            </span>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Resumen APU</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Totales del rubro</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">{row.label}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-950">{formatMoney(row.value)}</p>
          </div>
        ))}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm text-zinc-500">Porcentaje de costos indirectos</p>
          <p className="mt-1 text-xl font-semibold text-zinc-950">{formatMoney(currentIndirectPercentage)}%</p>
        </div>
      </div>
    </section>
  )
}
