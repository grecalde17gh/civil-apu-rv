import Link from 'next/link'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/prototype/dashboard', label: 'Dashboard' },
  { href: '/prototype/presupuestos', label: 'Presupuestos' },
  { href: '/prototype/rubros', label: 'Rubros' },
  { href: '/prototype/materiales', label: 'Materiales' },
  { href: '/prototype/mano-obra', label: 'Mano de obra' },
  { href: '/prototype/equipos', label: 'Equipos' },
]

type PrototypeShellProps = {
  title: string
  subtitle: string
  actions?: ReactNode
  children: ReactNode
}

export default function PrototypeShell({ title, subtitle, actions, children }: PrototypeShellProps) {
  return (
    <main className="min-h-screen bg-slate-200 text-slate-950">
      <div className="mx-auto flex max-w-[1880px]">
        <aside className="hidden min-h-screen w-56 shrink-0 border-r border-slate-400 bg-slate-900 text-white lg:block">
          <div className="border-b border-slate-700 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-blue-200">Prototipo Excel</p>
            <p className="mt-1 text-sm font-semibold">Civil APU RV</p>
          </div>
          <nav className="space-y-1 p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded border border-transparent px-3 py-2 text-xs font-semibold uppercase text-slate-100 hover:border-blue-300 hover:bg-blue-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="border-b border-slate-400 bg-slate-100">
            <div className="flex flex-col gap-2 px-3 py-2 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
                <p className="text-xs text-slate-600">{subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">{actions}</div>
            </div>
            <div className="flex gap-1 overflow-x-auto border-t border-slate-300 bg-white px-2 py-1 lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-800"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-3">{children}</div>
        </section>
      </div>
    </main>
  )
}
