import Link from 'next/link'
import { notFound } from 'next/navigation'
import LaborForm from '@/src/components/labor/LaborForm'
import { getLaborById } from '@/src/lib/db/labor'
import { updateLaborAction } from '../../actions'

type LaborPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditLaborPage({ params }: LaborPageProps) {
  const { id } = await params

  const item = await getLaborById(id)

  if (!item) {
    notFound()
  }

  const initialData = {
    code: item.code ?? undefined,
    roleName: item.roleName,
    hourlyCost: Number(item.hourlyCost.toString()),
    dailyCost: item.dailyCost !== null && item.dailyCost !== undefined ? Number(item.dailyCost.toString()) : undefined,
    cpc: item.cpc ?? undefined,
    vae: item.vae !== null && item.vae !== undefined ? Number(item.vae.toString()) : undefined,
    category: item.category ?? undefined,
    priceDate: item.priceDate ?? undefined,
    isActive: item.isActive,
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Editar item de mano de obra</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Actualizar datos del item</h1>
          </div>
          <Link
            href="/labor"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a lista
          </Link>
        </div>

        <LaborForm action={updateLaborAction} submitLabel="Guardar cambios" initialData={initialData} hiddenId={id} />
      </div>
    </div>
  )
}
