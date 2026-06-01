import type { BudgetFormInput } from '@/src/lib/validations/budget'

type BudgetFormProps = {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  initialData?: Partial<BudgetFormInput>
  hiddenId?: string
  hiddenProjectId?: string
}

const budgetStatusOptions = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'REVIEWED', label: 'Revisado' },
  { value: 'ISSUED', label: 'Emitido' },
  { value: 'ARCHIVED', label: 'Archivado' },
]

export default function BudgetForm({ action, submitLabel, initialData, hiddenId, hiddenProjectId }: BudgetFormProps) {
  return (
    <form action={action} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Código del presupuesto
          <input
            name="code"
            defaultValue={initialData?.code ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Nombre del presupuesto
          <input
            name="name"
            defaultValue={initialData?.name ?? ''}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Estado
          <select
            name="status"
            defaultValue={initialData?.status ?? 'DRAFT'}
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {budgetStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Costos indirectos (%)
          <input
            name="indirectPercentage"
            defaultValue={initialData?.indirectPercentage?.toString() ?? '0'}
            required
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          IVA (%)
          <input
            name="ivaPercentage"
            defaultValue={initialData?.ivaPercentage?.toString() ?? '0'}
            required
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Fecha de emisión
          <input
            type="date"
            name="issuedAt"
            defaultValue={initialData?.issuedAt ? initialData.issuedAt.toISOString().slice(0, 10) : ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-zinc-700">
        Notas
        <textarea
          name="notes"
          defaultValue={initialData?.notes ?? ''}
          rows={4}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      {hiddenProjectId ? <input type="hidden" name="projectId" value={hiddenProjectId} /> : null}
      {hiddenId ? <input type="hidden" name="id" value={hiddenId} /> : null}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
