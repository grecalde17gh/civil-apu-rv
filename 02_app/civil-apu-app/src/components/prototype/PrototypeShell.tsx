'use client'

import Link from 'next/link'
import {
  Calculator,
  CheckCircle,
  ClipboardList,
  ChevronRight,
  FilePlus,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Library,
  Package,
  PlusSquare,
  Printer,
  Save,
  Users,
  Wrench,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { RibbonButton } from './PrototypeButtons'
import { formatMoney, getBudgetDirectCost } from '@/src/lib/mock-data/prototype'

const ribbonTabs = ['Archivo', 'Presupuesto', 'Rubros', 'Insumos', 'Reportes', 'Herramientas', 'Ayuda']

const ribbonMenus: Record<string, { label: string; href: string; divider?: boolean; disabled?: boolean }[]> = {
  Archivo: [
    { label: 'Nuevo presupuesto', href: '/prototype/presupuestos' },
    { label: 'Abrir presupuesto', href: '/prototype/presupuestos' },
    { label: 'Guardar', href: '/prototype/dashboard' },
    { label: 'Guardar como', href: '/prototype/dashboard' },
    { label: 'Importar Excel', href: '/prototype/materiales', divider: true },
    { label: 'Exportar Excel', href: '/prototype/presupuestos' },
    { label: 'Exportar PDF', href: '/prototype/presupuestos' },
    { label: 'Imprimir', href: '/prototype/presupuestos' },
    { label: 'Cerrar', href: '/prototype/dashboard', divider: true },
  ],
  Presupuesto: [
    { label: 'Agregar capitulo', href: '/prototype/presupuestos' },
    { label: 'Agregar rubro', href: '/prototype/rubros' },
    { label: 'Duplicar rubro', href: '/prototype/presupuestos' },
    { label: 'Reordenar partidas', href: '/prototype/presupuestos' },
    { label: 'Recalcular presupuesto', href: '/prototype/presupuestos', divider: true },
    { label: 'Configurar indirectos', href: '/prototype/presupuestos' },
  ],
  Rubros: [
    { label: 'Nuevo rubro', href: '/prototype/rubros' },
    { label: 'Editar rubro', href: '/prototype/rubros' },
    { label: 'Copiar APU', href: '/prototype/rubros' },
    { label: 'Validar APU', href: '/prototype/rubros', divider: true },
    { label: 'Ver analisis', href: '/prototype/rubros' },
    { label: 'Actualizar precios', href: '/prototype/rubros' },
  ],
  Insumos: [
    { label: 'Materiales', href: '/prototype/materiales' },
    { label: 'Mano de obra', href: '/prototype/mano-obra' },
    { label: 'Equipos', href: '/prototype/equipos' },
    { label: 'Transporte', href: '/prototype/dashboard' },
    { label: 'Importar catalogo', href: '/prototype/materiales', divider: true },
    { label: 'Actualizar precios', href: '/prototype/materiales' },
  ],
  Reportes: [
    { label: 'Presupuesto general', href: '/prototype/presupuestos' },
    { label: 'APUs', href: '/prototype/rubros' },
    { label: 'Lista de materiales', href: '/prototype/materiales' },
    { label: 'Mano de obra', href: '/prototype/mano-obra' },
    { label: 'Equipos', href: '/prototype/equipos' },
    { label: 'Formula polinomica', href: '/prototype/dashboard', divider: true },
    { label: 'Exportar reportes', href: '/prototype/dashboard' },
  ],
  Herramientas: [
    { label: 'Buscar', href: '/prototype/dashboard' },
    { label: 'Recalcular todo', href: '/prototype/presupuestos' },
    { label: 'Validar datos', href: '/prototype/rubros' },
    { label: 'Configuracion', href: '/prototype/dashboard', divider: true },
    { label: 'Preferencias', href: '/prototype/dashboard' },
  ],
  Ayuda: [
    { label: 'Manual de usuario', href: '/prototype/dashboard' },
    { label: 'Atajos de teclado', href: '/prototype/dashboard' },
    { label: 'Acerca de Civil APU RV', href: '/prototype/dashboard', divider: true },
  ],
}

const sheetTabs = [
  { href: '/prototype/presupuestos', label: 'Presupuesto', match: '/prototype/presupuestos' },
  { href: '/prototype/rubros', label: 'APUs', match: '/prototype/rubros' },
  { href: '/prototype/materiales', label: 'Materiales', match: '/prototype/materiales' },
  { href: '/prototype/mano-obra', label: 'Mano de Obra', match: '/prototype/mano-obra' },
  { href: '/prototype/equipos', label: 'Equipos', match: '/prototype/equipos' },
  { href: '/prototype/dashboard', label: 'Transporte', match: '/prototype/dashboard' },
  { href: '/prototype/dashboard', label: 'Reportes', match: '/prototype/dashboard' },
]

type PrototypeShellProps = {
  title: string
  subtitle: string
  actions?: ReactNode
  children: ReactNode
}

export default function PrototypeShell({ title, subtitle, actions, children }: PrototypeShellProps) {
  const pathname = usePathname()
  const activeRibbonTab = getActiveRibbonTab(pathname)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const total = getBudgetDirectCost() * 1.2

  return (
    <main className="fixed inset-0 z-40 bg-[#b8c5d6] text-[12px] text-slate-950">
      <div className="flex h-screen flex-col border border-[#7f8da1] bg-[#d9e0ea] font-sans">
        <header className="shrink-0 border-b border-[#7f8da1] bg-[#e7edf6] shadow-[0_1px_2px_rgba(15,23,42,0.25)]">
          <div className="flex h-7 items-center justify-between border-b border-[#4f6685] bg-gradient-to-b from-[#2f6fa8] to-[#1b4f7e] px-2 text-white">
            <Link href="/prototype/dashboard" className="text-xs font-semibold uppercase tracking-wide">
              Civil APU RV - Prototipo
            </Link>
            <div className="hidden items-center gap-2 text-[11px] font-medium md:flex">
              <span>Mock sin base de datos</span>
              <span className="border-l border-blue-200 pl-2">Vista tipo Excel</span>
            </div>
          </div>

          <nav className="flex overflow-visible border-b border-[#9aa8ba] bg-[#dce5f2] px-1 pt-1">
            {ribbonTabs.map((tab) => (
              <RibbonTabMenu
                key={tab}
                label={tab}
                isActive={tab === activeRibbonTab}
                isOpen={openMenu === tab}
                items={ribbonMenus[tab]}
                onOpen={() => setOpenMenu(tab)}
                onClose={() => setOpenMenu(null)}
                onToggle={() => setOpenMenu((current) => (current === tab ? null : tab))}
              />
            ))}
          </nav>

          <div className="flex gap-2 overflow-x-auto border-b border-[#9aa8ba] bg-gradient-to-b from-[#f7f9fc] to-[#dce6f3] px-2 py-2">
            <RibbonGroup title="Archivo">
              <RibbonButton href="/prototype/dashboard" label="Nuevo" icon={FilePlus} size="large" active={pathname === '/prototype/dashboard'} />
              <RibbonButton href="/prototype/dashboard" label="Abrir" icon={FolderOpen} />
              <RibbonButton href={pathname} label="Guardar" icon={Save} />
            </RibbonGroup>

            <RibbonGroup title="Importar / Exportar">
              <RibbonButton href="/prototype/materiales" label="Importar Excel" icon={FileSpreadsheet} size="large" active={pathname === '/prototype/materiales'} />
              <RibbonButton href={pathname} label="Exportar Excel" icon={FileSpreadsheet} />
              <RibbonButton href={pathname} label="Exportar PDF" icon={FileText} />
              <RibbonButton href={pathname} label="Imprimir" icon={Printer} />
            </RibbonGroup>

            <RibbonGroup title="Insertar">
              <RibbonButton href="/prototype/rubros" label="Insertar rubro" icon={PlusSquare} size="large" active={pathname === '/prototype/rubros'} />
              <RibbonButton href="/prototype/materiales" label="Material" icon={Package} active={pathname === '/prototype/materiales'} />
              <RibbonButton href="/prototype/mano-obra" label="Mano de obra" icon={Users} active={pathname === '/prototype/mano-obra'} />
              <RibbonButton href="/prototype/equipos" label="Equipo" icon={Wrench} active={pathname === '/prototype/equipos'} />
              <RibbonButton href="/prototype/rubros" label="Catalogo rubros" icon={Library} />
            </RibbonGroup>

            <RibbonGroup title="Calculo">
              <RibbonButton href="/prototype/presupuestos" label="Recalcular" icon={Calculator} size="large" active={pathname === '/prototype/presupuestos'} />
              <RibbonButton href="/prototype/rubros" label="Validar APU" icon={CheckCircle} />
              <RibbonButton href="/prototype/dashboard" label="Resumen" icon={ClipboardList} />
            </RibbonGroup>

            {actions ? (
              <RibbonGroup title="Contexto">
                <div className="flex flex-wrap gap-1">{actions}</div>
              </RibbonGroup>
            ) : null}
          </div>

          <div className="grid gap-px border-b border-[#9aa8ba] bg-[#9aa8ba] text-xs md:grid-cols-[minmax(220px,1.2fr)_minmax(180px,0.8fr)_150px_160px_170px]">
            <StatusCell label="Proyecto / Presupuesto" value={title} subvalue={subtitle} />
            <label className="bg-[#f8fafc] px-2 py-1 text-[11px] font-semibold uppercase text-slate-500">
              Buscador rapido
              <input className="mt-1 h-6 w-full border border-[#8d9bad] bg-white px-2 text-xs font-normal normal-case text-slate-900 shadow-[inset_1px_1px_1px_rgba(15,23,42,0.12)]" placeholder="Codigo, rubro o insumo" />
            </label>
            <StatusCell label="Estado" value="Guardado mock" />
            <StatusCell label="Total" value={formatMoney(total)} />
            <StatusCell label="Actualizado" value="11/06/2026 20:55" />
          </div>

          <div className="grid grid-cols-[72px_1fr] gap-px border-b border-[#9aa8ba] bg-[#9aa8ba] px-1 py-1">
            <div className="border border-[#8d9bad] bg-white px-2 py-0.5 font-mono text-[11px] shadow-[inset_1px_1px_1px_rgba(15,23,42,0.12)]">
              A1
            </div>
            <div className="flex border border-[#8d9bad] bg-white shadow-[inset_1px_1px_1px_rgba(15,23,42,0.12)]">
              <span className="border-r border-[#b5c0cf] bg-[#eef3fa] px-2 py-0.5 font-mono text-[11px] text-slate-600">fx</span>
              <input
                className="h-6 min-w-0 flex-1 px-2 font-mono text-[11px] outline-none"
                defaultValue={getFormulaPreview(pathname)}
                aria-label="Barra de formula"
              />
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-auto bg-[#c8d2df] p-1.5">{children}</section>

        <footer className="shrink-0 border-t border-[#7f8da1] bg-[#e7edf6]">
          <div className="flex overflow-x-auto border-b border-[#9aa8ba] px-2 pt-1">
            {sheetTabs.map((tab) => {
              const isActive = isActiveSheet(pathname, tab.match, tab.label)

              return (
                <Link
                  key={`${tab.label}-${tab.href}`}
                  href={tab.href}
                  className={`mr-1 min-w-28 border border-[#7f8da1] border-b-0 px-3 py-1.5 text-center text-[11px] font-semibold ${
                    isActive
                      ? 'bg-white text-[#0f4c81] shadow-[inset_0_2px_0_#2f6fa8]'
                      : 'bg-[#d4dce8] text-slate-700 hover:bg-[#eef3fa]'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-px bg-[#9aa8ba] text-[11px] text-slate-700">
            <span className="bg-[#f8fafc] px-3 py-1">Listo</span>
            <span className="bg-[#f8fafc] px-3 py-1">Vista 100%</span>
            <span className="bg-[#f8fafc] px-3 py-1">Datos mock</span>
            <span className="bg-[#f8fafc] px-3 py-1">Sin conexion Prisma</span>
            <span className="bg-[#f8fafc] px-3 py-1 font-mono font-semibold">Total {formatMoney(total)}</span>
          </div>
        </footer>
      </div>
    </main>
  )
}

function RibbonGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid min-h-20 shrink-0 grid-rows-[1fr_16px] border-r border-[#9aa8ba] pr-2">
      <div className="flex flex-wrap content-start gap-1 rounded-sm border border-[#c0cada] bg-[#eef3fa] p-1 shadow-[inset_0_1px_0_white]">{children}</div>
      <p className="text-center text-[10px] font-semibold uppercase leading-4 text-slate-600">{title}</p>
    </div>
  )
}

function RibbonTabMenu({
  label,
  items,
  isActive,
  isOpen,
  onOpen,
  onClose,
  onToggle,
}: {
  label: string
  items: { label: string; href: string; divider?: boolean; disabled?: boolean }[]
  isActive: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onToggle: () => void
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        onClick={onToggle}
        className={`border-x border-t px-4 py-1 text-[11px] font-semibold ${
          isActive || isOpen
            ? 'border-[#9aa8ba] bg-[#f6f8fb] text-[#0f4c81]'
            : 'border-transparent text-slate-800 hover:border-[#b4c1d2] hover:bg-[#eef3fa] hover:text-[#0f4c81]'
        }`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {label}
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 w-56 border border-[#7f8da1] bg-[#f8fafc] py-1 text-[11px] shadow-[2px_3px_8px_rgba(15,23,42,0.28)]"
        >
          {items.map((item) => (
            <Link
              key={`${label}-${item.label}`}
              href={item.href}
              role="menuitem"
              aria-disabled={item.disabled}
              onClick={onClose}
              className={`flex h-7 items-center justify-between border-t px-3 font-semibold text-slate-800 first:border-t-0 hover:bg-[#dcecff] hover:text-[#0f4c81] ${
                item.divider ? 'border-t-[#a7b4c6]' : 'border-t-transparent'
              } ${item.disabled ? 'pointer-events-none text-slate-400' : ''}`}
            >
              <span>{item.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StatusCell({ label, value, subvalue }: { label: string; value: ReactNode; subvalue?: string }) {
  return (
    <div className="bg-[#f8fafc] px-2 py-1 shadow-[inset_0_1px_0_white]">
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="truncate font-mono text-xs font-semibold text-slate-950">{value}</p>
      {subvalue ? <p className="truncate text-[11px] text-slate-500">{subvalue}</p> : null}
    </div>
  )
}

function getFormulaPreview(pathname: string) {
  if (pathname.includes('/presupuestos')) return '=CANTIDAD*PRECIO_UNITARIO'
  if (pathname.includes('/rubros')) return '=DIRECTO*(1+INDIRECTO%)'
  if (pathname.includes('/materiales') || pathname.includes('/mano-obra') || pathname.includes('/equipos')) return '=PRECIO_ACTUAL'
  return '=SUMA(PRESUPUESTO[TOTAL])'
}

function getActiveRibbonTab(pathname: string) {
  if (pathname.includes('/presupuestos')) return 'Presupuesto'
  if (pathname.includes('/rubros')) return 'Rubros'
  if (pathname.includes('/materiales') || pathname.includes('/mano-obra') || pathname.includes('/equipos')) return 'Insumos'
  if (pathname.includes('/dashboard')) return 'Archivo'
  return 'Archivo'
}

function isActiveSheet(pathname: string, match: string, label: string) {
  if (label === 'Transporte' || label === 'Reportes') return false
  return pathname.startsWith(match)
}
