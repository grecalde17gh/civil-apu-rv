'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import type { RubroImportPreview, RubroImportResult } from '@/src/lib/imports/rubrosImport'

type RubroImportButtonProps = {
  buttonLabel?: string
}

export default function RubroImportButton({ buttonLabel = 'Importar' }: RubroImportButtonProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<RubroImportPreview | null>(null)
  const [result, setResult] = useState<RubroImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isModalOpen = Boolean(preview || result || error)
  const portalRoot = typeof document === 'undefined' ? null : document.body

  useEffect(() => {
    if (!isModalOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isModalOpen])

  async function handleFile(selectedFile: File | null) {
    setError(null)
    setPreview(null)
    setResult(null)
    setFile(selectedFile)

    if (!selectedFile) return
    if (!/\.(xlsx|xls)$/i.test(selectedFile.name)) {
      setError('Selecciona un archivo Excel .xlsx o .xls')
      setFile(null)
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    setValidating(true)

    try {
      const response = await fetch('/api/imports/rubros/preview', { method: 'POST', body: formData })
      const body = await response.json()

      if (!response.ok) {
        throw new Error(body.error || 'No se pudo validar el archivo')
      }

      setPreview(body.preview)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'No se pudo validar el archivo')
      setFile(null)
    } finally {
      setValidating(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function confirmImport() {
    if (!file) {
      setError('Selecciona y valida un archivo antes de confirmar.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setError(null)
    setImporting(true)

    try {
      const response = await fetch('/api/imports/rubros/apply', { method: 'POST', body: formData })
      const body = await response.json()

      if (!response.ok) {
        throw new Error(body.error || 'No se pudo importar el archivo')
      }

      setResult(body.result)
      router.refresh()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'No se pudo importar el archivo')
    } finally {
      setImporting(false)
    }
  }

  function resetImport() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setValidating(false)
    setImporting(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const canConfirm = Boolean(file && preview && preview.totals.errors === 0 && !importing && !validating)

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={validating || importing}
        className="h-8 rounded border border-amber-300 bg-amber-600 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {validating ? 'Validando' : importing ? 'Importando' : buttonLabel}
      </button>

      {portalRoot && isModalOpen
        ? createPortal(
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 p-3 text-xs text-slate-800 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="rubro-import-title">
              <div className="flex max-h-[85vh] w-[90vw] max-w-[1200px] flex-col overflow-hidden rounded border border-slate-300 bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="min-w-0">
                    <p id="rubro-import-title" className="font-semibold text-slate-950">Importacion de rubros/APU</p>
                    {file ? <p className="mt-1 truncate text-slate-500">{file.name}</p> : null}
                  </div>
                  <button type="button" onClick={resetImport} className="shrink-0 rounded border border-slate-300 px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50">
                    Cerrar
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                  {error ? <p className="mb-2 rounded border border-rose-200 bg-rose-50 px-2 py-2 font-semibold text-rose-700">{error}</p> : null}
                  {preview ? <PreviewTable preview={preview} /> : null}
                  {result ? <ResultBox result={result} /> : null}
                </div>

                {preview ? (
                  <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
                    <button type="button" onClick={resetImport} className="rounded border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmImport()}
                      disabled={!canConfirm}
                      className="rounded bg-blue-700 px-3 py-1.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {importing ? 'Importando' : 'Confirmar importacion'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>,
            portalRoot,
          )
        : null}
    </div>
  )
}

function PreviewTable({ preview }: { preview: RubroImportPreview }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        <SummaryItem label="Hojas" value={preview.totals.sheets} />
        <SummaryItem label="OK" value={preview.totals.ok} />
        <SummaryItem label="Advertencias" value={preview.totals.warnings} />
        <SummaryItem label="Errores" value={preview.totals.errors} />
        <SummaryItem label="Omitidas" value={preview.totals.omittedSheets} />
      </div>
      <div className="max-h-80 overflow-auto rounded border border-slate-200">
        <table className="min-w-[1100px] divide-y divide-slate-200 text-left">
          <thead className="bg-slate-100">
            <tr>
              {['Hoja', 'Codigo rubro', 'Descripcion', 'Estado', 'Equipos', 'Mano de obra', 'Materiales', 'Transporte', 'Errores / advertencias'].map((header) => (
                <th key={header} className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {preview.sheets.map((sheet) => (
              <tr key={sheet.sheetName} className={sheet.status === 'Error' ? 'bg-rose-50' : sheet.status === 'Con advertencias' ? 'bg-amber-50' : 'bg-white'}>
                <td className="px-2 py-2 font-mono text-slate-700">{sheet.sheetName}</td>
                <td className="px-2 py-2 font-mono text-slate-700">{sheet.code}</td>
                <td className="px-2 py-2 text-slate-700">{sheet.description || '-'}</td>
                <td className="px-2 py-2 font-semibold text-slate-800">{sheet.status}</td>
                <td className="px-2 py-2 font-mono tabular-nums">{sheet.equipmentCount}</td>
                <td className="px-2 py-2 font-mono tabular-nums">{sheet.laborCount}</td>
                <td className="px-2 py-2 font-mono tabular-nums">{sheet.materialsCount}</td>
                <td className="px-2 py-2 font-mono tabular-nums">{sheet.transportCount}</td>
                <td className="px-2 py-2 text-slate-700">{[...sheet.errors, ...sheet.warnings].slice(0, 3).join(' | ') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview.components.length > 0 ? (
        <div className="max-h-72 overflow-auto rounded border border-slate-200">
          <table className="min-w-[980px] divide-y divide-slate-200 text-left">
            <thead className="bg-slate-100">
              <tr>
                {['Seccion', 'Texto leido del Excel', 'Componente encontrado', 'Metodo de coincidencia', 'Estado'].map((header) => (
                  <th key={header} className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {preview.components.map((component) => (
                <tr key={`${component.sheetName}-${component.section}-${component.rowNumber}`} className={component.status === 'OK' ? 'bg-white' : component.status === 'Ambiguo' ? 'bg-amber-50' : 'bg-rose-50'}>
                  <td className="px-2 py-2 text-slate-700">{component.section}</td>
                  <td className="px-2 py-2 text-slate-700">{component.sourceText}</td>
                  <td className="px-2 py-2 text-slate-700">
                    {component.matchedComponent ?? (component.candidates.length > 0 ? component.candidates.join(' | ') : '-')}
                  </td>
                  <td className="px-2 py-2 text-slate-700">{component.matchMethod}</td>
                  <td className="px-2 py-2 font-semibold text-slate-800">{component.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

function ResultBox({ result }: { result: RubroImportResult }) {
  return (
    <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-2">
      <p className="font-semibold text-emerald-950">Resumen final</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryItem label="Creados" value={result.created} />
        <SummaryItem label="Actualizados" value={result.updated} />
        <SummaryItem label="Importados" value={result.componentsImported} />
        <SummaryItem label="Omitidos" value={result.componentsOmitted} />
        <SummaryItem label="No encontrados" value={result.componentsNotFound} />
        <SummaryItem label="Ambiguos" value={result.componentsAmbiguous} />
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-slate-200 bg-white px-2 py-1">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-mono font-semibold tabular-nums text-slate-950">{value}</p>
    </div>
  )
}
