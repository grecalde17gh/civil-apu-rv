import DesktopShell from '@/src/components/desktop/DesktopShell'
import EditableDataGrid, { type DesktopCatalogColumn } from '@/src/components/desktop/EditableDataGrid'
import { getMaterials } from '@/src/lib/db/materials'
import { saveDesktopCatalogChanges } from '../actions'

export const dynamic = 'force-dynamic'

const columns: DesktopCatalogColumn[] = [
  { key: 'code', label: 'Código', width: '115px' }, { key: 'description', label: 'Estructura ocupacional', width: '360px' }, { key: 'unit', label: 'Unidad', width: '85px' },
  { key: 'price1', label: 'Precio 1', width: '105px', align: 'right' }, { key: 'price2', label: 'Precio 2', width: '105px', align: 'right' }, { key: 'price3', label: 'Precio 3', width: '105px', align: 'right' },
  { key: 'vae', label: 'VAE', width: '85px', align: 'right' }, { key: 'cpc', label: 'CPC', width: '115px' }, { key: 'denominationId', label: 'ID denominación IPCO', width: '230px' }, { key: 'priceDate', label: 'Actualización', width: '115px' }, { key: 'isActive', label: 'Activo', width: '75px' },
]

export default async function DesktopMaterialsPage() {
  const materials = await getMaterials()
  return <DesktopShell activeModule="Materiales"><div className="space-y-3"><header><h1 className="text-base font-bold">Materiales</h1><p className="text-xs text-slate-600">Catálogo de escritorio. Los cambios se agrupan y se guardan en un solo paso.</p></header><EditableDataGrid catalog="materials" columns={columns} initialRows={materials.map((item) => ({ id: item.id, values: { code: item.code ?? '', description: item.description, unit: item.unit, price1: item.price1.toString(), price2: item.price2?.toString() ?? '', price3: item.price3?.toString() ?? '', vae: item.vae?.toString() ?? '', cpc: item.cpc ?? '', denominationId: item.denominationId ?? '', priceDate: item.priceDate?.toISOString().slice(0, 10) ?? '', isActive: item.isActive ? 'Sí' : 'No' } }))} blankRow={{ code: '', description: '', unit: '', price1: '0', price2: '', price3: '', vae: '', cpc: '', denominationId: '', priceDate: '', isActive: 'Sí' }} importHref="/materials/import" saveAction={saveDesktopCatalogChanges} /></div></DesktopShell>
}
