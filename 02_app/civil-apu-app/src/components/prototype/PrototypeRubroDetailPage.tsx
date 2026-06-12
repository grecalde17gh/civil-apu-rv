import PrototypeDataGrid, { PrototypeCellInput, type PrototypeColumn } from './PrototypeDataGrid'
import PrototypeInsertModal from './PrototypeInsertModal'
import PrototypeShell from './PrototypeShell'
import { PrototypeLinkButton } from './PrototypeButtons'
import { PrototypeSummaryBar, PrototypeSummaryItem } from './PrototypeSummaryBar'
import {
  formatMoney,
  formatNumber,
  getRubroDirectCost,
  getRubroUnitPrice,
  prototypeRubros,
  type PrototypeRubro,
  type PrototypeRubroComponent,
} from '@/src/lib/mock-data/prototype'

type PrototypeRubroDetailPageProps = {
  id: string
}

export default function PrototypeRubroDetailPage({ id }: PrototypeRubroDetailPageProps) {
  const rubro = prototypeRubros.find((item) => item.id === id || item.code === id) ?? prototypeRubros[0]
  const directCost = getRubroDirectCost(rubro)
  const unitPrice = getRubroUnitPrice(rubro)

  return (
    <PrototypeShell
      title={`${rubro.code} - ${rubro.description}`}
      subtitle="Ficha APU con materiales, mano de obra, equipos y calculos visuales"
      actions={
        <>
          <PrototypeInsertModal label="Material" title="Insertar material al APU" codePrefix="MAT" />
          <PrototypeInsertModal label="Mano obra" title="Insertar mano de obra al APU" codePrefix="MO" />
          <PrototypeInsertModal label="Equipo" title="Insertar equipo al APU" codePrefix="EQ" />
          <PrototypeLinkButton href="/prototype/rubros">Volver</PrototypeLinkButton>
        </>
      }
    >
      <div className="space-y-3">
        <PrototypeSummaryBar>
          <PrototypeSummaryItem label="Unidad" value={rubro.unit} />
          <PrototypeSummaryItem label="Rendimiento" value={formatNumber(rubro.performance)} />
          <PrototypeSummaryItem label="Costo directo" value={formatMoney(directCost)} />
          <PrototypeSummaryItem label="Precio unitario" value={formatMoney(unitPrice)} />
        </PrototypeSummaryBar>

        <section className="grid gap-px border border-slate-400 bg-slate-300 xl:grid-cols-4">
          <HeaderField label="Codigo" value={rubro.code} />
          <HeaderField label="Descripcion" value={rubro.description} wide />
          <HeaderField label="Unidad" value={rubro.unit} />
          <HeaderField label="Indirectos" value={`${rubro.indirectPercentage}%`} />
        </section>

        <ComponentSection title="Materiales" rubro={rubro} rows={rubro.materials} />
        <ComponentSection title="Mano de obra" rubro={rubro} rows={rubro.labor} />
        <ComponentSection title="Equipos y herramientas" rubro={rubro} rows={rubro.equipment} />
      </div>
    </PrototypeShell>
  )
}

function HeaderField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <label className={`bg-white px-3 py-2 text-[11px] font-semibold uppercase text-slate-500 ${wide ? 'xl:col-span-2' : ''}`}>
      {label}
      <input defaultValue={value} className="mt-1 h-8 w-full border border-slate-300 px-2 text-xs font-normal normal-case text-slate-900" />
    </label>
  )
}

function ComponentSection({ title, rubro, rows }: { title: string; rubro: PrototypeRubro; rows: PrototypeRubroComponent[] }) {
  const columns: PrototypeColumn<PrototypeRubroComponent>[] = [
    { key: 'code', header: 'Codigo', width: '110px', render: (row) => row.code },
    { key: 'description', header: 'Descripcion', render: (row) => row.description },
    { key: 'unit', header: 'Unidad', width: '80px', align: 'center', render: (row) => row.unit },
    {
      key: 'quantity',
      header: 'Cantidad',
      width: '110px',
      align: 'right',
      render: (row) => <PrototypeCellInput value={row.quantity.toFixed(3)} align="right" />,
    },
    {
      key: 'performance',
      header: 'Rend.',
      width: '100px',
      align: 'right',
      render: (row) => <PrototypeCellInput value={row.performance.toFixed(2)} align="right" />,
    },
    { key: 'price', header: 'P. unitario', width: '120px', align: 'right', render: (row) => formatMoney(row.unitPrice) },
    { key: 'subtotal', header: 'Subtotal', width: '120px', align: 'right', render: (row) => formatMoney(row.subtotal) },
  ]

  return (
    <section className="border border-slate-400 bg-white">
      <div className="flex items-center justify-between border-b border-slate-300 bg-slate-800 px-3 py-2 text-white">
        <p className="text-xs font-semibold uppercase">{title}</p>
        <p className="font-mono text-xs">{formatMoney(rows.reduce((total, row) => total + row.subtotal, 0))}</p>
      </div>
      <PrototypeDataGrid columns={columns} rows={rows} getRowKey={(row) => `${rubro.id}-${title}-${row.id}`} />
    </section>
  )
}
