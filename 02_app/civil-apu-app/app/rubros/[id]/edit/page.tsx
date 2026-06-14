import Link from 'next/link'
import { notFound } from 'next/navigation'
import RubroForm from '@/src/components/rubros/RubroForm'
import RubroMaterialsSection from '@/src/components/rubros/RubroMaterialsSection'
import RubroLaborSection from '@/src/components/rubros/RubroLaborSection'
import RubroTotalsPanel from '@/src/components/rubros/RubroTotalsPanel'
import RubroUsageContext from '@/src/components/rubros/RubroUsageContext'
import { getRubroById, getRubroUsageContexts } from '@/src/lib/db/rubros'
import { getMaterials } from '@/src/lib/db/materials'
import { getRubroMaterials } from '@/src/lib/db/rubroMaterials'
import { getLaborItems } from '@/src/lib/db/labor'
import { getRubroLabor } from '@/src/lib/db/rubroLabor'
import { getEquipmentItems } from '@/src/lib/db/equipment'
import { getRubroEquipment } from '@/src/lib/db/rubroEquipment'
import RubroEquipmentSection from '@/src/components/rubros/RubroEquipmentSection'
import { getRubroTransport } from '@/src/lib/db/rubroTransport'
import RubroTransportSection from '@/src/components/rubros/RubroTransportSection'
import { copyRubroAction, updateRubroAction } from '../../actions'
import { calculateAPU } from '@/src/lib/calculations/apu'
import { incompleteRubroMessage, isUsableRubroForBudget } from '@/src/lib/validations/rubroCompletion'
import { getIpcoDenominations } from '@/src/lib/db/denominations'

type RubroEditPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    budgetId?: string
  }>
}

export default async function EditRubroPage({ params, searchParams }: RubroEditPageProps) {
  const { id } = await params
  const { budgetId } = (await searchParams) ?? {}
  const rubro = await getRubroById(id)

  if (!rubro) {
    notFound()
  }

  const initialData = {
    code: rubro.code,
    description: rubro.description,
    unit: rubro.unit,
    performanceValue:
      rubro.performanceValue !== null && rubro.performanceValue !== undefined
        ? Number(rubro.performanceValue.toString())
        : undefined,
    performanceUnit: rubro.performanceUnit ?? undefined,
    indirectPercentage: Number(rubro.indirectPercentage.toString()),
    technicalSpecification: rubro.technicalSpecification ?? undefined,
    notes: rubro.notes ?? undefined,
    status: rubro.status,
    calculationStatus: rubro.calculationStatus,
  }

  const rubroMaterials = await getRubroMaterials(id)
  const materials = await getMaterials()

  const rubroLabor = await getRubroLabor(id)
  const laborItems = await getLaborItems()

  const rubroEquipment = await getRubroEquipment(id)
  const equipmentItems = await getEquipmentItems()
  const rubroTransport = await getRubroTransport(id)
  const denominations = await getIpcoDenominations()
  const usageContexts = await getRubroUsageContexts(id)
  const highlightedContext = budgetId ? usageContexts.find((context) => context.budgetId === budgetId) : undefined
  const orderedUsageContexts = highlightedContext
    ? [highlightedContext, ...usageContexts.filter((context) => context.id !== highlightedContext.id)]
    : usageContexts

  const totals = calculateAPU({
    materials: rubroMaterials.map((line) => Number(line.totalCost.toString())),
    labor: rubroLabor.map((line) => Number(line.totalCost.toString())),
    equipment: rubroEquipment.map((line) => Number(line.totalCost.toString())),
    transport: rubroTransport.map((line) => Number(line.totalCost.toString())),
    indirectPercentage: Number(rubro.indirectPercentage.toString()),
  })
  const isIncomplete = !isUsableRubroForBudget({ directCost: totals.directCost })
  const hasRubroPerformance = Number(rubro.performanceValue?.toString() ?? '0') > 0

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1680px]">
        <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 bg-slate-900 px-4 py-3 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Edicion de rubro / APU</p>
              <h1 className="truncate text-xl font-semibold">{rubro.code} - {rubro.description}</h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-200">
                <span>Unidad: {rubro.unit}</span>
                <span>
                  Rendimiento:{' '}
                  {rubro.performanceValue ? `${rubro.performanceValue.toString()} ${rubro.performanceUnit ?? ''}` : '-'}
                </span>
                <span>
                  Contexto:{' '}
                  {highlightedContext
                    ? `${highlightedContext.budget.project.name} / ${highlightedContext.budget.name}`
                    : 'Catalogo general'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <form action={copyRubroAction}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  className="h-8 rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
                >
                  Copiar
                </button>
              </form>
              <Link
                href={`/rubros/${id}/export`}
                className="inline-flex h-8 items-center rounded border border-emerald-300 bg-emerald-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-800"
              >
                Exportar APU
              </Link>
              <Link
                href="/rubros"
                className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Volver
              </Link>
            </div>
          </div>

          <RubroForm
            action={updateRubroAction}
            submitLabel="Guardar"
            initialData={initialData}
            hiddenId={id}
            hiddenBudgetId={budgetId}
            variant="technical"
          />

          {isIncomplete ? (
            <div className="border-t border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
              Estado: Incompleto. {incompleteRubroMessage}
            </div>
          ) : (
            <div className="border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              Estado: Listo para presupuesto. El rubro tiene costo directo calculado mayor a cero.
            </div>
          )}

          {!hasRubroPerformance ? (
            <div className="border-t border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
              Rendimiento del rubro sin valor mayor a cero. Mano de obra y equipos conservaran el rendimiento/horas de cada linea.
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0 space-y-4">
            <nav className="sticky top-0 z-10 flex overflow-x-auto rounded border border-slate-300 bg-white shadow-sm">
              {[
                { href: '#materiales', label: 'Materiales' },
                { href: '#mano-obra', label: 'Mano de obra' },
                { href: '#equipos', label: 'Equipos' },
                { href: '#transporte', label: 'Transporte' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="border-r border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-blue-50 hover:text-blue-800"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <RubroMaterialsSection rubroId={id} materials={materials} rubroMaterials={rubroMaterials} />
            <RubroLaborSection
              rubroId={id}
              laborItems={laborItems}
              rubroLabor={rubroLabor}
              rubroPerformanceValue={initialData.performanceValue ?? null}
            />
            <RubroEquipmentSection
              rubroId={id}
              equipmentItems={equipmentItems}
              rubroEquipment={rubroEquipment}
              rubroPerformanceValue={initialData.performanceValue ?? null}
            />
            <RubroTransportSection rubroId={id} rubroTransport={rubroTransport} denominations={denominations} />
            <RubroUsageContext contexts={orderedUsageContexts} />
          </main>

          <div className="space-y-4">
            <RubroTotalsPanel
              materialsSubtotal={totals.materialsSubtotal}
              laborSubtotal={totals.laborSubtotal}
              equipmentSubtotal={totals.equipmentSubtotal}
              transportSubtotal={totals.transportSubtotal}
              directCost={totals.directCost}
              indirectPercentage={Number(rubro.indirectPercentage.toString())}
              variant="sidebar"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
