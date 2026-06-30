import { notFound } from 'next/navigation'
import RubroForm from '@/src/components/rubros/RubroForm'
import RubroMaterialsSection from '@/src/components/rubros/RubroMaterialsSection'
import RubroLaborSection from '@/src/components/rubros/RubroLaborSection'
import RubroTotalsPanel from '@/src/components/rubros/RubroTotalsPanel'
import RubroUsageContext from '@/src/components/rubros/RubroUsageContext'
import RubroExportButton from '@/src/components/rubros/RubroExportButton'
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
import RubroExitButton from '@/src/components/rubros/RubroExitButton'
import { copyRubroAction, updateRubroAction } from '../../actions'
import { calculateAPU } from '@/src/lib/calculations/apu'
import { incompleteRubroMessage, isUsableRubroForBudget } from '@/src/lib/validations/rubroCompletion'
import { getIpcoDenominations } from '@/src/lib/db/denominations'
import { sumComponentSubtotal } from '@/src/lib/rubros/rubroDisplayTotals'

type RubroEditPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    budgetId?: string
    componentError?: string
  }>
}

export default async function EditRubroPage({ params, searchParams }: RubroEditPageProps) {
  const { id } = await params
  const { budgetId, componentError } = (await searchParams) ?? {}
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
  const exportProjects = [
    ...new Map(
      usageContexts.map((context) => [
        context.budget.project.id,
        {
          id: context.budget.project.id,
          name: context.budget.project.name,
        },
      ]),
    ).values(),
  ]

  const totals = calculateAPU({
    materials: rubroMaterials.map((line) => Number(line.totalCost.toString())),
    labor: rubroLabor.map((line) => Number(line.totalCost.toString())),
    equipment: rubroEquipment.map((line) => Number(line.totalCost.toString())),
    transport: rubroTransport.map((line) => Number(line.totalCost.toString())),
    indirectPercentage: Number(rubro.indirectPercentage.toString()),
  })
  const isIncomplete = !isUsableRubroForBudget({ directCost: totals.directCost })
  const hasRubroPerformance = Number(rubro.performanceValue?.toString() ?? '0') > 0
  const componentSubtotals = [
    sumComponentSubtotal(
      rubroEquipment.map((line) => ({ totalCost: line.totalCost, vae: line.equipmentItem.vae })),
      totals.directCost,
    ),
    sumComponentSubtotal(
      rubroLabor.map((line) => ({ totalCost: line.totalCost, vae: line.laborItem.vae })),
      totals.directCost,
    ),
    sumComponentSubtotal(
      rubroMaterials.map((line) => ({ totalCost: line.totalCost, vae: line.material.vae })),
      totals.directCost,
    ),
    sumComponentSubtotal(
      rubroTransport.map((line) => ({ totalCost: line.totalCost, vae: null })),
      totals.directCost,
    ),
  ]
  const vaeTotal = componentSubtotals.reduce((sum, subtotal) => sum + subtotal.vaeElement, 0)
  const relativeWeightTotal = componentSubtotals.reduce((sum, subtotal) => sum + subtotal.relativeWeight, 0)

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
              <RubroExportButton rubroId={id} projects={exportProjects} />
              <button
                type="submit"
                form="rubro-main-form"
                className="h-8 rounded border border-blue-300 bg-blue-700 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
              >
                Guardar
              </button>
              <RubroExitButton href="/rubros" />
            </div>
          </div>

          <RubroForm
            action={updateRubroAction}
            submitLabel="Guardar"
            initialData={initialData}
            hiddenId={id}
            hiddenBudgetId={budgetId}
            variant="technical"
            formId="rubro-main-form"
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

          {componentError ? (
            <div className="border-t border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-950">
              {componentError}
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <main className="min-w-0 space-y-4">
            <nav className="sticky top-0 z-10 flex overflow-x-auto rounded border border-slate-300 bg-white shadow-sm">
              {[
                { href: '#equipos', label: 'Equipos' },
                { href: '#mano-obra', label: 'Mano de obra' },
                { href: '#materiales', label: 'Materiales' },
                { href: '#transporte', label: 'Transporte' },
                { href: '#resumen', label: 'Resumen / Totales' },
                { href: '#vae', label: 'Determinacion VAE' },
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

            <RubroEquipmentSection
              rubroId={id}
              budgetId={budgetId}
              equipmentItems={equipmentItems}
              rubroEquipment={rubroEquipment}
              rubroPerformanceValue={initialData.performanceValue ?? null}
              rubroDirectTotal={totals.directCost}
            />
            <RubroLaborSection
              rubroId={id}
              budgetId={budgetId}
              laborItems={laborItems}
              rubroLabor={rubroLabor}
              rubroPerformanceValue={initialData.performanceValue ?? null}
              rubroDirectTotal={totals.directCost}
            />
            <RubroMaterialsSection
              rubroId={id}
              budgetId={budgetId}
              materials={materials}
              rubroMaterials={rubroMaterials}
              rubroDirectTotal={totals.directCost}
            />
            <RubroTransportSection
              rubroId={id}
              budgetId={budgetId}
              rubroTransport={rubroTransport}
              denominations={denominations}
              rubroDirectTotal={totals.directCost}
            />
            <section id="resumen" className="scroll-mt-14">
              <RubroTotalsPanel
                materialsSubtotal={totals.materialsSubtotal}
                laborSubtotal={totals.laborSubtotal}
                equipmentSubtotal={totals.equipmentSubtotal}
                transportSubtotal={totals.transportSubtotal}
                directCost={totals.directCost}
                indirectPercentage={Number(rubro.indirectPercentage.toString())}
                vaeTotal={vaeTotal}
                relativeWeightTotal={relativeWeightTotal}
              />
            </section>
            <section id="vae" className="scroll-mt-14 overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-300 bg-slate-800 px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-white">Determinacion VAE</h2>
              </div>
              <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
                <div className="bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">VAE %</p>
                  <p className="mt-1 text-sm text-slate-600">Informativo, no participa en el precio unitario.</p>
                </div>
                <div className="bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">VAE % elemento</p>
                  <p className="mt-1 text-sm text-slate-600">Derivado de peso relativo por componente.</p>
                </div>
                <div className="bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Estado</p>
                  <p className="mt-1 text-sm font-medium text-amber-700">Pendiente de validacion con Franklin.</p>
                </div>
              </div>
            </section>
            <RubroUsageContext contexts={orderedUsageContexts} />
          </main>
        </div>
      </div>
    </div>
  )
}
