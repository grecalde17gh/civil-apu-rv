import type { RubroFormInput } from '@/src/lib/validations/rubro'

type RubroFormProps = {
  action: (formData: FormData) => Promise<void>
  initialData?: Partial<RubroFormInput>
  submitLabel: string
  hiddenId?: string
  hiddenBudgetId?: string
  hiddenProjectId?: string
  variant?: 'default' | 'technical'
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

export default function RubroForm({
  action,
  initialData,
  submitLabel,
  hiddenId,
  hiddenBudgetId,
  hiddenProjectId,
  variant = 'default',
}: RubroFormProps) {
  if (variant === 'technical') {
    return (
      <form action={action} className="border-t border-slate-200 bg-white">
        <div className="grid gap-px bg-slate-200 md:grid-cols-[130px_minmax(260px,1fr)_90px_110px_120px_110px]">
          <label className="bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Codigo
            <input
              name="code"
              defaultValue={initialData?.code ?? ''}
              required
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm font-semibold text-slate-950"
            />
          </label>

          <label className="bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Estructura ocupacional
            <input
              name="description"
              defaultValue={initialData?.description ?? ''}
              required
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
          </label>

          <label className="bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Unidad
            <input
              name="unit"
              defaultValue={initialData?.unit ?? ''}
              required
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
          </label>

          <label className="bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rendimiento
            <input
              name="performanceValue"
              defaultValue={initialData?.performanceValue?.toString() ?? ''}
              inputMode="decimal"
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
          </label>

          <label className="bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Unidad rend.
            <input
              name="performanceUnit"
              defaultValue={initialData?.performanceUnit ?? ''}
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
          </label>

          <label className="bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Indirectos %
            <input
              name="indirectPercentage"
              defaultValue={initialData?.indirectPercentage?.toString() ?? '0'}
              required
              inputMode="decimal"
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm font-semibold text-slate-950"
            />
          </label>
        </div>

        <div className="grid gap-px border-t border-slate-200 bg-slate-200 md:grid-cols-[160px_160px_160px_minmax(240px,1fr)_130px]">
          <div className="bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            VAE
            <p className="mt-1 flex h-8 items-center rounded border border-slate-200 bg-white px-2 text-sm font-normal normal-case tracking-normal text-slate-500">
              Pendiente
            </p>
          </div>

          <label className="bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Estado
            <select
              name="status"
              defaultValue={initialData?.status ?? 'DRAFT'}
              required
              className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950"
            >
              {rubroStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Calculo
            <select
              name="calculationStatus"
              defaultValue={initialData?.calculationStatus ?? 'PENDING'}
              required
              className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950"
            >
              {calculationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Observacion
            <input
              name="notes"
              defaultValue={initialData?.notes ?? ''}
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
          </label>

          <div className="flex items-end bg-slate-50 px-3 py-2">
            <button
              type="submit"
              className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
            >
              {submitLabel}
            </button>
          </div>
        </div>

        <label className="block border-t border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Especificacion tecnica
          <textarea
            name="technicalSpecification"
            defaultValue={initialData?.technicalSpecification ?? ''}
            rows={4}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm font-normal normal-case tracking-normal text-slate-950"
          />
        </label>

        {hiddenId ? <input type="hidden" name="id" value={hiddenId} /> : null}
        {hiddenBudgetId ? <input type="hidden" name="budgetId" value={hiddenBudgetId} /> : null}
        {hiddenProjectId ? <input type="hidden" name="projectId" value={hiddenProjectId} /> : null}
      </form>
    )
  }

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
        Estructura ocupacional
        <input
          name="description"
          defaultValue={initialData?.description ?? ''}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-sm font-medium text-zinc-700">
          VAE
          <p className="flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm font-normal text-zinc-500">
            Pendiente
          </p>
        </div>

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

      <label className="space-y-2 text-sm font-medium text-zinc-700">
        Especificacion tecnica
        <textarea
          name="technicalSpecification"
          defaultValue={initialData?.technicalSpecification ?? ''}
          rows={6}
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
