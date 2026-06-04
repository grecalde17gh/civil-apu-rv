import Link from 'next/link'
import MaterialsImportClient from '@/src/components/imports/MaterialsImportClient'

export default function MaterialsImportPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <header className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Modulo de carga de datos</p>
              <h1 className="text-xl font-semibold">Importacion de materiales desde Excel</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/materials"
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Volver
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-4">
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hoja requerida</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">Materials</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Formato</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">.xlsx / .xls</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Columnas minimas</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">Code, Description, Unit, UnitPrice</p>
            </div>
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Destino</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-950">Catalogo de materiales</p>
            </div>
          </div>
        </header>

        <div className="mt-4">
          <MaterialsImportClient />
        </div>
      </div>
    </div>
  )
}
