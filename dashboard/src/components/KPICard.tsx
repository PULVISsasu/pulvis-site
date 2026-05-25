import type { ReactNode } from 'react'

interface Props {
  label:     string
  value:     ReactNode
  sub?:      ReactNode
  accent?:   'green' | 'blue' | 'amber' | 'red' | 'default'
  icon?:     string
}

const ACCENT_CLASSES: Record<NonNullable<Props['accent']>, string> = {
  green:   'border-l-emerald-500',
  blue:    'border-l-blue-500',
  amber:   'border-l-amber-500',
  red:     'border-l-red-500',
  default: 'border-l-gray-700',
}

export default function KPICard({ label, value, sub, accent = 'default', icon }: Props) {
  return (
    <div className={`card p-5 border-l-4 ${ACCENT_CLASSES[accent]} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>

      <div className="value-xl leading-none">{value}</div>

      {sub && (
        <div className="text-xs text-gray-500">{sub}</div>
      )}
    </div>
  )
}
