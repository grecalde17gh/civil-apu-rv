import PrototypeCatalogPage from '@/src/components/prototype/PrototypeCatalogPage'
import { prototypeMaterials } from '@/src/lib/mock-data/prototype'

export default function PrototypeMaterialesPage() {
  return (
    <PrototypeCatalogPage
      title="Catalogo de materiales"
      subtitle="Tabla editable visual con insumos ficticios"
      insertLabel="Insertar material"
      insertTitle="Nuevo material mock"
      codePrefix="MAT"
      rows={prototypeMaterials}
    />
  )
}
