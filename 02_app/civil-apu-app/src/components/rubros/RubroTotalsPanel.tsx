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
