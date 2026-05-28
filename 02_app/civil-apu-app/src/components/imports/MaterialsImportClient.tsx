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
    <div className="space-y-6">
      <MaterialsUploadForm file={file} loading={previewLoading} error={error} onFileChange={setFile} onSubmit={handlePreview} />

      {message ? <p className="text-sm text-zinc-700">{message}</p> : null}

      {previewRows.length > 0 ? (
        <MaterialsPreviewTable rows={previewRows} validRowsCount={validRows.length} sending={applyLoading} onApply={handleApply} />
      ) : null}
    </div>
  )
}
