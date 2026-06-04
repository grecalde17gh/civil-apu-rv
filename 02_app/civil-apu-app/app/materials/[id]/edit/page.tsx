import Link from 'next/link'
import { notFound } from 'next/navigation'
import MaterialForm from '@/src/components/materials/MaterialForm'
import { getMaterialById } from '@/src/lib/db/materials'
import { updateMaterialAction } from '../../actions'

type MaterialPageProps = {
  params: Promise<{
    id: string
  }>
}



export default async function EditMaterialPage({ params }: MaterialPageProps) {
  const { id } = await params

  const material = await getMaterialById(id)

  if (!material) {
    notFound()
  }

  const initialData = {
    code: material.code ?? undefined,
    description: material.description,
    unit: material.unit,
    unitCost: Number(material.unitCost.toString()),
    cpc: material.cpc ?? undefined,
    vae:
      material.vae !== null && material.vae !== undefined
        ? Number(material.vae.toString())
        : undefined,
    usesCategory1: material.usesCategory1,
    usesCategory2: material.usesCategory2,
    priceDate: material.priceDate ?? undefined,
    isActive: material.isActive,
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Editar material</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Actualizar datos del material</h1>
          </div>
          <Link
            href="/materials"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a lista
          </Link>
        </div>

        <MaterialForm
          action={updateMaterialAction}
          submitLabel="Guardar cambios"
          initialData={initialData}
          hiddenId={id}
        />
      </div>
    </div>
  )
}
