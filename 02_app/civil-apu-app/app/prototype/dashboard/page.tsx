import Link from 'next/link'
import PrototypeShell from '@/src/components/prototype/PrototypeShell'
import { PrototypeLinkButton } from '@/src/components/prototype/PrototypeButtons'
import { PrototypeSummaryBar, PrototypeSummaryItem } from '@/src/components/prototype/PrototypeSummaryBar'
import {
  formatMoney,
  getBudgetDirectCost,
  getRubroUnitPrice,
  prototypeBudgetItems,
  prototypeEquipment,
  prototypeLabor,
  prototypeMaterials,
  prototypeRubros,
} from '@/src/lib/mock-data/prototype'

export default function PrototypeDashboardPage() {
  const directCost = getBudgetDirectCost()
  const indirectCost = directCost * 0.2
  const total = directCost + indirectCost
  const averageRubro = prototypeRubros.reduce((sum, rubro) => sum + getRubroUnitPrice(rubro), 0) / prototypeRubros.length

  return (
    <PrototypeShell
      title="Dashboard tecnico"
      subtitle="Resumen visual mock para navegar el prototipo tipo Excel"
      actions={
        <>
          <PrototypeLinkButton href="/prototype/presupuestos" tone="primary">
            Abrir presupuesto
          </PrototypeLinkButton>
          <PrototypeLinkButton href="/prototype/rubros">Ver rubros</PrototypeLinkButton>
        </>
      }
    >
      <div className="space-y-3">
        <PrototypeSummaryBar>
          <PrototypeSummaryItem label="Total presupuesto" value={formatMoney(total)} />
          <PrototypeSummaryItem label="Costo directo" value={formatMoney(directCost)} />
          <PrototypeSummaryItem label="Indirectos 20%" value={formatMoney(indirectCost)} />
          <PrototypeSummaryItem label="P.U. promedio" value={formatMoney(averageRubro)} />
        </PrototypeSummaryBar>

        <section className="grid gap-3 xl:grid-cols-[1.3fr_1fr]">
          <div className="border border-slate-400 bg-white">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2 text-xs font-semibold uppercase text-white">Flujo de trabajo</div>
            <div className="grid gap-px bg-slate-300 md:grid-cols-2">
              <ModuleTile title="Presupuestos" value={prototypeBudgetItems.length} href="/prototype/presupuestos" />
              <ModuleTile title="Rubros/APU" value={prototypeRubros.length} href="/prototype/rubros" />
              <ModuleTile title="Materiales" value={prototypeMaterials.length} href="/prototype/materiales" />
              <ModuleTile title="Mano de obra" value={prototypeLabor.length} href="/prototype/mano-obra" />
              <ModuleTile title="Equipos" value={prototypeEquipment.length} href="/prototype/equipos" />
              <ModuleTile title="Estado" value="Mock" href="/prototype/dashboard" />
            </div>
          </div>

          <div className="border border-slate-400 bg-white">
            <div className="border-b border-slate-300 bg-slate-800 px-3 py-2 text-xs font-semibold uppercase text-white">Panel rapido</div>
            <div className="space-y-2 p-3 text-xs">
              <div className="grid grid-cols-2 gap-px bg-slate-300">
                <Cell label="Capitulos" value="2" />
                <Cell label="Rubros usados" value="3" />
                <Cell label="Catalogos activos" value={`${prototypeMaterials.length + prototypeLabor.length + prototypeEquipment.length}`} />
                <Cell label="Conexion BD" value="Sin conexion" />
              </div>
              <div className="border border-blue-200 bg-blue-50 p-3 text-blue-950">
                Prototipo navegable aislado. Los datos son ficticios y editables solo de forma visual.
              </div>
            </div>
          </div>
        </section>
      </div>
    </PrototypeShell>
  )
}

function ModuleTile({ title, value, href }: { title: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="block bg-white p-3 hover:bg-blue-50">
      <p className="text-[11px] font-semibold uppercase text-slate-500">{title}</p>
      <p className="mt-2 font-mono text-lg font-semibold text-slate-950">{value}</p>
    </Link>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-2">
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  )
}
