import Link from 'next/link'
import MaterialForm from '@/src/components/materials/MaterialForm'
import { createMaterialAction } from '../actions'

export default function NewMaterialPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Material nuevo</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Crear material</h1>
          </div>
          <Link
            href="/materials"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a lista
          </Link>
        </div>

        <MaterialForm action={createMaterialAction} submitLabel="Crear material" />
      </div>
    </div>
  )
}
