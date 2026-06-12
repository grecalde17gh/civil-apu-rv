import PrototypeCatalogPage from '@/src/components/prototype/PrototypeCatalogPage'
import { prototypeEquipment } from '@/src/lib/mock-data/prototype'

export default function PrototypeEquiposPage() {
  return (
    <PrototypeCatalogPage
      title="Catalogo de equipos"
      subtitle="Tabla editable visual de equipos y herramientas ficticias"
      insertLabel="Insertar equipo"
      insertTitle="Nuevo equipo mock"
      codePrefix="EQ"
      rows={prototypeEquipment}
    />
  )
}
