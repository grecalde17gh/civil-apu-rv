'use client'

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import MaterialsUploadForm from '@/src/components/imports/MaterialsUploadForm'
import { hasImportUiState } from '@/src/lib/imports/importUiState'
import type { ImportConflict, ImportPreviewRow, ImportRowStatus } from '@/src/lib/imports/commonImport'

type CatalogRow = {
  Code?: string | null
  Description?: string | null
  RoleName?: string | null
  Unit?: string | null
  UnitPrice?: number | null
  HourlyCost?: number | null
  HourlyRate?: number | null
  Cpc?: string | null
  Vae?: number | null
  Category?: string | null
  EquipmentType?: string | null
  UsesCategory1?: boolean | null
  UsesCategory2?: boolean | null
}

type CatalogImportClientProps<T extends CatalogRow> = {
  title: string
  entityLabel: string
  sheetName: string
  columnsLabel: string
  templateHref: string
  previewEndpoint: string
  applyEndpoint: string
  descriptionHeader: string
  costHeader: string
  costField: string
  getDescription: (row: T) => string
  getCost: (row: T) => number | null | undefined
}

function getDuplicateRowsCount<T extends CatalogRow>(previewRows: Array<ImportPreviewRow<T>>) {
  const codeCounts = new Map<string, number>()

  for (const row of previewRows) {
    const code = row.data.Code ? String(row.data.Code).trim().toUpperCase() : ''
    if (!code) continue
    codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1)
  }

  return [...codeCounts.values()].reduce((sum, count) => sum + (count > 1 ? count : 0), 0)
}

function countRowsByStatus<T extends CatalogRow>(previewRows: Array<ImportPreviewRow<T>>, status: ImportRowStatus) {
  return previewRows.filter((row) => row.status === status).length
}

function getStatusLabel(status: ImportRowStatus) {
  const labels: Record<ImportRowStatus, string> = {
    new: 'Nuevo',
    existing: 'Existente igual',
    conflict: 'Conflicto',
    error: 'Error',
  }

  return labels[status]
}

function getStatusClassName(status: ImportRowStatus) {
  const classes: Record<ImportRowStatus, string> = {
    new: 'bg-blue-50/60 hover:bg-blue-50',
    existing: 'bg-emerald-50/60',
    conflict: 'bg-amber-50/80',
    error: 'bg-red-50/70',
  }

  return classes[status]
}

function formatConflict(conflict: ImportConflict) {
  return `${conflict.field}: existente ${conflict.existing ?? ''} / Excel ${conflict.incoming ?? ''}`
}

