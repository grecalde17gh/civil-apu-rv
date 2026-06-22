'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import MaterialsUploadForm from './MaterialsUploadForm'
import { hasImportUiState } from '@/src/lib/imports/importUiState'
import type { IpcoClassificationUpdateResult } from '@/src/lib/imports/ipcoClassificationUpdate'

export default function IpcoClassificationUpdateClient() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedMessage, setLoadedMessage] = useState<string | null>(null)
  const [result, setResult] = useState<IpcoClassificationUpdateResult | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  const canClear = hasImportUiState({
    fileName: file?.name ?? null,
    previewRowsCount: result?.totals.read ?? 0,
    error,
    message: result ? 'updated' : null,
    loadedMessage,
  })

  function handleFileChange(selectedFile: File | null) {
    setFile(selectedFile)
    setError(null)
    setResult(null)
    setLoadedMessage(selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : null)
  }

  function handleClearImport() {
    setFile(null)
    setLoading(false)
    setError(null)
    setLoadedMessage(null)
    setResult(null)
    setFileInputKey((value) => value + 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setResult(null)

    if (!file) {
      setError('Selecciona un archivo')
      return
    }
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError('Selecciona un archivo Excel con extension .xlsx o .xls')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/imports/ipco-classification/apply', { method: 'POST', body: formData })
      const body = await response.json()

      if (!response.ok) {
        throw new Error(body.error || 'Error en servidor')
      }

      setResult(body.result)
      setLoadedMessage(`Archivo procesado: ${file.name}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
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
              <p className="mt-1 text-slate-600">Debe contener las hojas Materiales, Mano de obra y Equipos.</p>
            </div>
            <div className="px-3 py-2">
              <p className="font-semibold text-slate-900">2. Columnas usadas</p>
              <p className="mt-1 font-mono text-xs text-slate-700">codigo, denominacion_ipco, cpc</p>
            </div>
            <div className="px-3 py-2">
              <p className="font-semibold text-slate-900">3. Actualizar</p>
              <p className="mt-1 text-slate-600">Solo se actualizan registros existentes encontrados por codigo.</p>
            </div>
          </div>
        </section>

        <SummaryBox result={result} />
      </aside>

      <div className="min-w-0 space-y-4">
        <MaterialsUploadForm
          file={file}
          loading={loading}
          error={error}
          loadedMessage={loadedMessage}
          inputKey={fileInputKey}
          canClear={canClear}
          onFileChange={handleFileChange}
          onClear={handleClearImport}
          onSubmit={handleSubmit}
        />

        {result ? <ResultTables result={result} /> : <EmptyState />}
      </div>
    </div>
  )
}

function SummaryBox({ result }: { result: IpcoClassificationUpdateResult | null }) {
  const totals = result?.totals ?? { read: 0, updated: 0, notFound: 0, withoutIpco: 0, errors: 0 }

  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">Resumen general</p>
      </div>
      <div className="divide-y divide-slate-200 text-sm">
        <SummaryRow label="Filas leidas" value={totals.read} />
        <SummaryRow label="Actualizados" value={totals.updated} />
        <SummaryRow label="No encontrados" value={totals.notFound} />
        <SummaryRow label="Sin IPCO" value={totals.withoutIpco} />
        <SummaryRow label="Errores" value={totals.errors} />
      </div>
    </section>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-mono font-semibold tabular-nums text-slate-950">{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">Resultado</p>
      </div>
      <p className="px-3 py-10 text-center text-sm text-slate-500">
        Selecciona un Excel unificado para actualizar la clasificacion IPCO.
      </p>
    </section>
  )
}

function ResultTables({ result }: { result: IpcoClassificationUpdateResult }) {
  return (
    <div className="space-y-4">
      {[result.materials, result.labor, result.equipment].map((section) => (
        <section key={section.catalog} className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white">{section.sheetName}</p>
          </div>
          <div className="grid gap-px bg-slate-200 sm:grid-cols-5">
            <SummaryTile label="Leidas" value={section.read} />
            <SummaryTile label="Actualizadas" value={section.updated} />
            <SummaryTile label="No encontradas" value={section.notFound} />
            <SummaryTile label="Sin IPCO" value={section.withoutIpco} />
            <SummaryTile label="Errores" value={section.errors.length} />
          </div>
          {section.errors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Fila</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                    <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {section.errors.map((item) => (
                    <tr key={`${section.catalog}-${item.rowNumber}-${item.code ?? 'sin-codigo'}`} className="bg-red-50/60">
                      <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{item.rowNumber}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{item.code ?? '-'}</td>
                      <td className="px-3 py-2 text-slate-700">{item.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{value}</p>
    </div>
  )
}
