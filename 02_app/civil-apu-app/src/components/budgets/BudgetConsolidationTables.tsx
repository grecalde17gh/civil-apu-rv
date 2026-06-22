'use client'

import type {
  BudgetConsolidation,
  ConsolidatedEquipment,
  ConsolidatedLabor,
  ConsolidatedMaterial,
  ConsolidatedTransport,
} from '@/src/lib/calculations/budgetConsolidation'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'
import type { IpcoDenomination } from '@prisma/client'

type ConsolidationSection = 'materials' | 'labor' | 'equipment' | 'transport'
type BudgetIpcoComponentType = 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'TRANSPORT'
type IpcoAction = (formData: FormData) => void | Promise<void>

type BudgetConsolidationTablesProps = {
  consolidation: BudgetConsolidation
  section: ConsolidationSection
  budgetId: string
  projectId: string
  denominations: IpcoDenomination[]
  currentTab: string
  saveIpcoAction: IpcoAction
  restoreIpcoAction: IpcoAction
}

function formatNumber(value: number) {
  return value.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

function EmptyConsolidationMessage() {
  return (
    <p className="px-3 py-10 text-center text-sm text-slate-500">
      No existen componentes para consolidar en este presupuesto.
    </p>
  )
}

function toNumber(value: string) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function matchesDenomination(value: string, filter: string) {
  return value.toLowerCase().includes(filter.trim().toLowerCase())
}

function TableFrame({ title, tableId, fileName, children }: { title: string; tableId: string; fileName: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">{title}</p>
        <ExportVisibleTableButton tableId={tableId} fileName={fileName} />
      </div>
      {children}
    </section>
  )
}

type IpcoEditableRow = {
  key: string
  componentType: BudgetIpcoComponentType
  componentIds: string[]
  denominationId: string
  originalDenominationId: string
  denomination: string
  originalDenomination: string
  isDenominationOverride: boolean
}

function IpcoEditor({
  row,
  budgetId,
  projectId,
  denominations,
  currentTab,
  restoreIpcoAction,
  selectedValue,
  onChange,
}: {
  row: IpcoEditableRow
  budgetId: string
  projectId: string
  denominations: IpcoDenomination[]
  currentTab: string
  restoreIpcoAction: IpcoAction
  selectedValue: string
  onChange: (value: string) => void
}) {
  const selectedDenomination = denominations.find((denomination) => denomination.id === selectedValue)
  const isPending = selectedValue !== row.denominationId
  const isManual = isPending ? selectedValue !== row.originalDenominationId : row.isDenominationOverride

  return (
    <div className="min-w-[280px] space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span>{selectedDenomination?.name ?? row.denomination ?? '-'}</span>
        {isManual ? (
          <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Manual
          </span>
        ) : (
          <span className="rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            Catalogo
          </span>
        )}
        {isPending ? (
          <span className="rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
            Pendiente
          </span>
        ) : null}
      </div>
      {isManual && row.originalDenomination ? (
        <p className="text-[11px] text-slate-500">Original: {row.originalDenomination}</p>
      ) : null}
      <select
        value={selectedValue}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-[190px] rounded border border-slate-300 bg-white px-2 text-xs text-slate-800"
      >
        <option value="">Seleccionar IPCO</option>
        {denominations.map((denomination) => (
          <option key={denomination.id} value={denomination.id}>
            {[denomination.code, denomination.name].filter(Boolean).join(' - ')}
          </option>
        ))}
      </select>
      {row.isDenominationOverride ? (
        <form action={restoreIpcoAction}>
          <input type="hidden" name="budgetId" value={budgetId} />
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="componentType" value={row.componentType} />
          <input type="hidden" name="componentIds" value={row.componentIds.join(',')} />
          <input type="hidden" name="tab" value={currentTab} />
          <button type="submit" className="text-[11px] font-semibold uppercase tracking-wide text-blue-800 hover:text-blue-950">
            Restaurar IPCO original
          </button>
        </form>
      ) : null}
    </div>
  )
}

type IpcoEditorProps = {
  budgetId: string
  projectId: string
  denominations: IpcoDenomination[]
  currentTab: string
  saveIpcoAction: IpcoAction
  restoreIpcoAction: IpcoAction
}

type StatefulIpcoEditorProps = IpcoEditorProps & {
  selectedIpcoByRow: Record<string, string>
  setRowIpco: (row: IpcoEditableRow, denominationId: string) => void
}

function MaterialsTable({ rows, total, ipcoEditor }: { rows: ConsolidatedMaterial[]; total: number; ipcoEditor: StatefulIpcoEditorProps }) {
  return (
    <TableFrame title="Materiales consolidados" tableId="consolidated-materials-table" fileName="materiales-consolidados">
      {rows.length === 0 ? (
        <EmptyConsolidationMessage />
      ) : (
        <div className="overflow-x-auto">
          <table id="consolidated-materials-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura ocupacional</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo unitario</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominación IPCO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.key} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-mono text-slate-700">{row.code}</td>
                  <td className="px-3 py-2 text-slate-800">{row.description}</td>
                  <td className="px-3 py-2 text-slate-700">{row.unit}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.totalQuantity)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.unitCost)}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatNumber(row.totalCost)}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <IpcoEditor
                      row={row}
                      budgetId={ipcoEditor.budgetId}
                      projectId={ipcoEditor.projectId}
                      denominations={ipcoEditor.denominations}
                      currentTab={ipcoEditor.currentTab}
                      restoreIpcoAction={ipcoEditor.restoreIpcoAction}
                      selectedValue={ipcoEditor.selectedIpcoByRow[row.key] ?? row.denominationId}
                      onChange={(value) => ipcoEditor.setRowIpco(row, value)}
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td colSpan={5} className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-blue-950">
                  Total materiales
                </td>
                <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(total)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </TableFrame>
  )
}

