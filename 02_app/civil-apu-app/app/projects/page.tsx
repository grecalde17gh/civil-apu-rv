import Link from 'next/link'
import { getProjects } from '@/src/lib/db/projects'
import type { Project } from '@prisma/client'

const getStatusLabel = (status: Project['status']) => {
  switch (status) {
    case 'ACTIVE':
      return 'Activo'
    case 'PAUSED':
      return 'Pausado'
    case 'CLOSED':
      return 'Cerrado'
    case 'ARCHIVED':
      return 'Archivado'
    default:
      return status
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Proyectos</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Listado de proyectos</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Gestiona tus proyectos y configura el porcentaje de indirectos por defecto.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Nuevo proyecto
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Nombre</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Cliente</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Ubicación</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Indirectos (%)</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Inicio</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Fin</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {projects.map((project: Project) => (
                <tr key={project.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-700">{project.name}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{project.clientName ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{project.location ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{project.defaultIndirectPercentage.toString()}%</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{project.startDate?.toISOString().slice(0, 10) ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{project.endDate?.toISOString().slice(0, 10) ?? '-'}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">{getStatusLabel(project.status)}</td>
                  <td className="px-4 py-4 text-sm text-zinc-700">
                    <Link
                      href={`/projects/${project.id}/edit`}
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
