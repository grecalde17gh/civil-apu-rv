import Link from 'next/link'

const desktopNavigation = [
  { group: 'Catálogos', items: [
    { label: 'Materiales', href: '/desktop/materials' },
    { label: 'Mano de obra', href: '/desktop/labor' },
    { label: 'Equipos', href: '/desktop/equipment' },
    { label: 'Transporte', href: '/desktop/transport' },
    { label: 'Denominaciones IPCO', href: '/desktop/denominations' },
  ] },
  { group: 'Operaciones', items: [
    { label: 'Rubros', href: '/rubros' },
    { label: 'Presupuestos', href: '/projects' },
    { label: 'Cronograma', href: '/projects' },
    { label: 'Fórmula Polinómica', href: '/projects' },
  ] },
  { group: 'Reportes', items: [{ label: 'Reportes', href: '/' }] },
]

type DesktopShellProps = {
  activeModule: string
  children: React.ReactNode
}

export default function DesktopShell({ activeModule, children }: DesktopShellProps) {
  return (
    <div className="min-h-screen bg-[#d9dce1] p-2 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1920px] flex-col overflow-hidden border border-slate-400 bg-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.22)]">
        <header className="border-b border-slate-500 bg-gradient-to-b from-slate-700 to-slate-800 text-white">
          <div className="flex h-9 items-center gap-3 border-b border-slate-600 px-3">
            <span className="text-xs font-bold tracking-wide">CIVIL APU RV</span>
            <span className="border-l border-slate-500 pl-3 text-[11px] text-slate-200">Prototipo escritorio · Tauri</span>
          </div>
          <div className="flex min-h-10 items-end gap-1 px-2 pt-1">
            <span className="border border-b-0 border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800">Archivo</span>
            <span className="px-3 py-2 text-xs">Inicio</span>
            <span className="px-3 py-2 text-xs">Datos</span>
            <span className="px-3 py-2 text-xs">Presupuesto</span>
            <span className="px-3 py-2 text-xs">Vista</span>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[190px_minmax(0,1fr)]">
          <aside className="border-r border-slate-400 bg-[#eef0f3] p-2">
            <nav className="space-y-4">
              {desktopNavigation.map((section) => (
                <section key={section.group}>
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{section.group}</p>
                  <div className="space-y-1">
                    {section.items.map((module) => (
                      <Link key={module.label} href={module.href} className={`block border px-2.5 py-2 text-xs font-semibold transition ${activeModule === module.label ? 'border-blue-700 bg-blue-700 text-white shadow-sm' : 'border-transparent text-slate-700 hover:border-slate-400 hover:bg-white'}`}>{module.label}</Link>
                    ))}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 overflow-auto bg-[#f7f7f8] p-3">{children}</main>
        </div>

        <footer className="flex h-6 items-center justify-between border-t border-slate-400 bg-slate-200 px-2 text-[10px] text-slate-600">
          <span>Modo exploración: edición aún no guarda datos.</span>
          <span>Preparado para futura sincronización local SQLite.</span>
        </footer>
      </div>
    </div>
  )
}
