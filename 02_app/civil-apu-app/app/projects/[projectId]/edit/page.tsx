import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProjectForm from '@/src/components/projects/ProjectForm'
import { getProjectById } from '@/src/lib/db/projects'
import { updateProjectAction } from '../../actions'

type ProjectEditPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function EditProjectPage({ params }: ProjectEditPageProps) {
  const { projectId } = await params
  const project = await getProjectById(projectId)

  if (!project) {
    notFound()
  }

  const initialData = {
    name: project.name,
    clientName: project.clientName ?? undefined,
    location: project.location ?? undefined,
    province: project.province ?? undefined,
    city: project.city ?? undefined,
    startDate: project.startDate ?? undefined,
    endDate: project.endDate ?? undefined,
    defaultIndirectPercentage: Number(project.defaultIndirectPercentage?.toString() ?? '20'),
    notes: project.notes ?? undefined,
    status: project.status,
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Editar proyecto</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Actualizar datos del proyecto</h1>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver a lista
          </Link>
        </div>

        <ProjectForm action={updateProjectAction} submitLabel="Guardar cambios" hiddenId={projectId} initialData={initialData} />
      </div>
    </div>
  )
}
