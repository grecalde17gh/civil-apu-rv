import Link from 'next/link'
import { notFound } from 'next/navigation'
import BudgetForm from '@/src/components/budgets/BudgetForm'
import BudgetConsolidationTables, { GeneralComponentsTable } from '@/src/components/budgets/BudgetConsolidationTables'
import BudgetScheduleTable, { type BudgetScheduleRow } from '@/src/components/budgets/BudgetScheduleTable'
import { consolidateBudgetComponents } from '@/src/lib/calculations/budgetConsolidation'
import { getBudgetScheduleForEdit } from '@/src/lib/db/budgetSchedule'
import { getBudgetByIdForEdit } from '@/src/lib/db/budgets'
import { updateBudgetAction, addBudgetItemFormAction, deleteBudgetItemAction, copyBudgetAction, updateBudgetItemQuantityAction, updateBudgetScheduleAction } from '../../actions'
import BudgetItemForm, { type BudgetItemFormRubro } from '@/src/components/budgets/BudgetItemForm'
import BudgetItemsTable, { type BudgetItemsTableItem } from '@/src/components/budgets/BudgetItemsTable'
import { getRubros } from '@/src/lib/db/rubros'

export const dynamic = 'force-dynamic'

type EditBudgetPageProps = {
  params: Promise<{
    projectId: string
    budgetId: string
  }>
  searchParams?: Promise<{
    tab?: string
    denomination?: string
  }>
}

const tabs = [
  { key: 'presupuesto', label: 'Presupuesto' },
  { key: 'materiales', label: 'Materiales consolidados' },
  { key: 'mano-obra', label: 'Mano de obra consolidada' },
  { key: 'equipos', label: 'Equipos consolidados' },
  { key: 'transporte', label: 'Transporte consolidado' },
  { key: 'cronograma', label: 'Cronograma valorado' },
] as const

type BudgetTab = (typeof tabs)[number]['key']

function getActiveTab(tab?: string): BudgetTab {
  return tabs.some((item) => item.key === tab) ? (tab as BudgetTab) : 'presupuesto'
}

function getConsolidationSection(tab: BudgetTab) {
  if (tab === 'materiales') return 'materials'
  if (tab === 'mano-obra') return 'labor'
  if (tab === 'equipos') return 'equipment'
  if (tab === 'cronograma') return 'materials'
  return 'transport'
}

type DecimalLike = { toString(): string } | null | undefined

function serializeDecimal(value: DecimalLike): string | null {
  return value === null || value === undefined ? null : value.toString()
}

function serializeRequiredDecimal(value: DecimalLike): string {
  return serializeDecimal(value) ?? '0'
}

function serializeDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null
}

function serializeRubro(rubro: Awaited<ReturnType<typeof getRubros>>[number]): BudgetItemFormRubro {
  return {
    id: rubro.id,
    code: rubro.code,
    description: rubro.description,
    unit: rubro.unit,
    category: rubro.category,
    performanceValue: serializeDecimal(rubro.performanceValue),
    performanceUnit: rubro.performanceUnit,
    indirectPercentage: serializeRequiredDecimal(rubro.indirectPercentage),
    directCost: serializeDecimal(rubro.directCost),
    indirectCost: serializeDecimal(rubro.indirectCost),
    unitPrice: serializeDecimal(rubro.unitPrice),
    status: rubro.status,
    calculationStatus: rubro.calculationStatus,
    notes: rubro.notes,
    technicalSpecification: rubro.technicalSpecification,
    sourceExcelSheet: rubro.sourceExcelSheet,
    createdById: rubro.createdById,
    validatedById: rubro.validatedById,
    validatedAt: serializeDate(rubro.validatedAt),
    createdAt: serializeDate(rubro.createdAt) ?? '',
    updatedAt: serializeDate(rubro.updatedAt) ?? '',
  }
}

