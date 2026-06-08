import type { MaterialFormInput } from '@/src/lib/validations/material'
import type { IpcoDenomination } from '@prisma/client'
import DenominationCombobox from '@/src/components/shared/DenominationCombobox'

type MaterialFormProps = {
  action: (formData: FormData) => Promise<void>
  initialData?: Partial<MaterialFormInput>
  denominations?: IpcoDenomination[]
  submitLabel: string
  hiddenId?: string
}

export default function MaterialForm({ action, initialData, denominations = [], submitLabel, hiddenId }: MaterialFormProps) {
  const denominationOptions = denominations.map((denomination) => ({
    id: denomination.id,
    label: [denomination.code, denomination.name].filter(Boolean).join(' - '),
    searchText: [denomination.code, denomination.name].filter(Boolean).join(' '),
  }))

  return (
    <form action={action} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Codigo
          <input
            name="code"
            placeholder="MAT-001"
            defaultValue={initialData?.code ?? ''}
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
        Descripcion
        <input
          name="description"
          defaultValue={initialData?.description ?? ''}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Precio 1
          <input
            name="price1"
            defaultValue={initialData?.price1?.toString() ?? ''}
            required
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Precio 2
          <input
            name="price2"
            defaultValue={initialData?.price2?.toString() ?? ''}
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Precio 3
          <input
            name="price3"
            defaultValue={initialData?.price3?.toString() ?? ''}
            inputMode="decimal"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-zinc-700">
        Denominacion IPCO
        <DenominationCombobox options={denominationOptions} initialId={initialData?.denominationId ?? ''} />
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
