'use client'

import { useMemo, useState } from 'react'
import type { IpcoDenomination } from '@prisma/client'
import type { BudgetConsolidation } from '@/src/lib/calculations/budgetConsolidation'
import {
  buildBudgetPolynomialTerms,
  type PolynomialTermComponent,
  type PolynomialTermRow,
} from '@/src/lib/calculations/budgetPolynomialTerms'

type IpcoAction = (formData: FormData) => void | Promise<void>
type PendingChange = {
  componentType: PolynomialTermComponent['componentType']
  componentIds: string[]
  denominationId: string | null
  originalDenominationId: string | null
}

type BudgetDenominationsTableProps = {
  consolidation: BudgetConsolidation
  directCostTotal: number
  budgetId: string
  projectId: string
  denominations: IpcoDenomination[]
  currentTab: string
  saveIpcoAction: IpcoAction
}

function formatNumber(value: number) {
  return value.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCoefficient(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 })
}

function updateSelectedIpco(current: Record<string, string>, component: PolynomialTermComponent, denominationId: string) {
  if (denominationId === component.denominationId) {
    const next = { ...current }
    delete next[component.key]
    return next
  }

  return { ...current, [component.key]: denominationId }
}

function buildPendingChanges(rows: PolynomialTermRow[], selectedIpcoByComponent: Record<string, string>): PendingChange[] {
  return rows.flatMap((row) => row.components)
    .map((component) => ({ component, denominationId: selectedIpcoByComponent[component.key] ?? component.denominationId }))
    .filter(({ component, denominationId }) => denominationId !== component.denominationId)
    .map(({ component, denominationId }) => ({
      componentType: component.componentType,
      componentIds: component.componentIds,
      denominationId: denominationId || null,
      originalDenominationId: component.originalDenominationId || null,
    }))
}

export default function BudgetDenominationsTable({
  consolidation,
  directCostTotal,
  budgetId,
  projectId,
  denominations,
  currentTab,
  saveIpcoAction,
}: BudgetDenominationsTableProps) {
  const formula = useMemo(
    () => buildBudgetPolynomialTerms(consolidation, directCostTotal),
    [consolidation, directCostTotal],
  )
  const [selectedIpcoByComponent, setSelectedIpcoByComponent] = useState<Record<string, string>>({})
  const pendingChanges = buildPendingChanges(formula.rows, selectedIpcoByComponent)
  const formulaStatus = formula.exceedsTermLimit || formula.exceedsTermXLimit ? 'Requiere ajuste' : 'OK'
  const formulaTotalCost = formula.rows.reduce((sum, row) => sum + row.totalCost, 0)
  const formulaCoefficientTotal = formula.rows.reduce((sum, row) => sum + row.percentage / 100, 0)
  const laborCrewCoefficientTotal = formula.laborCrew.reduce((sum, row) => sum + row.coefficient, 0)

  function setComponentIpco(component: PolynomialTermComponent, denominationId: string) {
    setSelectedIpcoByComponent((current) => updateSelectedIpco(current, component, denominationId))
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Términos para fórmula polinómica</p>
        </div>
        <div className="grid gap-px bg-slate-200 md:grid-cols-4">
          <SummaryCell label="Términos usados" value={String(formula.rows.length)} />
          <SummaryCell label="Máximo permitido" value="10" />
          <SummaryCell label="Término X" value={formatCoefficient(formula.termXPercentage / 100)} />
          <SummaryCell label="Estado fórmula polinómica" value={formulaStatus} tone={formulaStatus === 'OK' ? 'ok' : 'warning'} />
        </div>
      </section>

      {formula.exceedsTermLimit ? (
        <Alert tone="warning">La fórmula polinómica excede el máximo de 10 términos permitidos. Recategorice componentes.</Alert>
      ) : null}
      {formula.exceedsTermXLimit ? (
        <Alert tone="danger">El término X - Componentes no principales supera el 10% permitido.</Alert>
      ) : null}

      <form action={saveIpcoAction} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-300 bg-white px-3 py-2 shadow-sm">
        <input type="hidden" name="budgetId" value={budgetId} />
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="tab" value={currentTab} />
        <input type="hidden" name="changes" value={JSON.stringify(pendingChanges)} />
        <p className="text-xs text-slate-600">
          {pendingChanges.length === 0 ? 'Sin recategorizaciones IPCO pendientes.' : `${pendingChanges.length} recategorización(es) pendiente(s).`}
        </p>
        <button
          type="submit"
          disabled={pendingChanges.length === 0}
          className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          Guardar cambios IPCO
        </button>
      </form>

      <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Términos para fórmula polinómica</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Término</th>
                <th className="min-w-[280px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominación / agrupación</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tipo</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total consolidado</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Coeficiente</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {formula.rows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">No existen componentes consolidados en este presupuesto.</td></tr>
              ) : formula.rows.map((row) => (
                <tr key={row.key} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{row.term ?? '—'}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{row.grouping}</td>
                  <td className="px-3 py-2 text-slate-700">{row.type}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.totalCost)}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatCoefficient(row.percentage / 100)}</td>
                  <td className="px-3 py-2"><StatusBadge warning={row.requiresRecategorization || (row.term === 'X' && formula.exceedsTermXLimit)} /></td>
                  <td className="px-3 py-2">
                    <a href={row.term === 'B' ? '#labor-breakdown' : `#term-components-${row.key}`} className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                      {row.term === 'B' ? 'Ver cuadrilla' : 'Ver componentes'}
                    </a>
                  </td>
                </tr>
              ))}
              {formula.rows.length > 0 ? (
                <tr className="bg-slate-100 font-semibold">
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-950">TOTAL</td>
                  <td className="px-3 py-2 text-slate-900"></td>
                  <td className="px-3 py-2 text-slate-900"></td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-950">{formatNumber(formulaTotalCost)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-950">{formatCoefficient(formulaCoefficientTotal)}</td>
                  <td className="px-3 py-2" colSpan={2}></td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section id="labor-breakdown" className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Cuadrilla Tipo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100"><tr>
              <th className="min-w-[420px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Coeficiente</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {formula.laborCrew.length === 0 ? (
                <tr><td colSpan={2} className="px-3 py-8 text-center text-sm text-slate-500">No existen componentes de mano de obra en este presupuesto.</td></tr>
              ) : formula.laborCrew.map((row) => (
                <tr key={row.key} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-semibold text-slate-900">{row.description}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatCoefficient(row.coefficient)}</td>
                </tr>
              ))}
              {formula.laborCrew.length > 0 ? (
                <tr className="bg-slate-100 font-semibold">
                  <td className="px-3 py-2 text-slate-950">TOTAL</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-950">{formatCoefficient(laborCrewCoefficientTotal)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {formula.rows.map((row) => (
        <TermComponentsTable
          key={row.key}
          row={row}
          denominations={denominations}
          selectedIpcoByComponent={selectedIpcoByComponent}
          onSelectIpco={setComponentIpco}
        />
      ))}
    </div>
  )
}

