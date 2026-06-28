import DesktopShell from '@/src/components/desktop/DesktopShell'
import EditableDataGrid, { type DesktopCatalogColumn } from '@/src/components/desktop/EditableDataGrid'
import { getEquipmentItems } from '@/src/lib/db/equipment'
import { saveDesktopCatalogChanges } from '../actions'

export const dynamic = 'force-dynamic'

const columns: DesktopCatalogColumn[] = [
  { key: 'code', label: 'Código', width: '115px' }, { key: 'description', label: 'Descripción', width: '330px' }, { key: 'equipmentType', label: 'Tipo', width: '150px' }, { key: 'hourlyRate', label: 'Tarifa/hora', width: '110px', align: 'right' }, { key: 'dailyRate', label: 'Tarifa/día', width: '110px', align: 'right' }, { key: 'purchaseCost', label: 'Compra', width: '110px', align: 'right' }, { key: 'maintenanceRequired', label: 'Mant.', width: '75px' }, { key: 'maintenanceNotes', label: 'Notas mant.', width: '180px' }, { key: 'vae', label: 'VAE', width: '85px', align: 'right' }, { key: 'cpc', label: 'CPC', width: '115px' }, { key: 'denominationId', label: 'ID denominación IPCO', width: '230px' }, { key: 'priceDate', label: 'Actualización', width: '115px' }, { key: 'isActive', label: 'Activo', width: '75px' },
]

export default async function DesktopEquipmentPage() {
  const items = await getEquipmentItems()
  return <DesktopShell activeModule="Equipos"><div className="space-y-3"><header><h1 className="text-base font-bold">Equipos</h1><p className="text-xs text-slate-600">Catálogo de escritorio con navegación de teclado y pegado desde Excel.</p></header><EditableDataGrid catalog="equipment" columns={columns} initialRows={items.map((item) => ({ id: item.id, values: { code: item.code ?? '', description: item.description, equipmentType: item.equipmentType ?? '', hourlyRate: item.hourlyRate?.toString() ?? '', dailyRate: item.dailyRate?.toString() ?? '', purchaseCost: item.purchaseCost?.toString() ?? '', maintenanceRequired: item.maintenanceRequired ? 'Sí' : 'No', maintenanceNotes: item.maintenanceNotes ?? '', vae: item.vae?.toString() ?? '', cpc: item.cpc ?? '', denominationId: item.denominationId ?? '', priceDate: item.priceDate?.toISOString().slice(0, 10) ?? '', isActive: item.isActive ? 'Sí' : 'No' } }))} blankRow={{ code: '', description: '', equipmentType: '', hourlyRate: '', dailyRate: '', purchaseCost: '', maintenanceRequired: 'No', maintenanceNotes: '', vae: '', cpc: '', denominationId: '', priceDate: '', isActive: 'Sí' }} importHref="/equipment/import" saveAction={saveDesktopCatalogChanges} /></div></DesktopShell>
}
