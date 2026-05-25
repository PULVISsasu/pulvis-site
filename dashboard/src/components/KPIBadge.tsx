import type { KPIStatus } from '../types/pulvis'

interface KPIBadgeConfig {
  label:   string
  emoji:   string
  bg:      string
  border:  string
  text:    string
  dot:     string
}

export const KPI_CONFIG: Record<KPIStatus, KPIBadgeConfig> = {
  SCALE:      { label: 'SCALE',      emoji: '🚀', bg: 'bg-emerald-950', border: 'border-emerald-800', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  GO:         { label: 'GO',         emoji: '✅', bg: 'bg-green-950',   border: 'border-green-800',   text: 'text-green-300',   dot: 'bg-green-400'   },
  BON:        { label: 'BON',        emoji: '👍', bg: 'bg-blue-950',    border: 'border-blue-800',    text: 'text-blue-300',    dot: 'bg-blue-400'    },
  SURVEILLER: { label: 'SURVEILLER', emoji: '⚠️', bg: 'bg-amber-950',   border: 'border-amber-800',   text: 'text-amber-300',   dot: 'bg-amber-400'   },
  CORRIGER:   { label: 'CORRIGER',   emoji: '🔴', bg: 'bg-red-950',     border: 'border-red-900',     text: 'text-red-300',     dot: 'bg-red-500'     },
}

interface Props {
  status: KPIStatus
  size?: 'sm' | 'md' | 'lg'
  showEmoji?: boolean
}

export default function KPIBadge({ status, size = 'md', showEmoji = true }: Props) {
  const cfg = KPI_CONFIG[status]

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size]

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium tabular-nums
        ${cfg.bg} ${cfg.border} ${cfg.text} ${sizeClasses}`}
    >
      {showEmoji && <span className="text-sm leading-none">{cfg.emoji}</span>}
      {cfg.label}
    </span>
  )
}
