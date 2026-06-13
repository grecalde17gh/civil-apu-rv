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

        <section className="grid gap-2 xl:grid-cols-[1.3fr_1fr]">
          <div className="border border-[#6f7f94] bg-white shadow-[inset_0_1px_0_white]">
            <div className="border-b border-[#8d9bad] bg-gradient-to-b from-[#edf4fc] to-[#c9d8eb] px-2 py-1 text-xs font-semibold uppercase text-slate-950">Libro de presupuesto</div>
            <div className="grid gap-px bg-[#9aa8ba] md:grid-cols-2">
              <ModuleTile title="Presupuestos" value={prototypeBudgetItems.length} href="/prototype/presupuestos" />
              <ModuleTile title="Rubros/APU" value={prototypeRubros.length} href="/prototype/rubros" />
              <ModuleTile title="Materiales" value={prototypeMaterials.length} href="/prototype/materiales" />
              <ModuleTile title="Mano de obra" value={prototypeLabor.length} href="/prototype/mano-obra" />
              <ModuleTile title="Equipos" value={prototypeEquipment.length} href="/prototype/equipos" />
              <ModuleTile title="Estado" value="Mock" href="/prototype/dashboard" />
            </div>
          </div>

          <div className="border border-[#6f7f94] bg-white shadow-[inset_0_1px_0_white]">
            <div className="border-b border-[#8d9bad] bg-gradient-to-b from-[#edf4fc] to-[#c9d8eb] px-2 py-1 text-xs font-semibold uppercase text-slate-950">Panel rapido</div>
            <div className="space-y-2 p-2 text-xs">
              <div className="grid grid-cols-2 gap-px bg-[#9aa8ba]">
                <Cell label="Capitulos" value="2" />
                <Cell label="Rubros usados" value="3" />
                <Cell label="Catalogos activos" value={`${prototypeMaterials.length + prototypeLabor.length + prototypeEquipment.length}`} />
                <Cell label="Conexion BD" value="Sin conexion" />
              </div>
              <div className="border border-[#8d9bad] bg-[#eef3fa] p-2 text-blue-950 shadow-[inset_0_1px_0_white]">
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
    <Link
      href={href}
      className="block bg-gradient-to-b from-[#f8fafc] to-[#e4ebf5] p-3 shadow-[inset_0_1px_0_white] hover:from-[#eef7ff] hover:to-[#d5e8fa] active:translate-y-px"
    >
      <p className="text-[11px] font-semibold uppercase text-slate-500">{title}</p>
      <p className="mt-2 font-mono text-lg font-semibold text-slate-950">{value}</p>
    </Link>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gradient-to-b from-[#f8fafc] to-[#e4ebf5] p-2 shadow-[inset_0_1px_0_white]">
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  )
}
