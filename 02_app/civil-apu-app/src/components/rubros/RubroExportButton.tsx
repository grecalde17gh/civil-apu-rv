'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type RubroExportProject = {
  id: string
  name: string
}

type RubroExportButtonProps = {
  rubroId: string
  projects: RubroExportProject[]
}

export default function RubroExportButton({ rubroId, projects }: RubroExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const uniqueProjects = useMemo(() => {
    const byId = new Map<string, RubroExportProject>()
    projects.forEach((project) => byId.set(project.id, project))
    return [...byId.values()]
  }, [projects])

  if (uniqueProjects.length <= 1) {
    const projectId = uniqueProjects[0]?.id
    const href = projectId ? `/rubros/${rubroId}/export?projectId=${projectId}` : `/rubros/${rubroId}/export`

    return (
      <Link
        href={href}
        className="inline-flex h-8 items-center rounded border border-emerald-300 bg-emerald-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-800"
      >
        Exportar
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-8 rounded border border-emerald-300 bg-emerald-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-800"
      >
        Exportar
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-md overflow-hidden rounded border border-slate-300 bg-white text-slate-950 shadow-xl">
            <div className="border-b border-slate-300 bg-slate-900 px-4 py-3 text-white">
              <h2 className="text-sm font-semibold">Seleccione el proyecto para la exportación</h2>
            </div>
            <div className="grid gap-2 p-4">
              {uniqueProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/rubros/${rubroId}/export?projectId=${project.id}`}
                  className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  {project.name}
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