function ResourceTable({
  title,
  totalLabel,
  rows,
  total,
  ipcoEditor,
}: {
  title: string
  totalLabel: string
  rows: Array<ConsolidatedLabor | ConsolidatedEquipment>
  total: number
  ipcoEditor: StatefulIpcoEditorProps
}) {
  return (
    <TableFrame title={title} tableId={title.includes('Mano') ? 'consolidated-labor-table' : 'consolidated-equipment-table'} fileName={title.includes('Mano') ? 'mano-de-obra-consolidada' : 'equipos-consolidados'}>
      {rows.length === 0 ? (
        <EmptyConsolidationMessage />
      ) : (
        <div className="overflow-x-auto">
          <table id={title.includes('Mano') ? 'consolidated-labor-table' : 'consolidated-equipment-table'} className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura ocupacional</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tarifa</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominación IPCO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.key} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-mono text-slate-700">{row.code}</td>
                  <td className="px-3 py-2 text-slate-800">{row.description}</td>
                  <td className="px-3 py-2 text-slate-700">{row.unit}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.totalQuantity)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.unitCost)}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatNumber(row.totalCost)}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <IpcoEditor
                      row={row}
                      budgetId={ipcoEditor.budgetId}
                      projectId={ipcoEditor.projectId}
                      denominations={ipcoEditor.denominations}
                      currentTab={ipcoEditor.currentTab}
                      restoreIpcoAction={ipcoEditor.restoreIpcoAction}
                      selectedValue={ipcoEditor.selectedIpcoByRow[row.key] ?? row.denominationId}
                      onChange={(value) => ipcoEditor.setRowIpco(row, value)}
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td colSpan={5} className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-blue-950">
                  {totalLabel}
                </td>
                <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(total)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </TableFrame>
  )
}

function TransportTable({ rows, total, ipcoEditor }: { rows: ConsolidatedTransport[]; total: number; ipcoEditor: StatefulIpcoEditorProps }) {
  return (
    <TableFrame title="Transporte consolidado" tableId="consolidated-transport-table" fileName="transporte-consolidado">
      <div className="overflow-x-auto">
        <table id="consolidated-transport-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
              <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estructura ocupacional</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad total</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Distancia</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tarifa</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo total</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominación IPCO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-500">
                  No existen componentes para consolidar en este presupuesto.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-mono text-slate-700">{row.code}</td>
                  <td className="px-3 py-2 text-slate-800">{row.description}</td>
                  <td className="px-3 py-2 text-slate-700">{row.unit}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.totalQuantity)}</td>
                  <td className="px-3 py-2 text-slate-700">{row.distance}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.unitCost)}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatNumber(row.totalCost)}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <IpcoEditor
                      row={row}
                      budgetId={ipcoEditor.budgetId}
                      projectId={ipcoEditor.projectId}
                      denominations={ipcoEditor.denominations}
                      currentTab={ipcoEditor.currentTab}
                      restoreIpcoAction={ipcoEditor.restoreIpcoAction}
                      selectedValue={ipcoEditor.selectedIpcoByRow[row.key] ?? row.denominationId}
                      onChange={(value) => ipcoEditor.setRowIpco(row, value)}
                    />
                  </td>
                </tr>
              ))
            )}
            <tr className="bg-blue-50">
              <td colSpan={6} className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-blue-950">
                Total transporte
              </td>
              <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(total)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </TableFrame>
  )
}

