'use client'

import CatalogImportClient from './CatalogImportClient'
import type { EquipmentImportRow } from '@/src/lib/validations/equipmentImport'

export default function EquipmentImportClient() {
  return (
    <CatalogImportClient<EquipmentImportRow>
      title="equipos"
      entityLabel="equipos"
      sheetName="Equipos"
      columnsLabel="codigo, descripcion, unidad, tarifa, cpc, vae"
      templateHref="/api/imports/equipment/template"
      previewEndpoint="/api/imports/equipment/preview"
      applyEndpoint="/api/imports/equipment/apply"
      descriptionHeader="Descripcion"
      costHeader="Tarifa"
      costField="HourlyRate"
      getDescription={(row) => row.Description ?? ''}
      getCost={(row) => row.HourlyRate}
    />
  )
}
