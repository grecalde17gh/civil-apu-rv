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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-xl border border-[#5f6f84] bg-[#d9e0ea] shadow-[4px_6px_16px_rgba(15,23,42,0.35)]">
            <div className="flex h-7 items-center justify-between border-b border-[#4f6685] bg-gradient-to-b from-[#2f6fa8] to-[#1b4f7e] px-2 text-white">
              <p className="text-xs font-semibold">{title}</p>
              <button
                type="button"
                className="h-5 w-6 border border-[#d6e1ef] bg-[#e9edf5] text-[11px] font-semibold text-slate-900 shadow-[inset_1px_1px_0_white] active:translate-y-px"
                onClick={() => setIsOpen(false)}
              >
                X
              </button>
            </div>
            <div className="m-2 border border-[#8d9bad] bg-[#eef3fa] p-3 shadow-[inset_0_1px_0_white]">
              <div className="grid gap-x-3 gap-y-2 sm:grid-cols-[130px_1fr]">
                <label className="self-center text-right text-[11px] font-semibold text-slate-700">Codigo:</label>
                <input defaultValue={`${codePrefix}-TEMP`} className="h-6 border border-[#8d9bad] px-2 font-mono text-xs shadow-[inset_1px_1px_1px_rgba(15,23,42,0.14)]" />

                <label className="self-center text-right text-[11px] font-semibold text-slate-700">Unidad:</label>
                <input defaultValue="u" className="h-6 border border-[#8d9bad] px-2 text-xs shadow-[inset_1px_1px_1px_rgba(15,23,42,0.14)]" />

                <label className="self-center text-right text-[11px] font-semibold text-slate-700">Descripcion:</label>
                <input defaultValue="Nuevo registro de prueba" className="h-6 border border-[#8d9bad] px-2 text-xs shadow-[inset_1px_1px_1px_rgba(15,23,42,0.14)]" />

                <label className="self-center text-right text-[11px] font-semibold text-slate-700">Precio unitario:</label>
                <input defaultValue="0.00" className="h-6 border border-[#8d9bad] px-2 text-right font-mono text-xs shadow-[inset_1px_1px_1px_rgba(15,23,42,0.14)]" />

                <label className="self-center text-right text-[11px] font-semibold text-slate-700">Estado:</label>
                <select defaultValue="Activo" className="h-6 border border-[#8d9bad] px-2 text-xs shadow-[inset_1px_1px_1px_rgba(15,23,42,0.14)]">
                  <option>Activo</option>
                  <option>Revision</option>
                  <option>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#9aa8ba] bg-[#e7edf6] px-3 py-2">
              <PrototypeButton tone="success" onClick={() => setIsOpen(false)}>
                Aceptar
              </PrototypeButton>
              <PrototypeButton onClick={() => setIsOpen(false)}>Cancelar</PrototypeButton>
              <PrototypeButton onClick={() => setIsOpen(false)}>Aplicar</PrototypeButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
