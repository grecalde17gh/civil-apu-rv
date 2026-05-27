import Link from 'next/link'
import { notFound } from 'next/navigation'
import RubroForm from '@/src/components/rubros/RubroForm'
import RubroMaterialsSection from '@/src/components/rubros/RubroMaterialsSection'
import RubroLaborSection from '@/src/components/rubros/RubroLaborSection'
import { getRubroById } from '@/src/lib/db/rubros'
import { getMaterials } from '@/src/lib/db/materials'
import { getRubroMaterials } from '@/src/lib/db/rubroMaterials'
import { getLaborItems } from '@/src/lib/db/labor'
import { getRubroLabor } from '@/src/lib/db/rubroLabor'
import { getEquipmentItems } from '@/src/lib/db/equipment'
import { getRubroEquipment } from '@/src/lib/db/rubroEquipment'
import RubroEquipmentSection from '@/src/components/rubros/RubroEquipmentSection'
import { getRubroTransport } from '@/src/lib/db/rubroTransport'
import RubroTransportSection from '@/src/components/rubros/RubroTransportSection'
import { updateRubroAction } from '../../actions'

type RubroEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditRubroPage({ params }: RubroEditPageProps) {
  const { id } = await params
  const rubro = await getRubroById(id)

  if (!rubro) {
    notFound()
  }

  const initialData = {
    code: rubro.code,
    description: rubro.description,
    unit: rubro.unit,
    category: rubro.category ?? undefined,
    performanceValue:
      rubro.performanceValue !== null && rubro.performanceValue !== undefined
        ? Number(rubro.performanceValue.toString())
        : undefined,
    performanceUnit: rubro.performanceUnit ?? undefined,
    indirectPercentage: Number(rubro.indirectPercentage.toString()),
    notes: rubro.notes ?? undefined,
    status: rubro.status,
    calculationStatus: rubro.calculationStatus,
  }

  const rubroMaterials = await getRubroMaterials(id)
  const materials = await getMaterials()

  const rubroLabor = await getRubroLabor(id)
  const laborItems = await getLaborItems()

  const rubroEquipment = await getRubroEquipment(id)
  const equipmentItems = await getEquipmentItems()
  const rubroTransport = await getRubroTransport(id)

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Editar rubro</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Actualizar datos generales</h1>
          </div>
          <Link
            href="/rubros"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a lista
          </Link>
        </div>

        <RubroForm action={updateRubroAction} submitLabel="Guardar cambios" initialData={initialData} hiddenId={id} />

        <div className="mt-10 space-y-10">
          <RubroMaterialsSection rubroId={id} materials={materials} rubroMaterials={rubroMaterials} />
          <RubroLaborSection rubroId={id} laborItems={laborItems} rubroLabor={rubroLabor} />
          <RubroEquipmentSection rubroId={id} equipmentItems={equipmentItems} rubroEquipment={rubroEquipment} />
          <RubroTransportSection rubroId={id} rubroTransport={rubroTransport} />
        </div>
      </div>
    </div>
  )
}