function serializeBudgetItem(item: NonNullable<Awaited<ReturnType<typeof getBudgetByIdForEdit>>>['items'][number]): BudgetItemsTableItem {
  return {
    id: item.id,
    rubroId: item.rubroId,
    itemNumber: item.itemNumber,
    rubroCodeSnapshot: item.rubroCodeSnapshot,
    descriptionSnapshot: item.descriptionSnapshot,
    unitSnapshot: item.unitSnapshot,
    quantity: serializeRequiredDecimal(item.quantity),
    indirectPercentageApplied: serializeRequiredDecimal(item.indirectPercentageApplied),
    directCostSnapshot: serializeRequiredDecimal(item.directCostSnapshot),
    indirectCostSnapshot: serializeRequiredDecimal(item.indirectCostSnapshot),
    unitPriceSnapshot: serializeRequiredDecimal(item.unitPriceSnapshot),
    subtotalSnapshot: serializeRequiredDecimal(item.subtotalSnapshot),
    totalPrice: serializeRequiredDecimal(item.totalPrice),
  }
}

function serializeScheduleRows(schedule: NonNullable<Awaited<ReturnType<typeof getBudgetScheduleForEdit>>>): BudgetScheduleRow[] {
  return schedule.entries.map((entry) => ({
    budgetItemId: entry.budgetItemId,
    itemNumber: entry.budgetItem.itemNumber,
    code: entry.budgetItem.rubroCodeSnapshot,
    description: entry.budgetItem.descriptionSnapshot,
    unit: entry.budgetItem.unitSnapshot,
    quantity: entry.budgetItem.quantity.toString(),
    totalAmount: Number(entry.budgetItem.subtotalSnapshot?.toString() ?? entry.budgetItem.totalPrice?.toString() ?? '0'),
    groupName: entry.groupName || 'Grupo 1',
    startWeek: entry.startWeek,
    endWeek: entry.endWeek,
  }))
}

