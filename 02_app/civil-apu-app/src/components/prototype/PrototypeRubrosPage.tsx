'use client'

import PrototypeDataGrid, { PrototypeCellInput, type PrototypeColumn } from './PrototypeDataGrid'
import PrototypeInsertModal from './PrototypeInsertModal'
import PrototypeShell from './PrototypeShell'
import { PrototypeLinkButton } from './PrototypeButtons'
import { PrototypeSummaryBar, PrototypeSummaryItem } from './PrototypeSummaryBar'
import { formatMoney, getRubroDirectCost, getRubroUnitPrice, prototypeRubros, type PrototypeRubro } from '@/src/lib/mock-data/prototype'

export default function PrototypeRubrosPage() {
  const averageUnitPrice = prototypeRubros.reduce((total, rubro) => total + getRubroUnitPrice(rubro), 0) / prototypeRubros.length

  const columns: PrototypeColumn<PrototypeRubro>[] = [
    { key: 'code', header: 'Codigo', width: '110px', render: (row) => row.code },
    { key: 'description', header: 'Descripcion', render: (row) => <PrototypeCellInput value={row.description} /> },
    { key: 'unit', header: 'Unidad', width: '80px', align: 'center', render: (row) => row.unit },
    {
      key: 'performance',
      header: 'Rend.',
      width: '100px',
      align: 'right',
      render: (row) => <PrototypeCellInput value={row.performance.toFixed(2)} align="right" />,
    },
    { key: 'direct', header: 'Directo', width: '130px', align: 'right', render: (row) => formatMoney(getRubroDirectCost(row)) },
    { key: 'indirect', header: 'Indirecto', width: '100px', align: 'right', render: (row) => `${row.indirectPercentage}%` },
    { key: 'unitPrice', header: 'P. unitario', width: '130px', align: 'right', render: (row) => formatMoney(getRubroUnitPrice(row)) },
    { key: 'open', header: 'Abrir', width: '100px', align: 'center', render: (row) => <PrototypeLinkButton href={`/prototype/rubros/${row.id}`}>APU</PrototypeLinkButton> },
  ]

  return (
    <PrototypeShell
      title="Catalogo de rubros"
      subtitle="Listado editable visual con precios calculados desde datos mock"
      actions={
        <>
          <PrototypeInsertModal label="Nuevo rubro" title="Crear rubro simulado" codePrefix="R" />
          <PrototypeLinkButton href="/prototype/presupuestos" tone="success">
            Presupuesto
          </PrototypeLinkButton>
        </>
      }
    >
      <div className="space-y-3">
        <PrototypeSummaryBar>
          <PrototypeSummaryItem label="Rubros" value={prototypeRubros.length} />
          <PrototypeSummaryItem label="Promedio P.U." value={formatMoney(averageUnitPrice)} />
          <PrototypeSummaryItem label="Indirecto default" value="20%" />
          <PrototypeSummaryItem label="Estado" value="Mock navegable" />
        </PrototypeSummaryBar>
        <PrototypeDataGrid columns={columns} rows={prototypeRubros} getRowKey={(row) => row.id} />
      </div>
    </PrototypeShell>
  )
}
