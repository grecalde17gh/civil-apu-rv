'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type RubroExitButtonProps = {
  href: string
}

export default function RubroExitButton({ href }: RubroExitButtonProps) {
  const router = useRouter()
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const form = document.getElementById('rubro-main-form')
    if (!form) return

    const markDirty = () => setDirty(true)
    form.addEventListener('input', markDirty)
    form.addEventListener('change', markDirty)

    return () => {
      form.removeEventListener('input', markDirty)
      form.removeEventListener('change', markDirty)
    }
  }, [])

  function handleExit() {
    if (dirty && !window.confirm('Hay cambios sin guardar. Deseas salir sin guardar?')) {
      return
    }

    router.push(href)
  }

  return (
    <button
      type="button"
      onClick={handleExit}
      className="h-8 rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
    >
      Salir
    </button>
  )
}
