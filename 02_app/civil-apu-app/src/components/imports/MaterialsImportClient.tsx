'use client'

import CatalogImportClient from './CatalogImportClient'
import type { MaterialImportRow } from '@/src/lib/validations/materialImport'

export default function MaterialsImportClient() {
  return (
    <CatalogImportClient<MaterialImportRow>
      title="materiales"
      entityLabel="materiales"
      sheetName="Materiales"
      columnsLabel="codigo, descripcion, unidad, costo, cpc, vae"
      templateHref="/api/imports/materials/template"
      previewEndpoint="/api/imports/materials/preview"
      applyEndpoint="/api/imports/materials/apply"
      descriptionHeader="Descripcion"
      costHeader="Costo"
      costField="UnitPrice"
      getDescription={(row) => row.Description ?? ''}
      getCost={(row) => row.UnitPrice}
    />
  )
}
