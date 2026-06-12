import PrototypeCatalogPage from '@/src/components/prototype/PrototypeCatalogPage'
import { prototypeLabor } from '@/src/lib/mock-data/prototype'

export default function PrototypeManoObraPage() {
  return (
    <PrototypeCatalogPage
      title="Catalogo de mano de obra"
      subtitle="Tabla editable visual de cuadrillas y salarios ficticios"
      insertLabel="Insertar mano obra"
      insertTitle="Nueva mano de obra mock"
      codePrefix="MO"
      rows={prototypeLabor}
    />
  )
}
