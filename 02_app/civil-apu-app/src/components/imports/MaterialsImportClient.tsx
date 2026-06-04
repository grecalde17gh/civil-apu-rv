'use client'

import { useMemo, useState } from 'react'
import MaterialsPreviewTable from '@/src/components/imports/MaterialsPreviewTable'
import MaterialsUploadForm from '@/src/components/imports/MaterialsUploadForm'
import type { PreviewRow } from '@/src/lib/imports/materialsImport'
import type { MaterialImportRow } from '@/src/lib/validations/materialImport'

export default function MaterialsImportClient() {
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const validRows = useMemo<MaterialImportRow[]>(
    () => previewRows.filter((row) => !row.errors || row.errors.length === 0).map((row) => row.data),
    [previewRows],
  )
  const duplicateRowsCount = useMemo(() => {
    const codeCounts = new Map<string, number>()

    for (const row of previewRows) {
      const code = row.data.Code ? String(row.data.Code).trim().toUpperCase() : ''
      if (!code) continue
      codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1)
    }

    return [...codeCounts.values()].reduce((sum, count) => sum + (count > 1 ? count : 0), 0)
  }, [previewRows])

  async function handlePreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!file) {
      setError('Selecciona un archivo')
      return
    }

    setPreviewLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/imports/materials/preview', { method: 'POST', body: formData })
      const body = await response.json()

      if (!response.ok) {
        setError(body.error || 'Error en servidor')
        return
      }

      setPreviewRows(body.preview ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleApply() {
    setError(null)
    setMessage(null)
    setApplyLoading(true)

    try {
      const response = await fetch('/api/imports/materials/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      })
      const body = await response.json()

      if (!response.ok) {
        throw new Error(body.error || 'Error en servidor')
      }

      const result = body.result
      setMessage(`Importacion completada: ${result.created} creados, ${result.updated} actualizados`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setApplyLoading(false)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white">Instrucciones</p>
          </div>
          <div className="divide-y divide-slate-200 text-sm">
            <div className="px-3 py-2">
              <p className="font-semibold text-slate-900">1. Preparar archivo</p>
              <p className="mt-1 text-slate-600">La hoja debe llamarse Materials y contener columnas tecnicas minimas.</p>
            </div>
            <div className="px-3 py-2">
              <p className="font-semibold text-slate-900">2. Validar</p>
              <p className="mt-1 text-slate-600">El sistema revisa filas validas y errores antes de guardar.</p>
            </div>
            <div className="px-3 py-2">
              <p className="font-semibold text-slate-900">3. Importar</p>
              <p className="mt-1 text-slate-600">Solo se envian filas validas al catalogo de materiales.</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white">Resumen de importacion</p>
          </div>
          <div className="divide-y divide-slate-200 text-sm">
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Filas leidas</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{previewRows.length}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Filas validas</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{validRows.length}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Errores</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{previewRows.length - validRows.length}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Duplicados</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{duplicateRowsCount}</span>
            </div>
          </div>
        </section>
      </aside>

      <div className="min-w-0 space-y-4">
        <MaterialsUploadForm file={file} loading={previewLoading} error={error} onFileChange={setFile} onSubmit={handlePreview} />

        {message ? (
          <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {message}
          </p>
        ) : null}

        {previewRows.length > 0 ? (
          <MaterialsPreviewTable
            rows={previewRows}
            validRowsCount={validRows.length}
            duplicateRowsCount={duplicateRowsCount}
            sending={applyLoading}
            onApply={handleApply}
          />
        ) : (
          <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Vista previa</p>
            </div>
            <p className="px-3 py-10 text-center text-sm text-slate-500">
              Selecciona un archivo Excel y pulsa Validar para revisar las filas antes de importar.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
