import type { ProjectFormInput } from '@/src/lib/validations/project'

type ProjectFormProps = {
  action: (formData: FormData) => Promise<void>
  initialData?: Partial<ProjectFormInput>
  submitLabel: string
  hiddenId?: string
}

const projectStatusOptions = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'CLOSED', label: 'Cerrado' },
  { value: 'ARCHIVED', label: 'Archivado' },
]

export default function ProjectForm({ action, initialData, submitLabel, hiddenId }: ProjectFormProps) {
  return (
    <form action={action} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Nombre del proyecto
          <input
            name="name"
            defaultValue={initialData?.name ?? ''}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Cliente
          <input
            name="clientName"
            defaultValue={initialData?.clientName ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Ubicación
          <input
            name="location"
            defaultValue={initialData?.location ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Provincia
          <input
            name="province"
            defaultValue={initialData?.province ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Ciudad
          <input
            name="city"
            defaultValue={initialData?.city ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          % Costos indirectos por defecto
          <input
            name="defaultIndirectPercentage"
            defaultValue={initialData?.defaultIndirectPercentage?.toString() ?? '20'}
            required
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Fecha de inicio
          <input
            type="date"
            name="startDate"
            defaultValue={initialData?.startDate ? initialData.startDate.toISOString().slice(0, 10) : ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Fecha de fin
          <input
            type="date"
            name="endDate"
            defaultValue={initialData?.endDate ? initialData.endDate.toISOString().slice(0, 10) : ''}
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
        Estado del proyecto
        <select
          name="status"
          defaultValue={initialData?.status ?? 'ACTIVE'}
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
        >
          {projectStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

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
