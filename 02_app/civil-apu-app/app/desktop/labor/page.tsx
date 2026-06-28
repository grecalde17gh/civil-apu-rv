import DesktopShell from '@/src/components/desktop/DesktopShell'
import EditableDataGrid, { type DesktopCatalogColumn } from '@/src/components/desktop/EditableDataGrid'
import { getLaborItems } from '@/src/lib/db/labor'
import { saveDesktopCatalogChanges } from '../actions'

export const dynamic = 'force-dynamic'

const columns: DesktopCatalogColumn[] = [
  { key: 'code', label: 'Código', width: '115px' }, { key: 'roleName', label: 'Estructura ocupacional', width: '360px' }, { key: 'hourlyCost', label: 'Costo/hora', width: '110px', align: 'right' }, { key: 'dailyCost', label: 'Costo/día', width: '110px', align: 'right' }, { key: 'vae', label: 'VAE', width: '85px', align: 'right' }, { key: 'cpc', label: 'CPC', width: '115px' }, { key: 'denominationId', label: 'ID denominación IPCO', width: '230px' }, { key: 'priceDate', label: 'Actualización', width: '115px' }, { key: 'isActive', label: 'Activo', width: '75px' },
]

export default async function DesktopLaborPage() {
  const items = await getLaborItems()
  return <DesktopShell activeModule="Mano de obra"><div className="space-y-3"><header><h1 className="text-base font-bold">Mano de obra</h1><p className="text-xs text-slate-600">Catálogo de escritorio con edición tabular y guardado masivo.</p></header><EditableDataGrid catalog="labor" columns={columns} initialRows={items.map((item) => ({ id: item.id, values: { code: item.code ?? '', roleName: item.roleName, hourlyCost: item.hourlyCost.toString(), dailyCost: item.dailyCost?.toString() ?? '', vae: item.vae?.toString() ?? '', cpc: item.cpc ?? '', denominationId: item.denominationId ?? '', priceDate: item.priceDate?.toISOString().slice(0, 10) ?? '', isActive: item.isActive ? 'Sí' : 'No' } }))} blankRow={{ code: '', roleName: '', hourlyCost: '0', dailyCost: '', vae: '', cpc: '', denominationId: '', priceDate: '', isActive: 'Sí' }} importHref="/labor/import" saveAction={saveDesktopCatalogChanges} /></div></DesktopShell>
}
