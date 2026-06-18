'use client'

import { Fragment, useActionState, useMemo, useState } from 'react'
import {
  buildScheduleRowValues,
  calculateScheduleSummary,
  DEFAULT_SCHEDULE_WEEK_COUNT,
  MAX_SCHEDULE_WEEK_COUNT,
} from '@/src/lib/calculations/budgetSchedule'
import type { BudgetScheduleActionState } from '@/app/projects/[projectId]/budgets/actions'

export type BudgetScheduleRow = {
  budgetItemId: string
  itemNumber: string | null
  code: string
  description: string
  unit: string
  quantity: string
  totalAmount: number
  groupName: string
  startWeek: number | null
  endWeek: number | null
}

type BudgetScheduleTableProps = {
  budgetId: string
  projectId: string
  initialWeekCount?: number
  rows: BudgetScheduleRow[]
  action: (previousState: BudgetScheduleActionState, formData: FormData) => Promise<BudgetScheduleActionState>
}

type DragState = {
  budgetItemId: string
  startWeek: number
  currentWeek: number
} | null

function formatMoney(value: number): string {
  if (value === 0) return ''

  return value.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

function normalizeWeekCount(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SCHEDULE_WEEK_COUNT
  return Math.min(Math.max(Math.trunc(value), 1), MAX_SCHEDULE_WEEK_COUNT)
}

export default function BudgetScheduleTable({
  budgetId,
  projectId,
  initialWeekCount = DEFAULT_SCHEDULE_WEEK_COUNT,
  rows,
  action,
}: BudgetScheduleTableProps) {
  const [state, formAction, isPending] = useActionState(action, { ok: true, message: null })
  const [weekCount, setWeekCount] = useState(normalizeWeekCount(initialWeekCount))
  const [entries, setEntries] = useState(
    rows.map((row) => ({
      ...row,
      groupName: row.groupName.trim() || 'Grupo 1',
    })),
  )
  const [dragState, setDragState] = useState<DragState>(null)

  const weeks = useMemo(() => Array.from({ length: weekCount }, (_, index) => index + 1), [weekCount])
  const rowsWithValues = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        values: buildScheduleRowValues({
          weekCount,
          totalAmount: entry.totalAmount,
          startWeek: entry.startWeek,
          endWeek: entry.endWeek,
        }),
      })),
    [entries, weekCount],
  )
  const groupedRows = useMemo(() => {
    const groups = new Map<string, typeof rowsWithValues>()

    rowsWithValues.forEach((row) => {
      const groupName = row.groupName.trim() || 'Grupo 1'
      groups.set(groupName, [...(groups.get(groupName) ?? []), row])
    })

    return [...groups.entries()]
  }, [rowsWithValues])
  const summary = useMemo(() => calculateScheduleSummary(rowsWithValues.map((row) => row.values)), [rowsWithValues])
  const entriesPayload = useMemo(
    () =>
      JSON.stringify(
        entries.map((entry) => ({
          budgetItemId: entry.budgetItemId,
          groupName: entry.groupName,
          startWeek: entry.startWeek,
          endWeek: entry.endWeek,
        })),
      ),
    [entries],
  )

  function updateWeekCount(nextValue: number) {
    const nextWeekCount = normalizeWeekCount(nextValue)
    const hasOutOfRangeSelection = entries.some(
      (entry) => (entry.startWeek !== null && entry.startWeek > nextWeekCount) || (entry.endWeek !== null && entry.endWeek > nextWeekCount),
    )

    if (nextWeekCount < weekCount && hasOutOfRangeSelection) {
      const confirmed = window.confirm('Reducir semanas eliminara selecciones fuera del nuevo rango. ¿Desea continuar?')
      if (!confirmed) return
    }

    setWeekCount(nextWeekCount)
    setEntries((current) =>
      current.map((entry) =>
        entry.startWeek !== null && entry.endWeek !== null && entry.endWeek > nextWeekCount
          ? { ...entry, startWeek: null, endWeek: null }
          : entry,
      ),
    )
  }

  function updateGroupName(budgetItemId: string, groupName: string) {
    setEntries((current) =>
      current.map((entry) => (entry.budgetItemId === budgetItemId ? { ...entry, groupName } : entry)),
    )
  }

  function setRange(budgetItemId: string, startWeek: number | null, endWeek: number | null) {
    setEntries((current) =>
      current.map((entry) => (entry.budgetItemId === budgetItemId ? { ...entry, startWeek, endWeek } : entry)),
    )
  }

  function commitDrag() {
    if (!dragState) return

    setRange(
      dragState.budgetItemId,
      Math.min(dragState.startWeek, dragState.currentWeek),
      Math.max(dragState.startWeek, dragState.currentWeek),
    )
    setDragState(null)
  }

  function isSelected(row: BudgetScheduleRow, week: number) {
    if (
      dragState &&
      dragState.budgetItemId === row.budgetItemId &&
      week >= Math.min(dragState.startWeek, dragState.currentWeek) &&
      week <= Math.max(dragState.startWeek, dragState.currentWeek)
    ) {
      return true
    }

    return row.startWeek !== null && row.endWeek !== null && week >= row.startWeek && week <= row.endWeek
  }

  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2 text-white xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Cronograma valorado de trabajos</p>
          <h2 className="text-base font-semibold">Distribución semanal del presupuesto</h2>
        </div>

        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="budgetId" value={budgetId} />
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="weekCount" value={weekCount} />
          <input type="hidden" name="entries" value={entriesPayload} />

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">
            Número de semanas
            <input
              type="number"
              min={1}
              max={MAX_SCHEDULE_WEEK_COUNT}
              value={weekCount}
              onChange={(event) => updateWeekCount(Number(event.target.value))}
              className="mt-1 h-8 w-24 rounded border border-slate-500 bg-white px-2 text-sm font-semibold text-slate-950"
            />
          </label>

          <button
            type="button"
            onClick={() => setEntries((current) => current.map((entry) => ({ ...entry, startWeek: null, endWeek: null })))}
            className="h-8 rounded border border-slate-500 bg-slate-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-600"
          >
            Limpiar selección
          </button>

          <a
            href={`/projects/${projectId}/budgets/${budgetId}/schedule/export`}
            className="inline-flex h-8 items-center rounded border border-emerald-300 bg-emerald-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-800"
          >
            Exportar Excel
          </a>

          <button
            type="submit"
            disabled={isPending}
            className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:bg-blue-400"
          >
            Guardar cronograma
          </button>
        </form>
      </div>

      {state.message ? (
        <div className={`border-b px-3 py-2 text-sm font-medium ${state.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
          {state.message}
        </div>
      ) : null}

      <div className="overflow-x-auto" onMouseUp={commitDrag} onMouseLeave={commitDrag}>
        <table className="min-w-full select-none divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="sticky left-0 z-20 min-w-[420px] border-r border-slate-300 bg-slate-100 px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">
                Rubro / Descripción
              </th>
              {weeks.map((week) => (
                <th key={week} className="min-w-28 px-3 py-2 text-center font-semibold uppercase tracking-wide text-slate-600">
                  Semana {week}
                </th>
              ))}
              <th className="min-w-32 px-3 py-2 text-right font-semibold uppercase tracking-wide text-slate-600">Total rubro</th>
              <th className="min-w-24 px-3 py-2 text-center font-semibold uppercase tracking-wide text-slate-600">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {groupedRows.length === 0 ? (
              <tr>
                <td colSpan={weekCount + 3} className="px-3 py-10 text-center text-sm text-slate-500">
                  No hay rubros en este presupuesto.
                </td>
              </tr>
            ) : (
              groupedRows.map(([groupName, groupRows]) => (
                <Fragment key={groupName}>
                  <tr className="bg-blue-50">
                    <td colSpan={weekCount + 3} className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-blue-950">
                      {groupName}
                    </td>
                  </tr>
                  {groupRows.map((row) => (
                    <tr key={row.budgetItemId} className="hover:bg-blue-50/50">
                      <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2 align-top">
                        <div className="grid gap-2 md:grid-cols-[170px_minmax(0,1fr)]">
                          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Grupo
                            <input
                              value={row.groupName}
                              onChange={(event) => updateGroupName(row.budgetItemId, event.target.value)}
                              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm normal-case tracking-normal text-slate-950"
                            />
                          </label>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-950">
                              {row.itemNumber ? `${row.itemNumber}. ` : null}
                              {row.code}
                            </p>
                            <p className="line-clamp-2 text-slate-700">{row.description}</p>
                            <p className="mt-1 font-mono text-[11px] text-slate-500">
                              {row.quantity} {row.unit}
                            </p>
                          </div>
                        </div>
                      </td>

                      {weeks.map((week, index) => {
                        const selected = isSelected(row, week)
                        const value = row.values[index] ?? 0

                        return (
                          <td
                            key={week}
                            onMouseDown={() => setDragState({ budgetItemId: row.budgetItemId, startWeek: week, currentWeek: week })}
                            onMouseEnter={() => {
                              if (dragState?.budgetItemId === row.budgetItemId) {
                                setDragState({ ...dragState, currentWeek: week })
                              }
                            }}
                            className={`h-12 cursor-crosshair px-2 py-2 text-center font-mono tabular-nums transition ${
                              selected ? 'bg-blue-700 font-semibold text-white' : 'bg-white text-slate-400 hover:bg-blue-100'
                            }`}
                          >
                            {selected ? formatMoney(value) : ''}
                          </td>
                        )
                      })}

                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums text-slate-950">
                        {formatMoney(row.totalAmount)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => setRange(row.budgetItemId, null, null)}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Limpiar
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))
            )}

            <SummaryRow label="INVERSIÓN PARCIAL" values={summary.weeklyPartial.map(formatMoney)} weekCount={weekCount} />
            <SummaryRow label="PORCENTAJE DE INVERSIÓN PARCIAL" values={summary.weeklyPartialPercent.map(formatPercent)} weekCount={weekCount} />
            <SummaryRow label="INVERSIÓN ACUMULADA" values={summary.accumulated.map(formatMoney)} weekCount={weekCount} />
            <SummaryRow label="PORCENTAJE DE INVERSIÓN ACUMULADA" values={summary.accumulatedPercent.map(formatPercent)} weekCount={weekCount} />
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SummaryRow({ label, values, weekCount }: { label: string; values: string[]; weekCount: number }) {
  return (
    <tr className="bg-slate-100">
      <td className="sticky left-0 z-10 border-r border-slate-300 bg-slate-100 px-3 py-2 font-bold uppercase tracking-wide text-slate-800">
        {label}
      </td>
      {Array.from({ length: weekCount }, (_, index) => (
        <td key={index} className="px-2 py-2 text-center font-mono font-bold tabular-nums text-slate-900">
          {values[index] || ''}
        </td>
      ))}
      <td colSpan={2} className="bg-slate-100" />
    </tr>
  )
}
