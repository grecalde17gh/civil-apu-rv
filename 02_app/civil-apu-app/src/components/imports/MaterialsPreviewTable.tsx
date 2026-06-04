import type { PreviewRow } from '@/src/lib/imports/materialsImport'

type MaterialsPreviewTableProps = {
  rows: PreviewRow[]
  validRowsCount: number
  duplicateRowsCount: number
  sending: boolean
  onApply: () => void
}

export default function MaterialsPreviewTable({
  rows,
  validRowsCount,
  duplicateRowsCount,
  sending,
  onApply,
}: MaterialsPreviewTableProps) {
  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-300 bg-slate-800 px-3 py-2 text-white sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide">Vista previa</p>
        <button
          type="button"
          onClick={onApply}
          disabled={sending || validRowsCount === 0}
          className="h-8 rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {sending ? 'Importando...' : 'Importar'}
        </button>
      </div>

      <div className="grid gap-px bg-slate-200 md:grid-cols-4">
        <div className="bg-white px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Filas leidas</p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{rows.length}</p>
        </div>
        <div className="bg-white px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Filas validas</p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{validRowsCount}</p>
        </div>
        <div className="bg-white px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Errores</p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{rows.length - validRowsCount}</p>
        </div>
        <div className="bg-white px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Duplicados</p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-950">{duplicateRowsCount}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Fila</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
              <th className="min-w-[320px] px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Descripcion</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Unidad</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Precio unitario</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Estado</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-600">Errores</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => {
              const hasErrors = row.errors && row.errors.length > 0

              return (
                <tr key={row.rowNumber} className={hasErrors ? 'bg-red-50/60' : 'hover:bg-blue-50/60'}>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.rowNumber}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{row.data.Code ?? ''}</td>
                  <td className="px-3 py-2 text-slate-800">{row.data.Description ?? ''}</td>
                  <td className="px-3 py-2 text-slate-700">{row.data.Unit ?? ''}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-slate-700">{row.data.UnitPrice ?? ''}</td>
                  <td className="px-3 py-2 text-slate-700">{hasErrors ? 'Con error' : 'Valida'}</td>
                  <td className="px-3 py-2 text-red-700">{(row.errors || []).join('; ') || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
