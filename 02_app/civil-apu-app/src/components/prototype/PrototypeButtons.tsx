import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  tone?: 'primary' | 'neutral' | 'success'
}

export function PrototypeButton({ children, tone = 'neutral', className = '', ...props }: ButtonProps) {
  const tones = {
    primary: 'border-[#7c8da3] bg-gradient-to-b from-white to-[#dce6f3] text-slate-900 hover:border-[#2f6fa8] hover:from-[#eef7ff] hover:to-[#c9dff5]',
    neutral: 'border-[#7c8da3] bg-gradient-to-b from-white to-[#e3eaf4] text-slate-900 hover:border-[#2f6fa8] hover:from-[#eef7ff] hover:to-[#d5e8fa]',
    success: 'border-[#7c8da3] bg-gradient-to-b from-white to-[#dce6f3] text-slate-900 hover:border-[#217346] hover:from-[#effaf1] hover:to-[#d8eedc]',
  }

  return (
    <button
      type="button"
      className={`inline-flex h-7 items-center border px-2 text-[11px] font-semibold uppercase shadow-[inset_1px_1px_0_white] active:translate-y-px active:shadow-[inset_1px_1px_2px_rgba(15,23,42,0.22)] ${tones[tone]} ${className}`}
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
    primary: 'border-[#7c8da3] bg-gradient-to-b from-white to-[#dce6f3] text-slate-900 hover:border-[#2f6fa8] hover:from-[#eef7ff] hover:to-[#c9dff5]',
    neutral: 'border-[#7c8da3] bg-gradient-to-b from-white to-[#e3eaf4] text-slate-900 hover:border-[#2f6fa8] hover:from-[#eef7ff] hover:to-[#d5e8fa]',
    success: 'border-[#7c8da3] bg-gradient-to-b from-white to-[#dce6f3] text-slate-900 hover:border-[#217346] hover:from-[#effaf1] hover:to-[#d8eedc]',
  }

  return (
    <Link
      href={href}
      className={`inline-flex h-7 items-center border px-2 text-[11px] font-semibold uppercase shadow-[inset_1px_1px_0_white] active:translate-y-px active:shadow-[inset_1px_1px_2px_rgba(15,23,42,0.22)] ${tones[tone]}`}
    >
      {children}
    </Link>
  )
}

type RibbonButtonProps = {
  href: string
  label: string
  icon: LucideIcon
  size?: 'small' | 'large'
  active?: boolean
  disabled?: boolean
  className?: string
}

export function RibbonButton({
  href,
  label,
  icon: Icon,
  size = 'small',
  active = false,
  disabled = false,
  className = '',
}: RibbonButtonProps) {
  const base =
    'group border border-[#9ba8b8] bg-gradient-to-b from-white to-[#e5ebf3] text-slate-800 shadow-[inset_1px_1px_0_white,0_1px_1px_rgba(15,23,42,0.08)] transition hover:border-[#6f9ed1] hover:from-[#f4fbff] hover:to-[#dcebfa] active:translate-y-px active:border-[#4d83bd] active:from-[#d9eafa] active:to-[#eef7ff] active:shadow-[inset_1px_1px_2px_rgba(15,23,42,0.22)]'
  const activeStyles = active
    ? 'border-[#4d83bd] from-[#dcefff] to-[#c9dff4] text-[#0f4c81] shadow-[inset_0_0_0_1px_rgba(47,111,168,0.22)]'
    : ''
  const disabledStyles = disabled
    ? 'pointer-events-none border-[#c2cad4] from-[#f5f6f8] to-[#e7ebf0] text-slate-400 shadow-none'
    : ''

  const classes =
    size === 'large'
      ? `flex h-[62px] w-[78px] flex-col items-center justify-center gap-1 px-1 text-center text-[11px] font-semibold leading-tight ${base} ${activeStyles} ${disabledStyles} ${className}`
      : `flex h-7 min-w-[118px] items-center gap-1.5 px-2 text-[11px] font-semibold leading-none ${base} ${activeStyles} ${disabledStyles} ${className}`

  const iconClasses =
    size === 'large'
      ? 'h-6 w-6 text-[#1f5f99] group-hover:text-[#0f4c81]'
      : 'h-4 w-4 shrink-0 text-[#1f5f99] group-hover:text-[#0f4c81]'

  const content = (
    <>
      <span
        className={
          size === 'large'
            ? 'flex h-8 w-9 items-center justify-center rounded-[2px] border border-[#c6d0dd] bg-[#f8fafc] shadow-[inset_0_1px_0_white]'
            : 'flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[#c6d0dd] bg-[#f8fafc] shadow-[inset_0_1px_0_white]'
        }
      >
        <Icon className={iconClasses} aria-hidden="true" strokeWidth={1.9} />
      </span>
      <span className={size === 'large' ? 'max-w-full text-balance' : 'truncate'}>{label}</span>
    </>
  )

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true" title={label}>
        {content}
      </span>
    )
  }

  return (
    <Link href={href} className={classes} title={label} aria-current={active ? 'page' : undefined}>
      {content}
    </Link>
  )
}
