import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'gold' | 'muted' | 'success' | 'warning'
  className?: string
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  gold: 'border-pulvis-gold/40 text-pulvis-gold',
  muted: 'border-white/15 text-pulvis-muted',
  success: 'border-emerald-400/30 text-emerald-300',
  warning: 'border-amber-400/30 text-amber-300',
}

export default function Badge({ children, tone = 'gold', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest2 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
