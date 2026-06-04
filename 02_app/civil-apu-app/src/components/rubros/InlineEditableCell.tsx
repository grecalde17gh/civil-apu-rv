'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import {
  updateRubroEquipmentInlineAction,
  updateRubroLaborInlineAction,
  updateRubroMaterialInlineAction,
  updateRubroTransportInlineAction,
} from '@/app/rubros/inline-actions'

type InlineActionName = 'material' | 'labor' | 'equipment' | 'transport'
type InlineValueType = 'decimal' | 'text'

type InlineEditableCellProps = {
  actionName: InlineActionName
  fieldName: string
  value: string
  payload: Record<string, string>
  type?: InlineValueType
  required?: boolean
  align?: 'left' | 'right'
}

const actions = {
  material: updateRubroMaterialInlineAction,
  labor: updateRubroLaborInlineAction,
  equipment: updateRubroEquipmentInlineAction,
  transport: updateRubroTransportInlineAction,
}

function normalizeDecimal(value: string): { ok: true; value: string } | { ok: false; message: string } {
  const normalized = value.trim().replace(',', '.')

  if (normalized === '') {
    return { ok: false, message: 'El valor es obligatorio' }
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, message: 'Ingrese un numero mayor o igual a cero' }
  }

  return { ok: true, value: normalized }
}

export default function InlineEditableCell({
  actionName,
  fieldName,
  value,
  payload,
  type = 'decimal',
  required = false,
  align = 'right',
}: InlineEditableCellProps) {
  const router = useRouter()
  const [draft, setDraft] = useState(value)
  const [displayValue, setDisplayValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const savingRef = useRef(false)

  function cancelEdit() {
    setDraft(displayValue)
    setMessage(null)
    setIsEditing(false)
  }

  function submitEdit(rawValue: string) {
    if (savingRef.current) return

    let nextValue = rawValue
    if (type === 'decimal') {
      const normalized = normalizeDecimal(rawValue)
      if (!normalized.ok) {
        setMessage(normalized.message)
        return
      }
      nextValue = normalized.value
    } else if (required && rawValue.trim() === '') {
      setMessage('El valor es obligatorio')
      return
    } else {
      nextValue = rawValue.trim()
    }

    if (nextValue === displayValue) {
      cancelEdit()
      return
    }

    const formData = new FormData()
    Object.entries(payload).forEach(([key, payloadValue]) => {
      formData.set(key, payloadValue)
    })
    formData.set(fieldName, nextValue)

    savingRef.current = true
    setMessage(null)

    startTransition(async () => {
      const result = await actions[actionName](formData)
      savingRef.current = false

      if (!result.ok) {
        setDraft(displayValue)
        setMessage(result.message ?? 'No se pudo guardar el cambio')
        setIsEditing(false)
        return
      }

      setDisplayValue(nextValue)
      setDraft(nextValue)
      setIsEditing(false)
      router.refresh()
    })
  }

  if (isEditing) {
    return (
      <td className="px-2 py-1 align-top">
        <input
          autoFocus
          value={draft}
          required={required}
          inputMode={type === 'decimal' ? 'decimal' : undefined}
          disabled={isPending}
          onBlur={() => submitEdit(draft)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submitEdit(draft)
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              cancelEdit()
            }
          }}
          className={`h-7 w-full min-w-20 rounded border border-blue-500 bg-white px-2 text-xs shadow-sm outline-none ring-2 ring-blue-100 ${
            align === 'right' ? 'text-right font-mono tabular-nums' : 'text-left'
          }`}
        />
        {message ? <p className="mt-1 max-w-44 text-[11px] font-medium text-rose-700">{message}</p> : null}
      </td>
    )
  }

  return (
    <td
      role="button"
      tabIndex={0}
      title="Editar celda"
      onClick={() => setIsEditing(true)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          setIsEditing(true)
        }
      }}
      className={`cursor-pointer px-3 py-2 transition hover:bg-blue-100 ${
        align === 'right' ? 'font-mono tabular-nums text-slate-800' : 'text-slate-700'
      } ${message ? 'bg-rose-50 ring-1 ring-inset ring-rose-200' : 'bg-white'}`}
    >
      <span>{displayValue || '-'}</span>
      {message ? <p className="mt-1 max-w-44 text-[11px] font-medium text-rose-700">{message}</p> : null}
    </td>
  )
}
