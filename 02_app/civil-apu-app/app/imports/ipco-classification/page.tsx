import Link from 'next/link'
import IpcoClassificationUpdateClient from '@/src/components/imports/IpcoClassificationUpdateClient'

export default function IpcoClassificationImportPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Actualizacion por codigo</p>
              <h1 className="text-xl font-semibold">Actualizar clasificacion IPCO desde Excel</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/imports/materials"
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Importacion masiva
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hojas leidas</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">Materiales, Mano de obra, Equipos</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Formato</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">.xlsx / .xls</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Columnas usadas</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">codigo, denominacion_ipco, cpc</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Alcance</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">Solo clasificacion IPCO y CPC</p>
            </div>
          </div>
        </header>

        <div className="mt-4">
          <IpcoClassificationUpdateClient />
        </div>
      </div>
    </div>
  )
}
