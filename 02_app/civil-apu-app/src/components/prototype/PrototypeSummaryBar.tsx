import type { ReactNode } from 'react'

export function PrototypeSummaryBar({ children }: { children: ReactNode }) {
  return <div className="grid gap-px border border-slate-400 bg-slate-300 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

export function PrototypeSummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{value}</p>
    </div>
  )
}
