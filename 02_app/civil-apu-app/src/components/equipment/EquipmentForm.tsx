import type { EquipmentFormInput } from '@/src/lib/validations/equipment'

type EquipmentFormProps = {
  action: (formData: FormData) => Promise<void>
  initialData?: Partial<EquipmentFormInput>
  submitLabel: string
  hiddenId?: string
}

export default function EquipmentForm({ action, initialData, submitLabel, hiddenId }: EquipmentFormProps) {
  return (
    <form action={action} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Código
          <input
            name="code"
            defaultValue={initialData?.code ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Descripción
          <input
            name="description"
            defaultValue={initialData?.description ?? ''}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Tipo de equipo
          <input
            name="equipmentType"
            defaultValue={initialData?.equipmentType ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Tarifa por hora
          <input
            name="hourlyRate"
            defaultValue={initialData?.hourlyRate?.toString() ?? ''}
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Tarifa por día
          <input
            name="dailyRate"
            defaultValue={initialData?.dailyRate?.toString() ?? ''}
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Costo de compra
          <input
            name="purchaseCost"
            defaultValue={initialData?.purchaseCost?.toString() ?? ''}
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
          <input
            name="maintenanceRequired"
            type="checkbox"
            defaultChecked={initialData?.maintenanceRequired ?? false}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-700"
          />
          Requiere mantenimiento
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Notas de mantenimiento
          <input
            name="maintenanceNotes"
            defaultValue={initialData?.maintenanceNotes ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          CPC
          <input
            name="cpc"
            defaultValue={initialData?.cpc ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          VAE
          <input
            name="vae"
            defaultValue={initialData?.vae?.toString() ?? ''}
            inputMode="decimal"
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
