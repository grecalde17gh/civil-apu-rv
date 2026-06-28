'use client'

import { useActionState, useMemo, useState } from 'react'
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
  existingRubroIds?: string[]
  variant?: 'default' | 'catalog'
}

const initialState: BudgetItemActionState = {
  ok: true,
  message: null,
}

export default function BudgetItemForm({ action, budgetId, projectId, rubros, existingRubroIds = [], variant = 'default' }: BudgetItemFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortKey, setSortKey] = useState<'code' | 'description' | 'unit' | 'unitPrice' | 'category' | 'status'>('code')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedRubroIds, setSelectedRubroIds] = useState<string[]>([])
  const usableRubros = rubros.filter(isUsableRubroForBudget)
  const incompleteRubros = rubros.filter((rubro) => !isUsableRubroForBudget(rubro))
  const existingIds = useMemo(() => new Set(existingRubroIds), [existingRubroIds])
  const categories = useMemo(
    () => [...new Set(rubros.map((rubro) => rubro.category).filter((category): category is string => Boolean(category)))].sort(),
    [rubros],
  )
  const filteredRubros = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const rows = rubros.filter((rubro) => {
      const matchesQuery = normalizedQuery === '' ? true : [
        rubro.code,
        rubro.description,
        rubro.unit,
        rubro.category ?? '',
        rubro.status,
        rubro.calculationStatus,
      ].join(' ').toLowerCase().includes(normalizedQuery)
      const matchesCategory = categoryFilter === '' || rubro.category === categoryFilter
      return matchesQuery && matchesCategory
    })

    return rows.sort((a, b) => {
      const aValue = sortKey === 'unitPrice' ? Number(a.unitPrice ?? '0') : String(a[sortKey] ?? '')
      const bValue = sortKey === 'unitPrice' ? Number(b.unitPrice ?? '0') : String(b[sortKey] ?? '')
      const result = typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue), 'es')
      return sortDirection === 'asc' ? result : -result
    })
  }, [categoryFilter, query, rubros, sortDirection, sortKey])
  const selectedCount = selectedRubroIds.length
  const selectableFilteredIds = filteredRubros
    .filter((rubro) => isUsableRubroForBudget(rubro) && !existingIds.has(rubro.id))
    .map((rubro) => rubro.id)
  const allVisibleSelected = selectableFilteredIds.length > 0 && selectableFilteredIds.every((id) => selectedRubroIds.includes(id))
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

  function setSort(nextSortKey: typeof sortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
      return
    }
    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  function toggleRubro(rubroId: string) {
    setSelectedRubroIds((current) =>
      current.includes(rubroId) ? current.filter((id) => id !== rubroId) : [...current, rubroId],
    )
  }

  function toggleVisibleRubros() {
    setSelectedRubroIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !selectableFilteredIds.includes(id))
      }
      return [...new Set([...current, ...selectableFilteredIds])]
    })
  }

  if (variant === 'catalog') {
    return (
      <aside className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-800 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white">Rubros disponibles</p>
          <span className="font-mono text-xs font-semibold text-blue-100">{usableRubros.length}</span>
        </div>

        <div className="space-y-3 p-3">
          {state.message ? (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              {state.message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="h-8 w-full rounded bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:bg-slate-400"
          >
            Seleccionar rubros
          </button>
        </div>

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

        {isOpen ? (
          <div className="fixed inset-0 z-50 bg-slate-950/45 p-3 sm:p-6">
            <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded border border-slate-400 bg-white shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Seleccion masiva</p>
                  <h2 className="text-base font-semibold">Rubros del presupuesto</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-8 rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide transition hover:bg-slate-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(220px,1fr)_220px_auto]">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Filtro
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Codigo, descripcion, unidad o estado"
                    className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm font-normal normal-case tracking-normal text-slate-950"
                  />
                </label>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Categoria
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm font-normal normal-case tracking-normal text-slate-950"
                  >
                    <option value="">Todas</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <div className="flex items-end justify-between gap-3 text-xs text-slate-600 md:justify-end">
                  <span className="font-mono font-semibold tabular-nums text-slate-950">{filteredRubros.length} visibles</span>
                  <span className="font-mono font-semibold tabular-nums text-blue-900">{selectedCount} seleccionados</span>
                </div>
              </div>

              <form action={formAction} className="flex min-h-0 flex-1 flex-col">
                <input type="hidden" name="budgetId" value={budgetId} />
                {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
                <input type="hidden" name="quantity" value="1" />
                {selectedRubroIds.map((rubroId) => <input key={rubroId} type="hidden" name="rubroIds" value={rubroId} />)}

                <div className="min-h-0 flex-1 overflow-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-100">
                      <tr>
                        <th className="w-12 px-3 py-2">
                          <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleRubros} aria-label="Seleccionar visibles" />
                        </th>
                        <SortableHeader label="Codigo" active={sortKey === 'code'} direction={sortDirection} onClick={() => setSort('code')} />
                        <SortableHeader label="Descripcion" active={sortKey === 'description'} direction={sortDirection} onClick={() => setSort('description')} className="min-w-[320px]" />
                        <SortableHeader label="Unidad" active={sortKey === 'unit'} direction={sortDirection} onClick={() => setSort('unit')} />
                        <SortableHeader label="Precio unitario" active={sortKey === 'unitPrice'} direction={sortDirection} onClick={() => setSort('unitPrice')} align="right" />
                        <SortableHeader label="Categoria" active={sortKey === 'category'} direction={sortDirection} onClick={() => setSort('category')} />
                        <SortableHeader label="Estado" active={sortKey === 'status'} direction={sortDirection} onClick={() => setSort('status')} />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredRubros.length === 0 ? (
                        <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">No hay rubros que coincidan.</td></tr>
                      ) : filteredRubros.map((rubro) => {
                        const alreadyAdded = existingIds.has(rubro.id)
                        const isUsable = isUsableRubroForBudget(rubro)
                        const disabled = alreadyAdded || !isUsable
                        const checked = selectedRubroIds.includes(rubro.id)
                        return (
                          <tr key={rubro.id} className={checked ? 'bg-blue-50' : 'hover:bg-blue-50/60'}>
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggleRubro(rubro.id)}
                                aria-label={`Seleccionar ${rubro.code}`}
                              />
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-700">{rubro.code}</td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{rubro.description}</td>
                            <td className="px-3 py-2 text-slate-700">{rubro.unit}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-800">{rubro.unitPrice ?? rubro.directCost ?? '-'}</td>
                            <td className="px-3 py-2 text-slate-700">{rubro.category ?? '-'}</td>
                            <td className="px-3 py-2">
                              {alreadyAdded ? (
                                <span className="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">Ya agregado</span>
                              ) : !isUsable ? (
                                <span className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">Incompleto</span>
                              ) : (
                                <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">{rubro.status}</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-600">
                    {selectedCount === 0 ? 'Seleccione uno o mas rubros.' : `${selectedCount} rubro(s) seleccionado(s).`}
                  </p>
                  <button
                    type="submit"
                    disabled={isPending || selectedCount === 0}
                    className="h-9 rounded bg-blue-700 px-4 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isPending ? 'Agregando...' : 'Agregar rubros seleccionados'}
                  </button>
                </div>
              </form>
            </div>
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

function SortableHeader({
  label,
  active,
  direction,
  onClick,
  align = 'left',
  className = '',
}: {
  label: string
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
  align?: 'left' | 'right'
  className?: string
}) {
  return (
    <th className={`px-3 py-2 font-semibold uppercase tracking-wide text-slate-600 ${align === 'right' ? 'text-right' : ''} ${className}`}>
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1">
        {label}
        <span className="font-mono text-[10px] text-slate-500">{active ? (direction === 'asc' ? 'ASC' : 'DESC') : ''}</span>
      </button>
    </th>
  )
}
