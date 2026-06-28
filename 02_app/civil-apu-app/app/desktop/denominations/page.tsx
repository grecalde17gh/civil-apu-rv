import DesktopShell from '@/src/components/desktop/DesktopShell'
import EditableDataGrid, { type DesktopCatalogColumn } from '@/src/components/desktop/EditableDataGrid'
import { getIpcoDenominations } from '@/src/lib/db/denominations'
import { saveDesktopCatalogChanges } from '../actions'

export const dynamic = 'force-dynamic'

const columns: DesktopCatalogColumn[] = [{ key: 'code', label: 'Código IPCO', width: '150px' }, { key: 'name', label: 'Denominación IPCO', width: '420px' }, { key: 'isActive', label: 'Activo', width: '80px' }]

export default async function DesktopDenominationsPage() {
  const items = await getIpcoDenominations({ includeInactive: true })
  return <DesktopShell activeModule="Denominaciones IPCO"><div className="space-y-3"><header><h1 className="text-base font-bold">Denominaciones IPCO</h1><p className="text-xs text-slate-600">Catálogo maestro; no aplica overrides de Presupuesto en esta vista.</p></header><EditableDataGrid catalog="denominations" columns={columns} initialRows={items.map((item) => ({ id: item.id, values: { code: item.code ?? '', name: item.name, isActive: item.isActive ? 'Sí' : 'No' } }))} blankRow={{ code: '', name: '', isActive: 'Sí' }} saveAction={saveDesktopCatalogChanges} /></div></DesktopShell>
}
