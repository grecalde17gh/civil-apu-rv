import Link from 'next/link'
import { getRubros } from '@/src/lib/db/rubros'
import type { Rubro } from '@prisma/client'

const getStatusLabel = (status: Rubro['status']) => {
  switch (status) {
    case 'DRAFT':
      return 'Borrador'
    case 'VALIDATED':
      return 'Validado'
    case 'ARCHIVED':
      return 'Archivado'
    default:
      return status
  }
}

const getCalculationStatusLabel = (status: Rubro['calculationStatus']) => {
  switch (status) {
    case 'PENDING':
      return 'Pendiente'
    case 'CALCULATED':
      return 'Calculado'
    case 'WITH_OBSERVATIONS':
      return 'Con observaciones'
    case 'ERROR':
      return 'Error'
    default:
      return status
  }
}

export default async function RubrosPage() {
  const rubros = await getRubros()

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Rubros</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Listado de rubros</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Gestiona los rubros existentes. Edita datos generales y revisa los totales guardados.
            </p>
          </div>
          <Link
            href="/rubros/new"
            className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Nuevo rubro
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Código</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Descripción</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Unidad</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">% Indirectos</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo directo</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Costo indirecto</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Precio unitario</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Estado cálculo</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rubros.map((rubro: Rubro) => (
                <tr key={rubro.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{rubro.code}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{rubro.description}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{rubro.unit}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{rubro.indirectPercentage.toString()}%</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{rubro.directCost ? rubro.directCost.toString() : '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{rubro.indirectCost ? rubro.indirectCost.toString() : '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{rubro.unitPrice ? rubro.unitPrice.toString() : '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{getStatusLabel(rubro.status)}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{getCalculationStatusLabel(rubro.calculationStatus)}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    <Link
                      href={`/rubros/${rubro.id}/edit`}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
