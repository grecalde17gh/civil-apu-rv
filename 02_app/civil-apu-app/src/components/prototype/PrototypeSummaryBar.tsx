import type { ReactNode } from 'react'

export function PrototypeSummaryBar({ children }: { children: ReactNode }) {
  return <div className="grid gap-px border border-[#6f7f94] bg-[#9aa8ba] sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

export function PrototypeSummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[#f8fafc] to-[#e4ebf5] px-2 py-1 shadow-[inset_0_1px_0_white]">
      <p className="text-[10px] font-semibold uppercase text-slate-600">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-950">{value}</p>
    </div>
  )
}