function TermComponentsTable({ row, denominations, selectedIpcoByComponent, onSelectIpco }: {
  row: PolynomialTermRow
  denominations: IpcoDenomination[]
  selectedIpcoByComponent: Record<string, string>
  onSelectIpco: (component: PolynomialTermComponent, denominationId: string) => void
}) {
  return (
    <section id={`term-components-${row.key}`} className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">{row.term ?? 'Sin término disponible'} · {row.grouping}</p>
        <p className="text-xs font-semibold text-blue-100">{formatCoefficient(row.percentage / 100)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100"><tr>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tipo</th><th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Código</th><th className="min-w-[260px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripción</th><th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th><th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total</th><th className="min-w-[280px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Recategorizar IPCO</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-200">{row.components.map((component) => {
            const selectedValue = selectedIpcoByComponent[component.key] ?? component.denominationId
            const selectedDenomination = denominations.find((denomination) => denomination.id === selectedValue)
            const isPending = selectedValue !== component.denominationId
            return <tr key={component.key} className="hover:bg-blue-50/60">
              <td className="px-3 py-2 font-semibold text-slate-800">{component.type}</td><td className="px-3 py-2 font-mono text-slate-700">{component.code}</td><td className="px-3 py-2 text-slate-800">{component.description}</td><td className="px-3 py-2 text-slate-700">{component.unit}</td><td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatNumber(component.totalCost)}</td>
              <td className="px-3 py-2"><div className="space-y-1"><span>{selectedDenomination ? [selectedDenomination.code, selectedDenomination.name].filter(Boolean).join(' - ') : component.denomination}</span>{isPending ? <span className="ml-2 rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800">Pendiente</span> : null}<select value={selectedValue} onChange={(event) => onSelectIpco(component, event.target.value)} className="block h-8 min-w-[230px] rounded border border-slate-300 bg-white px-2 text-xs text-slate-800"><option value="">Seleccionar IPCO</option>{denominations.map((denomination) => <option key={denomination.id} value={denomination.id}>{[denomination.code, denomination.name].filter(Boolean).join(' - ')}</option>)}</select></div></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </section>
  )
}

function SummaryCell({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'ok' | 'warning' }) {
  const valueClass = tone === 'ok' ? 'text-emerald-800' : tone === 'warning' ? 'text-amber-800' : 'text-slate-950'
  return <div className="bg-white px-3 py-2"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 font-mono text-sm font-semibold tabular-nums ${valueClass}`}>{value}</p></div>
}

function Alert({ children, tone }: { children: string; tone: 'warning' | 'danger' }) {
  const className = tone === 'danger' ? 'border-red-300 bg-red-50 text-red-900' : 'border-amber-300 bg-amber-50 text-amber-900'
  return <div className={`rounded border px-3 py-2 text-sm font-semibold ${className}`}>{children}</div>
}

function StatusBadge({ warning }: { warning: boolean }) {
  return warning ? <span className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">Requiere recategorización</span> : <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">OK</span>
}