export default function CatalogImportClient<T extends CatalogRow>({
  title,
  entityLabel,
  sheetName,
  columnsLabel,
  templateHref,
  previewEndpoint,
  applyEndpoint,
  descriptionHeader,
  costHeader,
  costField,
  getDescription,
  getCost,
}: CatalogImportClientProps<T>) {
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<Array<ImportPreviewRow<T>>>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loadedMessage, setLoadedMessage] = useState<string | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  const importableRows = useMemo(
    () => previewRows.filter((row) => row.status === 'new' && (!row.errors || row.errors.length === 0)).map((row) => row.data),
    [previewRows],
  )
  const duplicateRowsCount = useMemo(() => getDuplicateRowsCount(previewRows), [previewRows])
  const newRowsCount = useMemo(() => countRowsByStatus(previewRows, 'new'), [previewRows])
  const existingRowsCount = useMemo(() => countRowsByStatus(previewRows, 'existing'), [previewRows])
  const conflictRowsCount = useMemo(() => countRowsByStatus(previewRows, 'conflict'), [previewRows])
  const errorRowsCount = useMemo(() => countRowsByStatus(previewRows, 'error'), [previewRows])
  const canClear = hasImportUiState({
    fileName: file?.name ?? null,
    previewRowsCount: previewRows.length,
    error,
    message,
    loadedMessage,
  })

  function hasValidExcelExtension(selectedFile: File) {
    return /\.(xlsx|xls)$/i.test(selectedFile.name)
  }

  async function previewFile(selectedFile: File) {
    setError(null)
    setMessage(null)
    setLoadedMessage(`Archivo cargado: ${selectedFile.name}`)
    setPreviewRows([])

    if (!hasValidExcelExtension(selectedFile)) {
      setError('Selecciona un archivo Excel con extension .xlsx o .xls')
      return
    }

    setPreviewLoading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(previewEndpoint, { method: 'POST', body: formData })
      const body = await response.json()

      if (!response.ok) {
        setError(body.error || 'Error en servidor al leer el archivo')
        return
      }

      const preview = body.preview ?? []
      setPreviewRows(preview)
      setLoadedMessage(
        preview.length > 0
          ? `Archivo cargado. ${preview.length} filas detectadas.`
          : 'Archivo cargado, pero no se detectaron filas importables.',
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setPreviewLoading(false)
    }
  }

  function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      setError('Selecciona un archivo')
      return
    }

    void previewFile(file)
  }

  function handleFileChange(selectedFile: File | null) {
    setFile(selectedFile)
    setPreviewRows([])
    setError(null)
    setMessage(null)
    setLoadedMessage(null)

    if (!selectedFile) return
    void previewFile(selectedFile)
  }

  function handleClearImport() {
    setFile(null)
    setPreviewRows([])
    setPreviewLoading(false)
    setApplyLoading(false)
    setError(null)
    setMessage(null)
    setLoadedMessage(null)
    setFileInputKey((value) => value + 1)
  }

  async function handleApply() {
    setError(null)
    setMessage(null)
    setApplyLoading(true)

    try {
      const response = await fetch(applyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importableRows }),
      })
      const body = await response.json()

      if (!response.ok) {
        throw new Error(body.error || 'Error en servidor')
      }

      const result = body.result
      setMessage(
        `Importacion completada: ${result.created ?? 0} creados, ${result.omitted ?? 0} omitidos, ${result.conflicts ?? 0} conflictos, ${result.rejected ?? 0} rechazados`,
      )
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
              <p className="mt-1 text-slate-600">La hoja debe llamarse {sheetName} y contener {columnsLabel}.</p>
            </div>
            <div className="px-3 py-2">
              <p className="font-semibold text-slate-900">2. Descargar plantilla</p>
              <a className="mt-1 inline-flex h-8 items-center rounded border border-slate-300 px-3 text-xs font-semibold uppercase tracking-wide text-slate-800 hover:bg-slate-100" href={templateHref}>
                Descargar plantilla
              </a>
            </div>
            <div className="px-3 py-2">
              <p className="font-semibold text-slate-900">3. Validar e importar</p>
              <p className="mt-1 text-slate-600">Solo se envian filas nuevas al catalogo de {entityLabel}.</p>
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
              <span className="text-slate-600">Nuevas</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{newRowsCount}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Existentes iguales</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{existingRowsCount}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Conflictos</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{conflictRowsCount}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Errores</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{errorRowsCount}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Duplicados</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{duplicateRowsCount}</span>
            </div>
          </div>
        </section>
      </aside>

      <div className="min-w-0 space-y-4">
        <MaterialsUploadForm
          file={file}
          loading={previewLoading}
          error={error}
          loadedMessage={loadedMessage}
          inputKey={fileInputKey}
          canClear={canClear}
          onFileChange={handleFileChange}
          onClear={handleClearImport}
          onSubmit={handlePreview}
        />

        {message ? (
          <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {message}
          </p>
        ) : null}

        {previewRows.length > 0 ? (
          <CatalogPreviewTable
            title={title}
            rows={previewRows}
            importableRowsCount={importableRows.length}
            duplicateRowsCount={duplicateRowsCount}
            sending={applyLoading}
            descriptionHeader={descriptionHeader}
            costHeader={costHeader}
            costField={costField}
            getDescription={getDescription}
            getCost={getCost}
            onApply={handleApply}
          />
        ) : (
          <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">Vista previa</p>
            </div>
            <p className="px-3 py-10 text-center text-sm text-slate-500">
              Selecciona un archivo Excel para cargar y revisar las filas antes de importar.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}

function CatalogPreviewTable<T extends CatalogRow>({
  rows,
  importableRowsCount,
  sending,
  descriptionHeader,
  costHeader,
  costField,
  getDescription,
  getCost,
  onApply,
}: {
  title: string
  rows: Array<ImportPreviewRow<T>>
  importableRowsCount: number
  duplicateRowsCount: number
  sending: boolean
  descriptionHeader: string
  costHeader: string
  costField: string
  getDescription: (row: T) => string
  getCost: (row: T) => number | null | undefined
  onApply: () => void
}) {
  const showMaterialCategories = rows.some((row) => row.data.UsesCategory1 !== undefined || row.data.UsesCategory2 !== undefined)

  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-300 bg-slate-800 px-3 py-2 text-white sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide">Vista previa</p>
        <button
          type="button"
          onClick={onApply}
          disabled={sending || importableRowsCount === 0}
          className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {sending ? 'Importando...' : `Importar datos (${importableRowsCount})`}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Fila</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
              <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">{descriptionHeader}</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">{costHeader} original</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">{costHeader} normalizado</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">CPC</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">VAE</th>
              {showMaterialCategories ? (
                <>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cat.1</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Cat.2</th>
                </>
              ) : null}
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Errores</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => {
              const messages = [...(row.errors || []), ...(row.conflicts || []).map(formatConflict)]

              return (
                <tr key={row.rowNumber} className={getStatusClassName(row.status)}>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.rowNumber}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{row.data.Code ?? ''}</td>
                  <td className="px-3 py-2 text-slate-800">{getDescription(row.data)}</td>
                  <td className="px-3 py-2 text-slate-700">{row.data.Unit ?? ''}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.originalValues[costField] ?? ''}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{getCost(row.data) ?? ''}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.data.Cpc ?? ''}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.data.Vae ?? ''}</td>
                  {showMaterialCategories ? (
                    <>
                      <td className="px-3 py-2 text-slate-700">{row.data.UsesCategory1 ? 'Si' : 'No'}</td>
                      <td className="px-3 py-2 text-slate-700">{row.data.UsesCategory2 ? 'Si' : 'No'}</td>
                    </>
                  ) : null}
                  <td className="px-3 py-2 font-semibold text-slate-700">{getStatusLabel(row.status)}</td>
                  <td className="px-3 py-2 text-slate-700">{messages.join('; ') || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
