import type {
  BudgetConsolidation,
  ConsolidatedEquipment,
  ConsolidatedLabor,
  ConsolidatedMaterial,
  ConsolidatedTransport,
} from '@/src/lib/calculations/budgetConsolidation'
import type { ReactNode } from 'react'
import ExportVisibleTableButton from '@/src/components/export/ExportVisibleTableButton'

type ConsolidationSection = 'materials' | 'labor' | 'equipment' | 'transport'

type BudgetConsolidationTablesProps = {
  consolidation: BudgetConsolidation
  section: ConsolidationSection
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

function MaterialsTable({ rows, total }: { rows: ConsolidatedMaterial[]; total: number }) {
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
                  <td className="px-3 py-2 text-slate-700">{row.denomination}</td>
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
}: {
  title: string
  totalLabel: string
  rows: Array<ConsolidatedLabor | ConsolidatedEquipment>
  total: number
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
                  <td className="px-3 py-2 text-slate-700">{row.denomination}</td>
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

function TransportTable({ rows, total }: { rows: ConsolidatedTransport[]; total: number }) {
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
                  <td className="px-3 py-2 text-slate-700">{row.denomination}</td>
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
}

function buildGeneralRows(consolidation: BudgetConsolidation): GeneralComponentRow[] {
  return [
    ...consolidation.materials.map((row) => ({ ...row, type: 'Material', key: `material-${row.key}` })),
    ...consolidation.labor.map((row) => ({ ...row, type: 'Mano de obra', key: `labor-${row.key}` })),
    ...consolidation.equipment.map((row) => ({ ...row, type: 'Equipo', key: `equipment-${row.key}` })),
    ...consolidation.transport.map((row) => ({ ...row, type: 'Transporte', key: `transport-${row.key}` })),
  ]
}

export function GeneralComponentsTable({
  consolidation,
  denominationFilter = '',
}: {
  consolidation: BudgetConsolidation
  denominationFilter?: string
}) {
  const rows = buildGeneralRows(consolidation).filter((row) =>
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
                  <td className="px-3 py-2 text-slate-700">{row.denomination}</td>
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

export default function BudgetConsolidationTables({ consolidation, section }: BudgetConsolidationTablesProps) {
  if (section === 'materials') {
    return <MaterialsTable rows={consolidation.materials} total={consolidation.totals.materials} />
  }

  if (section === 'labor') {
    return (
      <ResourceTable
        title="Mano de obra consolidada"
        totalLabel="Total mano de obra"
        rows={consolidation.labor}
        total={consolidation.totals.labor}
      />
    )
  }

  if (section === 'equipment') {
    return (
      <ResourceTable
        title="Equipos consolidados"
        totalLabel="Total equipos"
        rows={consolidation.equipment}
        total={consolidation.totals.equipment}
      />
    )
  }

  return <TransportTable rows={consolidation.transport} total={consolidation.totals.transport} />
}
