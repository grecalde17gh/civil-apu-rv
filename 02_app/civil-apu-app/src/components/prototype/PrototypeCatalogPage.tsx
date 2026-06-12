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
    { key: 'line', header: '#', width: '56px', align: 'center', render: (_row, index) => index + 1 },
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

        <section className="grid gap-3 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border border-slate-400 bg-white">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2 text-xs font-semibold uppercase text-white">Filtros</div>
            <div className="space-y-3 p-3">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Buscar
                <input className="mt-1 h-8 w-full border border-slate-300 px-2 text-xs" defaultValue="" placeholder="Codigo o descripcion" />
              </label>
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Estado
                <select className="mt-1 h-8 w-full border border-slate-300 px-2 text-xs" defaultValue="Todos">
                  <option>Todos</option>
                  <option>Activo</option>
                  <option>Revision</option>
                  <option>Inactivo</option>
                </select>
              </label>
              <div className="border border-blue-200 bg-blue-50 p-2 text-xs text-blue-950">
                Cambios simulados en pantalla. Esta vista no guarda en base de datos.
              </div>
            </div>
          </aside>
          <PrototypeDataGrid columns={columns} rows={rows} getRowKey={(row) => row.id} />
        </section>
      </div>
    </PrototypeShell>
  )
}
