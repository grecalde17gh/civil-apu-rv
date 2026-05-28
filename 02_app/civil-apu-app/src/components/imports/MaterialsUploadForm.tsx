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
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700">Archivo Excel (hoja: Materials)</label>
      <input
        type="file"
        accept=".xlsx,.xls"
        className="block w-full rounded border border-zinc-300 bg-white text-sm text-zinc-900 file:mr-4 file:rounded file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
        onChange={(event) => onFileChange(event.target.files ? event.target.files[0] : null)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <button type="submit" disabled={loading} className="rounded bg-zinc-950 px-4 py-2 text-white">
          {loading ? 'Procesando...' : file ? 'Previsualizar' : 'Seleccionar archivo'}
        </button>
      </div>
    </form>
  )
}
