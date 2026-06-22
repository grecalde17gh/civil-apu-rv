'use client'

import { useMemo, useState } from 'react'
import type {
  BudgetConsolidation,
  ConsolidatedEquipment,
  ConsolidatedLabor,
  ConsolidatedMaterial,
  ConsolidatedTransport,
} from '@/src/lib/calculations/budgetConsolidation'
import type { IpcoDenomination } from '@prisma/client'

type BudgetIpcoComponentType = 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'TRANSPORT'
type IpcoAction = (formData: FormData) => void | Promise<void>

type DenominationComponentRow = {
  key: string
  type: string
  code: string
  description: string
  unit: string
  totalCost: number
  denomination: string
  denominationId: string
  originalDenomination: string
  originalDenominationId: string
  isDenominationOverride: boolean
  componentType: BudgetIpcoComponentType
  componentIds: string[]
}

type DenominationSummaryRow = {
  key: string
  label: string
  denominationId: string
  totalCost: number
  percentage: number
  componentCount: number
  components: DenominationComponentRow[]
}

type PendingChange = {
  componentType: BudgetIpcoComponentType
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

const MAX_DENOMINATIONS = 10
const NON_MAIN_LIMIT_PERCENTAGE = 10
const NON_MAIN_NAME = 'componentes no principales'

function formatNumber(value: number) {
  return value.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercentage(value: number) {
  return `${value.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function buildComponentRows(consolidation: BudgetConsolidation): DenominationComponentRow[] {
  return [
    ...consolidation.materials.map((row) => toComponentRow(row, 'Material', `material-${row.key}`)),
    ...consolidation.labor.map((row) => toComponentRow(row, 'Mano de obra', `labor-${row.key}`)),
    ...consolidation.equipment.map((row) => toComponentRow(row, 'Equipo', `equipment-${row.key}`)),
    ...consolidation.transport.map((row) => toComponentRow(row, 'Transporte', `transport-${row.key}`)),
  ]
}

function toComponentRow(
  row: ConsolidatedMaterial | ConsolidatedLabor | ConsolidatedEquipment | ConsolidatedTransport,
  type: string,
  key: string,
): DenominationComponentRow {
  return {
    key,
    type,
    code: row.code,
    description: row.description,
    unit: row.unit,
    totalCost: row.totalCost,
    denomination: row.denomination || 'Sin denominacion IPCO',
    denominationId: row.denominationId,
    originalDenomination: row.originalDenomination,
    originalDenominationId: row.originalDenominationId,
    isDenominationOverride: row.isDenominationOverride,
    componentType: row.componentType,
    componentIds: row.componentIds,
  }
}

function buildDenominationRows(rows: DenominationComponentRow[], directCostTotal: number): DenominationSummaryRow[] {
  const byDenomination = new Map<string, DenominationSummaryRow>()

  for (const row of rows) {
    const key = row.denominationId || normalize(row.denomination) || 'sin-ipco'
    const existing = byDenomination.get(key)

    if (existing) {
      existing.totalCost += row.totalCost
      existing.componentCount += row.componentIds.length
      existing.components.push(row)
      continue
    }

    byDenomination.set(key, {
      key,
      label: row.denomination,
      denominationId: row.denominationId,
      totalCost: row.totalCost,
      percentage: 0,
      componentCount: row.componentIds.length,
      components: [row],
    })
  }

  return [...byDenomination.values()]
    .map((row) => ({
      ...row,
      totalCost: roundMoney(row.totalCost),
      percentage: directCostTotal > 0 ? (row.totalCost / directCostTotal) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage || a.label.localeCompare(b.label))
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function updateSelectedIpco(current: Record<string, string>, row: DenominationComponentRow, denominationId: string) {
  if (denominationId === row.denominationId) {
    const next = { ...current }
    delete next[row.key]
    return next
  }

  return { ...current, [row.key]: denominationId }
}

function buildPendingChanges(rows: DenominationComponentRow[], selectedIpcoByRow: Record<string, string>): PendingChange[] {
  return rows
    .map((row) => ({
      row,
      denominationId: selectedIpcoByRow[row.key] ?? row.denominationId,
    }))
    .filter(({ row, denominationId }) => denominationId !== row.denominationId)
    .map(({ row, denominationId }) => ({
      componentType: row.componentType,
      componentIds: row.componentIds,
      denominationId: denominationId || null,
      originalDenominationId: row.originalDenominationId || null,
    }))
}

function isNonMainDenomination(label: string) {
  return normalize(label).includes(NON_MAIN_NAME)
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
  const componentRows = useMemo(() => buildComponentRows(consolidation), [consolidation])
  const denominationRows = useMemo(
    () => buildDenominationRows(componentRows, directCostTotal),
    [componentRows, directCostTotal],
  )
  const [selectedIpcoByRow, setSelectedIpcoByRow] = useState<Record<string, string>>({})
  const pendingChanges = buildPendingChanges(componentRows, selectedIpcoByRow)
  const nonMainRow = denominationRows.find((row) => isNonMainDenomination(row.label))
  const denominationCount = denominationRows.length
  const requiresRecategorization = denominationCount > MAX_DENOMINATIONS
  const nonMainPercentage = nonMainRow?.percentage ?? 0
  const nonMainTooHigh = nonMainPercentage > NON_MAIN_LIMIT_PERCENTAGE
  const formulaStatus = requiresRecategorization || nonMainTooHigh ? 'Requiere ajuste' : 'OK'

  function setRowIpco(row: DenominationComponentRow, denominationId: string) {
    setSelectedIpcoByRow((current) => updateSelectedIpco(current, row, denominationId))
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Resumen denominaciones IPCO</p>
        </div>
        <div className="grid gap-px bg-slate-200 md:grid-cols-4">
          <SummaryCell label="Total denominaciones usadas" value={String(denominationCount)} />
          <SummaryCell label="Maximo permitido" value={String(MAX_DENOMINATIONS)} />
          <SummaryCell label="Componentes no principales" value={formatPercentage(nonMainPercentage)} />
          <SummaryCell label="Estado formula polinomica" value={formulaStatus} tone={formulaStatus === 'OK' ? 'ok' : 'warning'} />
        </div>
      </section>

      {requiresRecategorization ? (
        <Alert tone="warning">
          El presupuesto tiene mas de 10 denominaciones IPCO. Debe recategorizar componentes antes de generar la formula polinomica.
        </Alert>
      ) : null}
      {nonMainTooHigh ? (
        <Alert tone="danger">Componentes no principales supera el 10% permitido.</Alert>
      ) : null}

      <form action={saveIpcoAction} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-300 bg-white px-3 py-2 shadow-sm">
        <input type="hidden" name="budgetId" value={budgetId} />
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="tab" value={currentTab} />
        <input type="hidden" name="changes" value={JSON.stringify(pendingChanges)} />
        <p className="text-xs text-slate-600">
          {pendingChanges.length === 0 ? 'Sin recategorizaciones pendientes.' : `${pendingChanges.length} recategorizacion(es) pendiente(s).`}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Denominaciones para formula polinomica</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">No.</th>
                <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominacion IPCO</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total consolidado</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Porcentaje sobre presupuesto</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad de componentes</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {denominationRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">
                    No existen denominaciones IPCO usadas en este presupuesto.
                  </td>
                </tr>
              ) : (
                denominationRows.map((row, index) => (
                  <tr key={row.key} className="hover:bg-blue-50/60">
                    <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{index + 1}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">{row.label}</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.totalCost)}</td>
                    <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatPercentage(row.percentage)}</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.componentCount}</td>
                    <td className="px-3 py-2">
                      <StatusBadge
                        warning={requiresRecategorization || (isNonMainDenomination(row.label) && row.percentage > NON_MAIN_LIMIT_PERCENTAGE)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <a
                        href={`#denomination-components-${index + 1}`}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Ver componentes
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {denominationRows.map((row, index) => (
        <section
          key={row.key}
          id={`denomination-components-${index + 1}`}
          className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white">
              {index + 1}. {row.label}
            </p>
            <p className="text-xs font-semibold text-blue-100">{formatPercentage(row.percentage)}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tipo</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                  <th className="min-w-[300px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total</th>
                  <th className="min-w-[280px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Recategorizar IPCO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {row.components.map((component) => {
                  const selectedValue = selectedIpcoByRow[component.key] ?? component.denominationId
                  const selectedDenomination = denominations.find((denomination) => denomination.id === selectedValue)
                  const isPending = selectedValue !== component.denominationId
                  const isManual = isPending
                    ? selectedValue !== component.originalDenominationId
                    : component.isDenominationOverride

                  return (
                    <tr key={component.key} className="hover:bg-blue-50/60">
                      <td className="px-3 py-2 font-semibold text-slate-800">{component.type}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{component.code}</td>
                      <td className="px-3 py-2 text-slate-800">{component.description}</td>
                      <td className="px-3 py-2 text-slate-700">{component.unit}</td>
                      <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatNumber(component.totalCost)}</td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{selectedDenomination?.name ?? component.denomination}</span>
                            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              isManual
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            }`}
                            >
                              {isManual ? 'Manual' : 'Catalogo'}
                            </span>
                            {isPending ? (
                              <span className="rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                                Pendiente
                              </span>
                            ) : null}
                          </div>
                          {isManual && component.originalDenomination ? (
                            <p className="text-[11px] text-slate-500">Original: {component.originalDenomination}</p>
                          ) : null}
                          <select
                            value={selectedValue}
                            onChange={(event) => setRowIpco(component, event.target.value)}
                            className="h-8 min-w-[230px] rounded border border-slate-300 bg-white px-2 text-xs text-slate-800"
                          >
                            <option value="">Seleccionar IPCO</option>
                            {denominations.map((denomination) => (
                              <option key={denomination.id} value={denomination.id}>
                                {[denomination.code, denomination.name].filter(Boolean).join(' - ')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

function SummaryCell({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'ok' | 'warning' }) {
  const valueClass = tone === 'ok' ? 'text-emerald-800' : tone === 'warning' ? 'text-amber-800' : 'text-slate-950'

  return (
    <div className="bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  )
}

function Alert({ children, tone }: { children: string; tone: 'warning' | 'danger' }) {
  const className = tone === 'danger'
    ? 'border-red-300 bg-red-50 text-red-900'
    : 'border-amber-300 bg-amber-50 text-amber-900'

  return (
    <div className={`rounded border px-3 py-2 text-sm font-semibold ${className}`}>
      {children}
    </div>
  )
}

function StatusBadge({ warning }: { warning: boolean }) {
  return warning ? (
    <span className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
      Requiere recategorizacion
    </span>
  ) : (
    <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
      OK
    </span>
  )
}
