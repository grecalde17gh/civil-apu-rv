'use client'

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import MaterialsUploadForm from '@/src/components/imports/MaterialsUploadForm'
import { hasImportUiState } from '@/src/lib/imports/importUiState'
import type {
  CatalogUpdateField,
  CatalogUpdateMode,
  DenominationImportSummary,
  ImportConflict,
  ImportPreviewRow,
  ImportPreviewWarning,
  ImportRowStatus,
} from '@/src/lib/imports/commonImport'

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
  IsActive?: boolean | null
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

const updateFieldOptions: Array<{ field: CatalogUpdateField; label: string }> = [
  { field: 'denomination', label: 'Denominacion IPCO' },
  { field: 'cpc', label: 'CPC' },
  { field: 'vae', label: 'VAE' },
  { field: 'price', label: 'Precio/Tarifa' },
  { field: 'unit', label: 'Unidad' },
  { field: 'isActive', label: 'Estado' },
]

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
  const [warnings, setWarnings] = useState<ImportPreviewWarning[]>([])
  const [omittedOptionalColumns, setOmittedOptionalColumns] = useState<string[]>([])
  const [denominationSummary, setDenominationSummary] = useState<DenominationImportSummary | null>(null)
  const [updateMode, setUpdateMode] = useState<CatalogUpdateMode>('skip-existing')
  const [overwriteFields, setOverwriteFields] = useState<CatalogUpdateField[]>(['denomination'])
  const [createMissingDenominations, setCreateMissingDenominations] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)

  const importableRows = useMemo(
    () => previewRows.filter((row) => row.status !== 'error' && (!row.errors || row.errors.length === 0)).map((row) => row.data),
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
    setWarnings([])
    setOmittedOptionalColumns([])
    setDenominationSummary(null)

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
      setWarnings(body.warnings ?? [])
      setOmittedOptionalColumns(body.omittedOptionalColumns ?? [])
      setDenominationSummary(body.denominationSummary ?? null)
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
    setWarnings([])
    setOmittedOptionalColumns([])
    setDenominationSummary(null)

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
    setWarnings([])
    setOmittedOptionalColumns([])
    setDenominationSummary(null)
    setCreateMissingDenominations(false)
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
        body: JSON.stringify({
          rows: importableRows,
          updateMode,
          overwriteFields: updateMode === 'overwrite-selected' ? overwriteFields : [],
          createMissingDenominations,
        }),
      })
      const body = await response.json()

      if (!response.ok) {
        throw new Error(body.error || 'Error en servidor')
      }

      const result = body.result
      const updatedFieldsText = formatUpdatedFields(result.updatedFields ?? {})
      const createdDenominationsText = `${result.createdDenominations ?? 0} denominaciones IPCO creadas`
      const missingDenominations = Array.isArray(result.missingDenominations) ? result.missingDenominations : []
      const missingDenominationsText = missingDenominations.length > 0
        ? ` Denominaciones IPCO no encontradas: ${missingDenominations.join(', ')}.`
        : ''
      const debugText = Array.isArray(result.debugMessages) && result.debugMessages.length > 0
        ? ` Detalle: ${result.debugMessages.slice(0, 12).join(' | ')}${result.debugMessages.length > 12 ? ' | ...' : ''}`
        : ''
      const warningSummary = warnings.length > 0
        ? ` Advertencias: ${warnings.map((warning) => warning.message).join(' ')} Los registros fueron importados correctamente utilizando valores por defecto.`
        : ''
      setMessage(
        `Importacion completada: ${result.created ?? 0} creados, ${result.updated ?? 0} actualizados, ${result.omitted ?? 0} omitidos, ${result.conflicts ?? 0} conflictos, ${result.rejected ?? 0} rechazados. ${createdDenominationsText}. Campos actualizados: ${updatedFieldsText}.${missingDenominationsText}${warningSummary}${debugText}`,
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
              <p className="mt-1 text-slate-600">Se importan filas nuevas y se pueden actualizar registros existentes del catalogo de {entityLabel}. Codigo, Denominacion IPCO y Estado son opcionales.</p>
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
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Advertencias</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{warnings.length}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
              <span className="text-slate-600">Columnas opcionales omitidas</span>
              <span className="font-mono font-semibold tabular-nums text-slate-950">{omittedOptionalColumns.length}</span>
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
          <section className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <p className="font-semibold">{message}</p>
          </section>
        ) : null}

        {warnings.length > 0 ? (
          <section className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p className="font-semibold">Advertencias</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {warnings.map((warning) => (
                <li key={warning.column}>{warning.message}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {previewRows.length > 0 ? (
          <>
            <CatalogUpdateOptions
              updateMode={updateMode}
              overwriteFields={overwriteFields}
              createMissingDenominations={createMissingDenominations}
              denominationSummary={denominationSummary}
              onModeChange={setUpdateMode}
              onFieldsChange={setOverwriteFields}
              onCreateMissingDenominationsChange={setCreateMissingDenominations}
            />
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
          </>
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

function formatUpdatedFields(fields: Partial<Record<CatalogUpdateField, number>>) {
  const labels: Record<CatalogUpdateField, string> = {
    denomination: 'Denominacion IPCO',
    cpc: 'CPC',
    vae: 'VAE',
    price: 'Precio/Tarifa',
    unit: 'Unidad',
    isActive: 'Estado',
  }
  const entries = Object.entries(fields).filter(([, count]) => Number(count) > 0) as Array<[CatalogUpdateField, number]>
  if (entries.length === 0) return 'ninguno'
  return entries.map(([field, count]) => `${labels[field]} (${count})`).join(', ')
}

function CatalogUpdateOptions({
  updateMode,
  overwriteFields,
  createMissingDenominations,
  denominationSummary,
  onModeChange,
  onFieldsChange,
  onCreateMissingDenominationsChange,
}: {
  updateMode: CatalogUpdateMode
  overwriteFields: CatalogUpdateField[]
  createMissingDenominations: boolean
  denominationSummary: DenominationImportSummary | null
  onModeChange: (mode: CatalogUpdateMode) => void
  onFieldsChange: (fields: CatalogUpdateField[]) => void
  onCreateMissingDenominationsChange: (enabled: boolean) => void
}) {
  function toggleField(field: CatalogUpdateField) {
    onFieldsChange(
      overwriteFields.includes(field)
        ? overwriteFields.filter((current) => current !== field)
        : [...overwriteFields, field],
    )
  }

  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">Actualizacion de registros existentes</p>
      </div>
      <div className="grid gap-3 p-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" name="updateMode" checked={updateMode === 'skip-existing'} onChange={() => onModeChange('skip-existing')} />
          <span>No sobrescribir registros existentes</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="updateMode" checked={updateMode === 'fill-empty'} onChange={() => onModeChange('fill-empty')} />
          <span>Actualizar solo campos vacios</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="updateMode" checked={updateMode === 'overwrite-selected'} onChange={() => onModeChange('overwrite-selected')} />
          <span>Sobrescribir campos seleccionados</span>
        </label>

        {updateMode === 'overwrite-selected' ? (
          <div className="grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            {updateFieldOptions.map((option) => (
              <label key={option.field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={overwriteFields.includes(option.field)}
                  onChange={() => toggleField(option.field)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        ) : null}

        {denominationSummary ? (
          <div className="grid gap-2 border-t border-slate-200 pt-3 text-xs text-slate-700">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <p className="font-semibold text-slate-900">Denominaciones IPCO existentes</p>
                <p className="mt-1 font-mono tabular-nums">{denominationSummary.existing.length} denominaciones / {denominationSummary.recordsWithExisting} registros</p>
                <p className="mt-1 truncate">{denominationSummary.existing.join(', ') || '-'}</p>
              </div>
              <div className="rounded border border-amber-200 bg-amber-50 p-2">
                <p className="font-semibold text-amber-950">Denominaciones IPCO nuevas/no encontradas</p>
                <p className="mt-1 font-mono tabular-nums">{denominationSummary.missing.length} denominaciones / {denominationSummary.recordsWithMissing} registros</p>
                <p className="mt-1 truncate">{denominationSummary.missing.join(', ') || '-'}</p>
              </div>
            </div>
            <label className="flex items-start gap-2 rounded border border-slate-200 bg-white p-2">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={createMissingDenominations}
                onChange={(event) => onCreateMissingDenominationsChange(event.target.checked)}
              />
              <span>Crear automaticamente denominaciones IPCO no existentes</span>
            </label>
          </div>
        ) : null}
      </div>
    </section>
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
