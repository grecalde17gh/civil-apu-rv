'use client'

import PrototypeDataGrid, { PrototypeCellInput, type PrototypeColumn } from './PrototypeDataGrid'
import PrototypeInsertModal from './PrototypeInsertModal'
import PrototypeShell from './PrototypeShell'
import { PrototypeLinkButton } from './PrototypeButtons'
import { PrototypeSummaryBar, PrototypeSummaryItem } from './PrototypeSummaryBar'
import { formatMoney, getBudgetDirectCost, prototypeBudgetItems, prototypeRubros, type PrototypeBudgetItem } from '@/src/lib/mock-data/prototype'

export default function PrototypeBudgetPage() {
  const directCost = getBudgetDirectCost()
  const indirectCost = directCost * 0.2
  const total = directCost + indirectCost
  const rubroCount = prototypeBudgetItems.filter((item) => item.type === 'rubro').length
  const chapterCount = prototypeBudgetItems.filter((item) => item.type === 'chapter').length

  const columns: PrototypeColumn<PrototypeBudgetItem>[] = [
    { key: 'number', header: 'N', width: '70px', render: (row) => row.number },
    { key: 'code', header: 'Codigo', width: '110px', render: (row) => row.code },
    { key: 'description', header: 'Descripcion', render: (row) => (row.type === 'chapter' ? row.description : <PrototypeCellInput value={row.description} />) },
    { key: 'unit', header: 'Unidad', width: '80px', align: 'center', render: (row) => row.unit },
    {
      key: 'quantity',
      header: 'Cantidad',
      width: '120px',
      align: 'right',
      render: (row) => (row.type === 'chapter' ? '' : <PrototypeCellInput value={row.quantity.toFixed(2)} align="right" />),
    },
    {
      key: 'unitPrice',
      header: 'P. unitario',
      width: '130px',
      align: 'right',
      render: (row) => (row.type === 'chapter' ? '' : formatMoney(row.unitPrice)),
    },
    {
      key: 'total',
      header: 'Total',
      width: '140px',
      align: 'right',
      render: (row) => (row.type === 'chapter' ? '' : formatMoney(row.quantity * row.unitPrice)),
    },
    {
      key: 'actions',
      header: 'Accion',
      width: '110px',
      align: 'center',
      render: (row) => (row.type === 'chapter' ? '' : <PrototypeLinkButton href={`/prototype/rubros/${row.code}`}>Abrir</PrototypeLinkButton>),
    },
  ]

  return (
    <PrototypeShell
      title="Presupuesto demo"
      subtitle="Hoja de presupuesto tipo Excel con capitulos, rubros y totales visuales"
      actions={
        <>
          <PrototypeInsertModal label="Agregar rubro" title="Insertar rubro al presupuesto" codePrefix="R" />
          <PrototypeLinkButton href="/prototype/rubros">Catalogo rubros</PrototypeLinkButton>
          <PrototypeLinkButton href="/prototype/dashboard" tone="success">
            Recalcular
          </PrototypeLinkButton>
        </>
      }
    >
      <div className="space-y-3">
        <PrototypeSummaryBar>
          <PrototypeSummaryItem label="Costo directo" value={formatMoney(directCost)} />
          <PrototypeSummaryItem label="Indirectos 20%" value={formatMoney(indirectCost)} />
          <PrototypeSummaryItem label="Total presupuesto" value={formatMoney(total)} />
          <PrototypeSummaryItem label="Rubros / capitulos" value={`${rubroCount} / ${chapterCount}`} />
        </PrototypeSummaryBar>

        <div className="space-y-2">
          <section className="border border-[#6f7f94] bg-white shadow-[inset_0_1px_0_white]">
            <div className="grid gap-px bg-[#9aa8ba] xl:grid-cols-[220px_repeat(3,minmax(190px,1fr))]">
              <label className="bg-gradient-to-b from-[#f8fafc] to-[#e4ebf5] px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
                Buscar rubro
                <input className="mt-1 h-6 w-full border border-[#8d9bad] px-2 text-xs font-normal normal-case shadow-[inset_1px_1px_1px_rgba(15,23,42,0.12)]" placeholder="Codigo o descripcion" />
              </label>
              {prototypeRubros.map((rubro) => (
                <div key={rubro.id} className="flex items-center justify-between gap-2 bg-[#f8fafc] px-2 py-1 shadow-[inset_0_1px_0_white]">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-semibold">{rubro.code}</p>
                    <p className="truncate text-[11px] text-slate-700">{rubro.description}</p>
                  </div>
                  <PrototypeLinkButton href={`/prototype/rubros/${rubro.id}`}>APU</PrototypeLinkButton>
                </div>
              ))}
            </div>
          </section>
          <PrototypeDataGrid
            columns={columns}
            rows={prototypeBudgetItems}
            getRowKey={(row) => row.id}
            rowTone={(row) => (row.type === 'chapter' ? 'chapter' : 'normal')}
          />
        </div>
      </div>
    </PrototypeShell>
  )
}
