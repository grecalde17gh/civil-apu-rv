import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  tone?: 'primary' | 'neutral' | 'success'
}

export function PrototypeButton({ children, tone = 'neutral', className = '', ...props }: ButtonProps) {
  const tones = {
    primary: 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800',
    neutral: 'border-slate-400 bg-white text-slate-800 hover:bg-slate-100',
    success: 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800',
  }

  return (
    <button
      type="button"
      className={`inline-flex h-8 items-center rounded border px-3 text-xs font-semibold uppercase ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function PrototypeLinkButton({
  href,
  children,
  tone = 'neutral',
}: {
  href: string
  children: ReactNode
  tone?: 'primary' | 'neutral' | 'success'
}) {
  const tones = {
    primary: 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800',
    neutral: 'border-slate-400 bg-white text-slate-800 hover:bg-slate-100',
    success: 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800',
  }

  return (
    <Link href={href} className={`inline-flex h-8 items-center rounded border px-3 text-xs font-semibold uppercase ${tones[tone]}`}>
      {children}
    </Link>
  )
}