type GeneralComponentRow = {
  key: string
  type: string
  code: string
  description: string
  unit: string
  totalQuantity: number
  unitCost: number
  totalCost: number
  vae: string
  cpc: string
  denomination: string
  denominationId: string
  originalDenomination: string
  originalDenominationId: string
  isDenominationOverride: boolean
  componentType: BudgetIpcoComponentType
  componentIds: string[]
}

function buildGeneralRows(consolidation: BudgetConsolidation): GeneralComponentRow[] {
  return [
    ...consolidation.materials.map((row) => ({ ...row, type: 'Material', key: `material-${row.key}` })),
    ...consolidation.labor.map((row) => ({ ...row, type: 'Mano de obra', key: `labor-${row.key}` })),
    ...consolidation.equipment.map((row) => ({ ...row, type: 'Equipo', key: `equipment-${row.key}` })),
    ...consolidation.transport.map((row) => ({ ...row, type: 'Transporte', key: `transport-${row.key}` })),
  ]
}

function updateSelectedIpco(current: Record<string, string>, row: IpcoEditableRow, denominationId: string) {
  if (denominationId === row.denominationId) {
    const next = { ...current }
    delete next[row.key]
    return next
  }

  return { ...current, [row.key]: denominationId }
}

function buildPendingIpcoChanges(rows: IpcoEditableRow[], selectedIpcoByRow: Record<string, string>) {
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

export function GeneralComponentsTable({
  consolidation,
  denominationFilter = '',
  ipcoEditor,
}: {
  consolidation: BudgetConsolidation
  denominationFilter?: string
  ipcoEditor: IpcoEditorProps
}) {
  const allRows = useMemo(() => buildGeneralRows(consolidation), [consolidation])
  const [selectedIpcoByRow, setSelectedIpcoByRow] = useState<Record<string, string>>({})
  const pendingChanges = buildPendingIpcoChanges(allRows, selectedIpcoByRow)
  const statefulIpcoEditor = {
    ...ipcoEditor,
    selectedIpcoByRow,
    setRowIpco: (row: IpcoEditableRow, denominationId: string) => {
      setSelectedIpcoByRow((current) => updateSelectedIpco(current, row, denominationId))
    },
  }
  const rows = allRows.filter((row) =>
    denominationFilter.trim() === '' ? true : matchesDenomination(row.denomination, denominationFilter),
  )
  const totalCost = rows.reduce((sum, row) => sum + row.totalCost, 0)
  const totalVae = rows.reduce((sum, row) => sum + toNumber(row.vae), 0)

  return (
    <TableFrame title="Componentes consolidados generales" tableId="general-components-table" fileName="componentes-consolidados">
      <form className="grid gap-2 border-b border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(240px,360px)_auto]">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Filtrar por Denominación IPCO
          <input
            name="denomination"
            defaultValue={denominationFilter}
            placeholder="Código o nombre IPCO"
            className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm normal-case tracking-normal"
          />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800">
            Filtrar
          </button>
          <a href="?" className="inline-flex h-8 items-center rounded border border-slate-300 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-slate-800 transition hover:bg-slate-100">
            Limpiar
          </a>
        </div>
      </form>
      <div className="border-b border-slate-200 bg-slate-50 p-3">
        <IpcoBulkSaveBar
          budgetId={ipcoEditor.budgetId}
          projectId={ipcoEditor.projectId}
          currentTab={ipcoEditor.currentTab}
          pendingCount={pendingChanges.length}
          changes={pendingChanges}
          saveIpcoAction={ipcoEditor.saveIpcoAction}
        />
      </div>

      <div className="overflow-x-auto">
        <table id="general-components-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tipo</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Código</th>
              <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripción</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad consolidada</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio unitario</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Total</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">VAE</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">CPC</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Denominación IPCO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-sm text-slate-500">
                  No existen componentes para consolidar en este presupuesto.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-semibold text-slate-800">{row.type}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{row.code}</td>
                  <td className="px-3 py-2 text-slate-800">{row.description}</td>
                  <td className="px-3 py-2 text-slate-700">{row.unit}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.totalQuantity)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.unitCost)}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatNumber(row.totalCost)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.vae}</td>
                  <td className="px-3 py-2 text-slate-700">{row.cpc}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <IpcoEditor
                      row={row}
                      budgetId={statefulIpcoEditor.budgetId}
                      projectId={statefulIpcoEditor.projectId}
                      denominations={statefulIpcoEditor.denominations}
                      currentTab={statefulIpcoEditor.currentTab}
                      restoreIpcoAction={statefulIpcoEditor.restoreIpcoAction}
                      selectedValue={statefulIpcoEditor.selectedIpcoByRow[row.key] ?? row.denominationId}
                      onChange={(value) => statefulIpcoEditor.setRowIpco(row, value)}
                    />
                  </td>
                </tr>
              ))
            )}
            <tr className="bg-blue-50">
              <td colSpan={6} className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-blue-950">
                TOTAL
              </td>
              <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(totalCost)}</td>
              <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(totalVae)}</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </TableFrame>
  )
}

