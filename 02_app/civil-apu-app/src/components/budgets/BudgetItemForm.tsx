'use client'

import { useActionState } from 'react'
import type { BudgetItemActionState } from '@/app/projects/[projectId]/budgets/actions'
import CatalogCombobox from '@/src/components/shared/CatalogCombobox'
import { formatCatalogOption } from '@/src/lib/catalogSearch'
import { incompleteRubroMessage, isUsableRubroForBudget } from '@/src/lib/validations/rubroCompletion'

export type BudgetItemFormRubro = {
  id: string
  code: string
  description: string
  unit: string
  category: string | null
  performanceValue: string | null
  performanceUnit: string | null
  indirectPercentage: string
  directCost: string | null
  indirectCost: string | null
  unitPrice: string | null
  status: string
  calculationStatus: string
  notes: string | null
  technicalSpecification: string | null
  sourceExcelSheet: string | null
  createdById: string | null
  validatedById: string | null
  validatedAt: string | null
  createdAt: string
  updatedAt: string
}

type BudgetItemFormProps = {
  action: (state: BudgetItemActionState, formData: FormData) => Promise<BudgetItemActionState>
  budgetId: string
  projectId?: string
  rubros: BudgetItemFormRubro[]
  variant?: 'default' | 'catalog'
}

const initialState: BudgetItemActionState = {
  ok: true,
  message: null,
}

export default function BudgetItemForm({ action, budgetId, projectId, rubros, variant = 'default' }: BudgetItemFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const usableRubros = rubros.filter(isUsableRubroForBudget)
  const incompleteRubros = rubros.filter((rubro) => !isUsableRubroForBudget(rubro))
  const rubroOptions = rubros.map((rubro) => {
    const isUsable = isUsableRubroForBudget(rubro)

    return {
      id: rubro.id,
      label: formatCatalogOption(
        [rubro.code, rubro.description, rubro.unit],
        rubro.directCost ? rubro.directCost.toString() : 'incompleto',
      ),
      searchText: [rubro.code, rubro.description, rubro.unit, rubro.directCost?.toString() ?? ''].join(' '),
      disabled: !isUsable,
      disabledReason: !isUsable ? 'Incompleto: sin costo directo mayor a cero' : undefined,
    }
  })

  if (variant === 'catalog') {
    return (
      <aside className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Rubros disponibles</p>
        </div>

        <form action={formAction} className="space-y-3 border-b border-slate-200 p-3">
          {state.message ? (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              {state.message}
            </div>
          ) : null}

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rubro
            <CatalogCombobox
              name="rubroId"
              options={rubroOptions}
              placeholder="Codigo, descripcion o unidad"
              emptyLabel="No hay rubros que coincidan."
            />
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cantidad
            <input
              name="quantity"
              required
              inputMode="decimal"
              defaultValue="1"
              className="mt-1 h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-950"
            />
          </label>

          <input type="hidden" name="budgetId" value={budgetId} />
          {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
          <button
            type="submit"
            disabled={isPending}
            className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:bg-slate-400"
          >
            {isPending ? 'Agregando...' : 'Agregar'}
          </button>
        </form>

        <div className="max-h-[520px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">Codigo</th>
                <th className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">Rubro</th>
                <th className="px-2 py-2 font-semibold uppercase tracking-wide text-slate-600">Und.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usableRubros.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-sm text-slate-500">
                    No hay rubros disponibles.
                  </td>
                </tr>
              ) : (
                usableRubros.slice(0, 80).map((rubro) => (
                  <tr key={rubro.id} className="hover:bg-blue-50/60">
                    <td className="px-2 py-2 font-mono text-slate-700">{rubro.code}</td>
                    <td className="px-2 py-2 text-slate-800">{rubro.description}</td>
                    <td className="px-2 py-2 text-slate-600">{rubro.unit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {incompleteRubros.length > 0 ? (
          <div className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {incompleteRubros.length} rubro(s) incompleto(s) estan ocultos o deshabilitados. {incompleteRubroMessage}
          </div>
        ) : null}
      </aside>
    )
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      {state.message ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Rubro
          <CatalogCombobox
            name="rubroId"
            options={rubroOptions}
            placeholder="Codigo, descripcion o unidad"
            emptyLabel="No hay rubros que coincidan."
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-zinc-700">
          Cantidad
          <input name="quantity" required inputMode="decimal" defaultValue="1" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </label>

        <div className="flex items-end">
          <input type="hidden" name="budgetId" value={budgetId} />
          {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-wait disabled:bg-zinc-500"
          >
            {isPending ? 'Agregando...' : 'Agregar rubro'}
          </button>
        </div>
      </div>
    </form>
  )
}
