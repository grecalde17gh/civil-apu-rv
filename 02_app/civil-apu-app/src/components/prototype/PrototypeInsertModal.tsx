'use client'

import { useState } from 'react'
import { PrototypeButton } from './PrototypeButtons'

type PrototypeInsertModalProps = {
  label: string
  title: string
  codePrefix: string
}

export default function PrototypeInsertModal({ label, title, codePrefix }: PrototypeInsertModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <PrototypeButton tone="primary" onClick={() => setIsOpen(true)}>
        {label}
      </PrototypeButton>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-xl border border-slate-500 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-300 bg-slate-900 px-4 py-2 text-white">
              <p className="text-sm font-semibold">{title}</p>
              <button type="button" className="h-7 w-7 rounded border border-slate-500 text-sm" onClick={() => setIsOpen(false)}>
                X
              </button>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                Codigo
                <input defaultValue={`${codePrefix}-TEMP`} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-xs" />
              </label>
              <label className="text-xs font-semibold uppercase text-slate-600">
                Unidad
                <input defaultValue="u" className="mt-1 h-8 w-full border border-slate-300 px-2 text-xs" />
              </label>
              <label className="sm:col-span-2 text-xs font-semibold uppercase text-slate-600">
                Descripcion
                <input defaultValue="Nuevo registro de prueba" className="mt-1 h-8 w-full border border-slate-300 px-2 text-xs" />
              </label>
              <label className="text-xs font-semibold uppercase text-slate-600">
                Precio unitario
                <input defaultValue="0.00" className="mt-1 h-8 w-full border border-slate-300 px-2 text-right font-mono text-xs" />
              </label>
              <label className="text-xs font-semibold uppercase text-slate-600">
                Estado
                <select defaultValue="Activo" className="mt-1 h-8 w-full border border-slate-300 px-2 text-xs">
                  <option>Activo</option>
                  <option>Revision</option>
                  <option>Inactivo</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-300 bg-slate-100 px-4 py-3">
              <PrototypeButton onClick={() => setIsOpen(false)}>Cancelar</PrototypeButton>
              <PrototypeButton tone="success" onClick={() => setIsOpen(false)}>
                Insertar mock
              </PrototypeButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
