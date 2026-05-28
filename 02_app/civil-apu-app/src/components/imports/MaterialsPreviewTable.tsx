import type { PreviewRow } from '@/src/lib/imports/materialsImport'

type MaterialsPreviewTableProps = {
  rows: PreviewRow[]
  validRowsCount: number
  sending: boolean
  onApply: () => void
}

export default function MaterialsPreviewTable({ rows, validRowsCount, sending, onApply }: MaterialsPreviewTableProps) {
  return (
    <div>
      <div className="mb-4">
        <button type="button" onClick={onApply} disabled={sending || validRowsCount === 0} className="rounded bg-emerald-600 px-4 py-2 text-white">
          {sending ? 'Importando...' : `Confirmar importacion (${validRowsCount} filas validas)`}
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-xs text-zinc-500">Fila</th>
              <th className="px-4 py-2 text-xs text-zinc-500">Code</th>
              <th className="px-4 py-2 text-xs text-zinc-500">Description</th>
              <th className="px-4 py-2 text-xs text-zinc-500">Unit</th>
              <th className="px-4 py-2 text-xs text-zinc-500">UnitPrice</th>
              <th className="px-4 py-2 text-xs text-zinc-500">Errores</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.map((row) => (
              <tr key={row.rowNumber}>
                <td className="px-4 py-2 text-sm text-zinc-700">{row.rowNumber}</td>
                <td className="px-4 py-2 text-sm text-zinc-700">{row.data.Code ?? ''}</td>
                <td className="px-4 py-2 text-sm text-zinc-700">{row.data.Description ?? ''}</td>
                <td className="px-4 py-2 text-sm text-zinc-700">{row.data.Unit ?? ''}</td>
                <td className="px-4 py-2 text-sm text-zinc-700">{row.data.UnitPrice ?? ''}</td>
                <td className="px-4 py-2 text-sm text-red-600">{(row.errors || []).join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
