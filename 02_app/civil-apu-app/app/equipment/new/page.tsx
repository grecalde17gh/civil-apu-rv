import Link from 'next/link'
import EquipmentForm from '@/src/components/equipment/EquipmentForm'
import { createEquipmentAction } from '../actions'
import { getIpcoDenominations } from '@/src/lib/db/denominations'

export default async function NewEquipmentPage() {
  const denominations = await getIpcoDenominations()

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Equipo nuevo</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Crear equipo o herramienta</h1>
          </div>
          <Link
            href="/equipment"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a lista
          </Link>
        </div>

        <EquipmentForm action={createEquipmentAction} submitLabel="Crear equipo" denominations={denominations} />
      </div>
    </div>
  )
}
