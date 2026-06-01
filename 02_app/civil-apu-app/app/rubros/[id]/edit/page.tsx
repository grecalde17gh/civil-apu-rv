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
    category: rubro.category ?? undefined,
    performanceValue:
      rubro.performanceValue !== null && rubro.performanceValue !== undefined
        ? Number(rubro.performanceValue.toString())
        : undefined,
    performanceUnit: rubro.performanceUnit ?? undefined,
    indirectPercentage: Number(rubro.indirectPercentage.toString()),
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

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Editar rubro</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Actualizar datos generales</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <form action={copyRubroAction}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Crear copia
              </button>
            </form>
            <Link
              href="/rubros"
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Volver a lista
            </Link>
          </div>
        </div>

        <RubroForm action={updateRubroAction} submitLabel="Guardar cambios" initialData={initialData} hiddenId={id} />

        <div className="mt-10 space-y-10">
          <RubroUsageContext contexts={orderedUsageContexts} />
          <RubroTotalsPanel
            materialsSubtotal={totals.materialsSubtotal}
            laborSubtotal={totals.laborSubtotal}
            equipmentSubtotal={totals.equipmentSubtotal}
            transportSubtotal={totals.transportSubtotal}
            directCost={totals.directCost}
            indirectPercentage={Number(rubro.indirectPercentage.toString())}
          />
          <RubroMaterialsSection rubroId={id} materials={materials} rubroMaterials={rubroMaterials} />
          <RubroLaborSection rubroId={id} laborItems={laborItems} rubroLabor={rubroLabor} />
          <RubroEquipmentSection rubroId={id} equipmentItems={equipmentItems} rubroEquipment={rubroEquipment} />
          <RubroTransportSection rubroId={id} rubroTransport={rubroTransport} />
        </div>
      </div>
    </div>
  )
}