export default async function EditBudgetPage({ params, searchParams }: EditBudgetPageProps) {
  const { projectId, budgetId } = await params
  const { tab, denomination } = (await searchParams) ?? {}
  const activeTab = getActiveTab(tab)
  const budget = await getBudgetByIdForEdit(budgetId)
  const rubros = await getRubros()

  if (!budget || budget.projectId !== projectId) {
    notFound()
  }

  const initialData = {
    code: budget.code ?? undefined,
    name: budget.name,
    status: budget.status,
    indirectPercentage: Number(
      budget.indirectPercentage?.toString() ?? budget.project.defaultIndirectPercentage?.toString() ?? '20',
    ),
    ivaPercentage: Number(budget.ivaPercentage?.toString() ?? '0'),
    notes: budget.notes ?? undefined,
    issuedAt: budget.issuedAt ?? undefined,
  }

  const subtotal = budget.subtotal?.toString() ?? '0.00'
  const ivaAmount = budget.ivaAmount?.toString() ?? '0.00'
  const total = budget.total?.toString() ?? budget.subtotal?.toString() ?? '0.00'
  const directCostTotal = budget.items.reduce((sum, item) => {
    const quantity = Number(item.quantity.toString())
    const directCost = Number(item.directCostSnapshot.toString())
    return sum + quantity * directCost
  }, 0)
  const indirectPercentage = Number(budget.indirectPercentage?.toString() ?? '0')
  const indirectCostTotal = directCostTotal * (indirectPercentage / 100)
  const consolidation = consolidateBudgetComponents(budget)
  const serializedRubros = rubros.map(serializeRubro)
  const serializedBudgetItems = budget.items.map(serializeBudgetItem)
  const schedule = activeTab === 'cronograma' ? await getBudgetScheduleForEdit(budgetId) : null

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1760px]">
        <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Presupuesto de obra</p>
              <h1 className="truncate text-xl font-semibold">
                {budget.code ? `${budget.code} - ` : null}
                {budget.name}
              </h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-200">
                <span>Proyecto: {budget.project.name}</span>
                <span>Cliente: {budget.clientNameSnapshot ?? budget.project.clientName ?? 'Sin cliente'}</span>
                <span>Ubicacion: {budget.locationSnapshot ?? budget.project.location ?? 'Sin ubicacion'}</span>
                <span>Estado: {budget.status}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/rubros/new?budgetId=${budgetId}&projectId=${projectId}`}
                className="inline-flex h-8 items-center rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
              >
                Agregar rubro
              </Link>
              <form action={copyBudgetAction}>
                <input type="hidden" name="budgetId" value={budgetId} />
                <input type="hidden" name="projectId" value={projectId} />
                <button
                  type="submit"
                  className="h-8 rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
                >
                  Copiar
                </button>
              </form>
              <Link
                href={`/projects/${projectId}/budgets/${budgetId}/export`}
                className="inline-flex h-8 items-center rounded border border-emerald-300 bg-emerald-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-800"
              >
                Exportar presupuesto
              </Link>
              <Link
                href={`/projects/${projectId}/budgets`}
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Ver lista
              </Link>
              <Link
                href="/projects"
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Volver
              </Link>
            </div>
          </div>

          <BudgetForm
            action={updateBudgetAction}
            submitLabel="Guardar"
            initialData={initialData}
            hiddenId={budgetId}
            hiddenProjectId={projectId}
            variant="technical"
          />
        </div>

        <nav className="mt-4 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-wrap gap-px bg-slate-200">
            {tabs.map((item) => (
              <Link
                key={item.key}
                href={`/projects/${projectId}/budgets/${budgetId}/edit?tab=${item.key}`}
                className={`h-9 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeTab === item.key ? 'text-blue-900 shadow-[inset_0_-3px_0_#1d4ed8]' : 'text-slate-600 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {activeTab === 'presupuesto' ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_300px]">
              <BudgetItemForm
                action={addBudgetItemFormAction}
                budgetId={budgetId}
                projectId={projectId}
                rubros={serializedRubros}
                variant="catalog"
              />

              <main className="min-w-0">
                <BudgetItemsTable
                  items={serializedBudgetItems}
                  budgetId={budgetId}
                  projectId={projectId}
                  deleteAction={deleteBudgetItemAction}
                  updateQuantityAction={updateBudgetItemQuantityAction}
                />
              </main>

              <aside className="sticky top-4 self-start overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
                <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white">Totales</p>
                </div>
                <div className="divide-y divide-slate-200 text-sm">
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                    <span className="text-slate-600">Costo directo</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-950">{formatCurrency(directCostTotal)}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                    <span className="text-slate-600">Porcentaje indirectos</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-950">
                      {budget.indirectPercentage?.toString() ?? '0'}%
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                    <span className="text-slate-600">Costos indirectos</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-950">{formatCurrency(indirectCostTotal)}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                    <span className="text-slate-600">Total ofertado</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-950">{subtotal}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                    <span className="text-slate-600">IVA ({budget.ivaPercentage?.toString() ?? '0'}%)</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-950">{ivaAmount}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 bg-blue-50 px-3 py-3">
                    <span className="font-bold text-blue-950">Total incluido IVA</span>
                    <span className="font-mono text-lg font-bold tabular-nums text-blue-950">{total}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                    <span className="text-slate-600">Rubros</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-950">{budget.items.length}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
                    <span className="text-slate-600">Capitulos</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-950">No configurado</span>
                  </div>
                </div>
              </aside>
            </div>

            <GeneralComponentsTable consolidation={consolidation} denominationFilter={denomination ?? ''} />
          </div>
        ) : activeTab === 'cronograma' && schedule ? (
          <div className="mt-4">
            <BudgetScheduleTable
              budgetId={budgetId}
              projectId={projectId}
              initialWeekCount={schedule.weekCount}
              rows={serializeScheduleRows(schedule)}
              action={updateBudgetScheduleAction}
            />
          </div>
        ) : (
          <div className="mt-4">
            <BudgetConsolidationTables
              consolidation={consolidation}
              section={getConsolidationSection(activeTab)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