export default function BudgetConsolidationTables({
  consolidation,
  section,
  budgetId,
  projectId,
  denominations,
  currentTab,
  saveIpcoAction,
  restoreIpcoAction,
}: BudgetConsolidationTablesProps) {
  const rows = useMemo(() => buildGeneralRows(consolidation), [consolidation])
  const [selectedIpcoByRow, setSelectedIpcoByRow] = useState<Record<string, string>>({})
  const pendingChanges = buildPendingIpcoChanges(rows, selectedIpcoByRow)

  function setRowIpco(row: IpcoEditableRow, denominationId: string) {
    setSelectedIpcoByRow((current) => updateSelectedIpco(current, row, denominationId))
  }

  const ipcoEditor = {
    budgetId,
    projectId,
    denominations,
    currentTab,
    saveIpcoAction,
    restoreIpcoAction,
    selectedIpcoByRow,
    setRowIpco,
  }

  const saveBar = (
    <IpcoBulkSaveBar
      budgetId={budgetId}
      projectId={projectId}
      currentTab={currentTab}
      pendingCount={pendingChanges.length}
      changes={pendingChanges}
      saveIpcoAction={saveIpcoAction}
    />
  )

  if (section === 'materials') {
    return (
      <div className="space-y-3">
        {saveBar}
        <MaterialsTable rows={consolidation.materials} total={consolidation.totals.materials} ipcoEditor={ipcoEditor} />
      </div>
    )
  }

  if (section === 'labor') {
    return (
      <div className="space-y-3">
        {saveBar}
        <ResourceTable
          title="Mano de obra consolidada"
          totalLabel="Total mano de obra"
          rows={consolidation.labor}
          total={consolidation.totals.labor}
          ipcoEditor={ipcoEditor}
        />
      </div>
    )
  }

  if (section === 'equipment') {
    return (
      <div className="space-y-3">
        {saveBar}
        <ResourceTable
          title="Equipos consolidados"
          totalLabel="Total equipos"
          rows={consolidation.equipment}
          total={consolidation.totals.equipment}
          ipcoEditor={ipcoEditor}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {saveBar}
      <TransportTable rows={consolidation.transport} total={consolidation.totals.transport} ipcoEditor={ipcoEditor} />
    </div>
  )
}

function IpcoBulkSaveBar({
  budgetId,
  projectId,
  currentTab,
  pendingCount,
  changes,
  saveIpcoAction,
}: {
  budgetId: string
  projectId: string
  currentTab: string
  pendingCount: number
  changes: Array<{
    componentType: BudgetIpcoComponentType
    componentIds: string[]
    denominationId: string | null
    originalDenominationId: string | null
  }>
  saveIpcoAction: IpcoAction
}) {
  return (
    <form action={saveIpcoAction} className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-300 bg-white px-3 py-2 shadow-sm">
      <input type="hidden" name="budgetId" value={budgetId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="tab" value={currentTab} />
      <input type="hidden" name="changes" value={JSON.stringify(changes)} />
      <p className="text-xs text-slate-600">
        {pendingCount === 0 ? 'Sin cambios IPCO pendientes.' : `${pendingCount} cambio(s) IPCO pendiente(s).`}
      </p>
      <button
        type="submit"
        disabled={pendingCount === 0}
        className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        Guardar cambios IPCO
      </button>
    </form>
  )
}
