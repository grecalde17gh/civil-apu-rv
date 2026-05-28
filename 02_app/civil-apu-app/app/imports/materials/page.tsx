import MaterialsImportClient from '@/src/components/imports/MaterialsImportClient'

export default function MaterialsImportPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-900">Importar materiales</h1>
        <p className="mt-2 text-sm text-zinc-600">Sube un archivo Excel con la hoja <strong>Materials</strong>. Columnas mínimas: Code, Description, Unit, UnitPrice.</p>

        <div className="mt-6">
          <MaterialsImportClient />
        </div>
      </div>
    </div>
  )
}
