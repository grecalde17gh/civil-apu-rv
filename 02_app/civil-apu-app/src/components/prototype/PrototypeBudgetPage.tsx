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

        <div className="grid gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border border-slate-400 bg-white">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2 text-xs font-semibold uppercase text-white">Rubros disponibles</div>
            <div className="space-y-2 p-2">
              <input className="h-8 w-full border border-slate-300 px-2 text-xs" placeholder="Buscar rubro" />
              {prototypeRubros.map((rubro) => (
                <div key={rubro.id} className="border border-slate-300 bg-slate-50 p-2">
                  <p className="font-mono text-xs font-semibold">{rubro.code}</p>
                  <p className="mt-1 text-xs text-slate-700">{rubro.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{rubro.unit}</span>
                    <PrototypeLinkButton href={`/prototype/rubros/${rubro.id}`}>Ver APU</PrototypeLinkButton>
                  </div>
                </div>
              ))}
            </div>
          </aside>

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
