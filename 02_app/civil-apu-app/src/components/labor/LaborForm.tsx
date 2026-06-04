import type { LaborFormInput } from '@/src/lib/validations/labor'

type LaborFormProps = {
  action: (formData: FormData) => Promise<void>
  initialData?: Partial<LaborFormInput>
  submitLabel: string
  hiddenId?: string
}

export default function LaborForm({ action, initialData, submitLabel, hiddenId }: LaborFormProps) {
  return (
    <form action={action} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Código
          <input
            name="code"
            placeholder="MO-001"
            defaultValue={initialData?.code ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Rol / Nombre
          <input
            name="roleName"
            defaultValue={initialData?.roleName ?? ''}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-zinc-700">
        Costo por hora
        <input
          name="hourlyCost"
          defaultValue={initialData?.hourlyCost?.toString() ?? ''}
          required
          inputMode="decimal"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-zinc-700">
        Costo diario
        <input
          name="dailyCost"
          defaultValue={initialData?.dailyCost?.toString() ?? ''}
          inputMode="decimal"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          CPC
          <input
            name="cpc"
            defaultValue={initialData?.cpc ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          VAE
          <input
            name="vae"
            defaultValue={initialData?.vae?.toString() ?? ''}
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Categoría
          <input
            name="category"
            defaultValue={initialData?.category ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Fecha de precio
          <input
            name="priceDate"
            type="date"
            defaultValue={initialData?.priceDate ? initialData.priceDate.toISOString().slice(0, 10) : ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={initialData?.isActive ?? true}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-700"
          />
          Activo
        </label>
      </div>

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
