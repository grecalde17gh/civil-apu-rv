import Link from 'next/link'
import { notFound } from 'next/navigation'
import EquipmentForm from '@/src/components/equipment/EquipmentForm'
import { getEquipmentById } from '@/src/lib/db/equipment'
import { updateEquipmentAction } from '../../actions'

type EquipmentPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditEquipmentPage({ params }: EquipmentPageProps) {
  const { id } = await params

  const item = await getEquipmentById(id)

  if (!item) {
    notFound()
  }

  const initialData = {
    code: item.code ?? undefined,
    description: item.description,
    equipmentType: item.equipmentType ?? undefined,
    hourlyRate: item.hourlyRate !== null && item.hourlyRate !== undefined ? Number(item.hourlyRate.toString()) : undefined,
    dailyRate: item.dailyRate !== null && item.dailyRate !== undefined ? Number(item.dailyRate.toString()) : undefined,
    purchaseCost: item.purchaseCost !== null && item.purchaseCost !== undefined ? Number(item.purchaseCost.toString()) : undefined,
    maintenanceRequired: item.maintenanceRequired,
    maintenanceNotes: item.maintenanceNotes ?? undefined,
    cpc: item.cpc ?? undefined,
    vae: item.vae !== null && item.vae !== undefined ? Number(item.vae.toString()) : undefined,
    priceDate: item.priceDate ?? undefined,
    isActive: item.isActive,
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Editar equipo</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Actualizar datos del equipo</h1>
          </div>
          <Link
            href="/equipment"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a lista
          </Link>
        </div>

        <EquipmentForm action={updateEquipmentAction} submitLabel="Guardar cambios" initialData={initialData} hiddenId={id} />
      </div>
    </div>
  )
}
