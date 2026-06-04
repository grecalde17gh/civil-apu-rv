import type { FormEvent } from 'react'

type MaterialsUploadFormProps = {
  file: File | null
  loading: boolean
  error: string | null
  onFileChange: (file: File | null) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function MaterialsUploadForm({ file, loading, error, onFileChange, onSubmit }: MaterialsUploadFormProps) {
  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-white">Carga de archivo</p>
      </div>

      <div className="grid gap-px bg-slate-200 lg:grid-cols-[minmax(260px,1fr)_150px_120px]">
        <div className="bg-white px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Archivo seleccionado</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-950">{file ? file.name : 'Ningun archivo seleccionado'}</p>
        </div>

        <div className="flex items-end bg-white px-3 py-2">
          <label className="inline-flex h-8 w-full cursor-pointer items-center justify-center rounded border border-slate-300 bg-slate-50 px-3 text-xs font-semibold uppercase tracking-wide text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900">
            Seleccionar archivo
            <input
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files ? event.target.files[0] : null)}
            />
          </label>
        </div>

        <div className="flex items-end bg-white px-3 py-2">
          <button
            type="submit"
            disabled={loading || !file}
            className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Validando...' : 'Validar'}
          </button>
        </div>
      </div>

      {error ? <p className="border-t border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
    </form>
  )
}
