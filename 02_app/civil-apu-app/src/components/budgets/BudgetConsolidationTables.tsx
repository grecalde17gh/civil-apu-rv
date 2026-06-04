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
                <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo unitario</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cat.1</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cat.2</th>
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
                  <td className="px-3 py-2 text-slate-700">{row.usesCategory1 ? 'Si' : 'No'}</td>
                  <td className="px-3 py-2 text-slate-700">{row.usesCategory2 ? 'Si' : 'No'}</td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td colSpan={5} className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-blue-950">
                  Total materiales
                </td>
                <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(total)}</td>
                <td colSpan={2} />
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
                <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tarifa</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo total</th>
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
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td colSpan={5} className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-blue-950">
                  {totalLabel}
                </td>
                <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(total)}</td>
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
      {rows.length === 0 ? (
        <EmptyConsolidationMessage />
      ) : (
        <div className="overflow-x-auto">
          <table id="consolidated-transport-table" className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cantidad total</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Distancia</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Tarifa</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Costo total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.key} className="hover:bg-blue-50/60">
                  <td className="px-3 py-2 font-mono text-slate-700">{row.code}</td>
                  <td className="px-3 py-2 text-slate-800">{row.description}</td>
                  <td className="px-3 py-2 text-slate-700">{row.unit}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.totalQuantity)}</td>
                  <td className="px-3 py-2 text-slate-700">{row.distance}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{formatNumber(row.unitCost)}</td>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-slate-950">{formatNumber(row.totalCost)}</td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td colSpan={6} className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-blue-950">
                  Total transporte
                </td>
                <td className="px-3 py-2 font-mono font-bold tabular-nums text-blue-950">{formatNumber(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
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
