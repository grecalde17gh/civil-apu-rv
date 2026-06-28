import DesktopShell from '@/src/components/desktop/DesktopShell'

export default function DesktopTransportPage() {
  return <DesktopShell activeModule="Transporte"><section className="max-w-3xl border border-amber-300 bg-amber-50 p-4 shadow-sm"><h1 className="text-base font-bold text-amber-950">Transporte · preparación de catálogo</h1><p className="mt-2 text-sm text-amber-900">En el modelo actual, cada transporte pertenece a un Rubro y guarda sus propios snapshots de cantidad y costo. No existe un catálogo maestro de transporte.</p><p className="mt-2 text-sm text-amber-900">Esta rama no modifica Rubros ni Presupuestos. Para habilitar edición masiva aquí se requiere aprobar un nuevo modelo independiente de transporte y, en una fase posterior, decidir cómo se vinculará con los APUs sin alterar sus snapshots.</p></section></DesktopShell>
}
