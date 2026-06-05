'use client'

import CatalogImportClient from './CatalogImportClient'
import type { LaborImportRow } from '@/src/lib/validations/laborImport'

export default function LaborImportClient() {
  return (
    <CatalogImportClient<LaborImportRow>
      title="mano de obra"
      entityLabel="mano de obra"
      sheetName="Mano de obra"
      columnsLabel="codigo, rol, unidad, costo, cpc, vae"
      templateHref="/api/imports/labor/template"
      previewEndpoint="/api/imports/labor/preview"
      applyEndpoint="/api/imports/labor/apply"
      descriptionHeader="Rol"
      costHeader="Costo"
      costField="HourlyCost"
      getDescription={(row) => row.RoleName ?? ''}
      getCost={(row) => row.HourlyCost}
    />
  )
}
