import type { RubroFormInput } from '@/src/lib/validations/rubro'

type RubroFormProps = {
  action: (formData: FormData) => Promise<void>
  initialData?: Partial<RubroFormInput>
  submitLabel: string
  hiddenId?: string
  hiddenBudgetId?: string
  hiddenProjectId?: string
}

const rubroStatusOptions = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'VALIDATED', label: 'Validado' },
  { value: 'ARCHIVED', label: 'Archivado' },
]

const calculationStatusOptions = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CALCULATED', label: 'Calculado' },
  { value: 'WITH_OBSERVATIONS', label: 'Con observaciones' },
  { value: 'ERROR', label: 'Error' },
]

export default function RubroForm({ action, initialData, submitLabel, hiddenId, hiddenBudgetId, hiddenProjectId }: RubroFormProps) {
  return (
    <form action={action} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Código
          <input
            name="code"
            defaultValue={initialData?.code ?? ''}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Unidad
          <input
            name="unit"
            defaultValue={initialData?.unit ?? ''}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-zinc-700">
        Descripción
        <input
          name="description"
          defaultValue={initialData?.description ?? ''}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Categoría
          <input
            name="category"
            defaultValue={initialData?.category ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Rendimiento
          <input
            name="performanceValue"
            defaultValue={initialData?.performanceValue?.toString() ?? ''}
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Unidad de rendimiento
          <input
            name="performanceUnit"
            defaultValue={initialData?.performanceUnit ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          % Costos indirectos
          <input
            name="indirectPercentage"
            defaultValue={initialData?.indirectPercentage?.toString() ?? '0'}
            required
            inputMode="decimal"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Estado del rubro
          <select
            name="status"
            defaultValue={initialData?.status ?? 'DRAFT'}
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {rubroStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Estado del cálculo
          <select
            name="calculationStatus"
            defaultValue={initialData?.calculationStatus ?? 'PENDING'}
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {calculationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hiddenId ? <input type="hidden" name="id" value={hiddenId} /> : null}
      {hiddenBudgetId ? <input type="hidden" name="budgetId" value={hiddenBudgetId} /> : null}
      {hiddenProjectId ? <input type="hidden" name="projectId" value={hiddenProjectId} /> : null}

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
