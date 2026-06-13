'use client'

import PrototypeDataGrid, { PrototypeCellInput, type PrototypeColumn } from './PrototypeDataGrid'
import PrototypeInsertModal from './PrototypeInsertModal'
import PrototypeShell from './PrototypeShell'
import { PrototypeLinkButton } from './PrototypeButtons'
import { PrototypeSummaryBar, PrototypeSummaryItem } from './PrototypeSummaryBar'
import { formatMoney, type PrototypeCatalogItem } from '@/src/lib/mock-data/prototype'

type PrototypeCatalogPageProps = {
  title: string
  subtitle: string
  insertLabel: string
  insertTitle: string
  codePrefix: string
  rows: PrototypeCatalogItem[]
}

export default function PrototypeCatalogPage({ title, subtitle, insertLabel, insertTitle, codePrefix, rows }: PrototypeCatalogPageProps) {
  const activeRows = rows.filter((row) => row.status === 'Activo').length
  const revisionRows = rows.filter((row) => row.status === 'Revision').length
  const averagePrice = rows.reduce((total, row) => total + row.unitPrice, 0) / rows.length

  const columns: PrototypeColumn<PrototypeCatalogItem>[] = [
    { key: 'code', header: 'Codigo', width: '120px', render: (row) => <PrototypeCellInput value={row.code} /> },
    { key: 'description', header: 'Descripcion', render: (row) => <PrototypeCellInput value={row.description} /> },
    { key: 'unit', header: 'Unidad', width: '90px', render: (row) => <PrototypeCellInput value={row.unit} /> },
    {
      key: 'unitPrice',
      header: 'P. unitario',
      width: '130px',
      align: 'right',
      render: (row) => <PrototypeCellInput value={row.unitPrice.toFixed(2)} align="right" />,
    },
    { key: 'source', header: 'Fuente', width: '180px', render: (row) => row.source },
    {
      key: 'status',
      header: 'Estado',
      width: '110px',
      render: (row) => (
        <span className="inline-flex rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold">{row.status}</span>
      ),
    },
  ]

  return (
    <PrototypeShell
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <PrototypeInsertModal label={insertLabel} title={insertTitle} codePrefix={codePrefix} />
          <PrototypeLinkButton href="/prototype/dashboard">Dashboard</PrototypeLinkButton>
          <PrototypeLinkButton href="/prototype/presupuestos" tone="success">
            Presupuesto
          </PrototypeLinkButton>
        </>
      }
    >
      <div className="space-y-3">
        <PrototypeSummaryBar>
          <PrototypeSummaryItem label="Registros" value={rows.length} />
          <PrototypeSummaryItem label="Activos" value={activeRows} />
          <PrototypeSummaryItem label="Revision" value={revisionRows} />
          <PrototypeSummaryItem label="Precio promedio" value={formatMoney(averagePrice)} />
        </PrototypeSummaryBar>

        <section className="space-y-2">
          <div className="grid gap-px border border-[#6f7f94] bg-[#9aa8ba] md:grid-cols-[minmax(220px,1fr)_180px_minmax(220px,1.2fr)]">
            <label className="bg-[#f4f7fb] px-2 py-1 text-[11px] font-semibold uppercase text-slate-600 shadow-[inset_0_1px_0_white]">
              Buscar en hoja
              <input className="mt-1 h-6 w-full border border-[#8d9bad] px-2 text-xs font-normal normal-case shadow-[inset_1px_1px_1px_rgba(15,23,42,0.12)]" defaultValue="" placeholder="Codigo o descripcion" />
            </label>
            <label className="bg-[#f4f7fb] px-2 py-1 text-[11px] font-semibold uppercase text-slate-600 shadow-[inset_0_1px_0_white]">
              Estado
              <select className="mt-1 h-6 w-full border border-[#8d9bad] px-2 text-xs font-normal normal-case shadow-[inset_1px_1px_1px_rgba(15,23,42,0.12)]" defaultValue="Todos">
                <option>Todos</option>
                <option>Activo</option>
                <option>Revision</option>
                <option>Inactivo</option>
              </select>
            </label>
            <div className="border-l border-[#8d9bad] bg-[#eef3fa] px-2 py-1 text-xs text-blue-950 shadow-[inset_0_1px_0_white]">
              <p className="text-[11px] font-semibold uppercase text-blue-700">Modo prototipo</p>
              <p>Cambios simulados en pantalla. Esta vista no guarda en base de datos.</p>
            </div>
          </div>
          <PrototypeDataGrid columns={columns} rows={rows} getRowKey={(row) => row.id} />
        </section>
      </div>
    </PrototypeShell>
  )
}
