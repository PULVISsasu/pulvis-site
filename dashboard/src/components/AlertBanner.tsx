import { useState } from 'react'
import type { DashboardAlert } from '../types/pulvis'

const SEVERITY_CLASSES = {
  critical: {
    bar:  'bg-red-950 border-red-800',
    icon: 'text-red-400',
    dot:  'bg-red-500',
    text: 'text-red-200',
  },
  warning: {
    bar:  'bg-amber-950 border-amber-800',
    icon: 'text-amber-400',
    dot:  'bg-amber-500',
    text: 'text-amber-200',
  },
  info: {
    bar:  'bg-blue-950 border-blue-800',
    icon: 'text-blue-400',
    dot:  'bg-blue-500',
    text: 'text-blue-200',
  },
}

const SEVERITY_ICON: Record<DashboardAlert['severity'], string> = {
  critical: '🚨',
  warning:  '⚠️',
  info:     'ℹ️',
}

interface Props {
  alerts: DashboardAlert[]
}

export default function AlertBanner({ alerts }: Props) {
  const [expanded, setExpanded] = useState(true)

  if (alerts.length === 0) return null

  const criticals = alerts.filter(a => a.severity === 'critical').length
  const warnings  = alerts.filter(a => a.severity === 'warning').length

  return (
    <div className="flex flex-col gap-1">
      {/* Barre résumé cliquable */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-2.5
          bg-red-950/60 border border-red-900 rounded-xl
          text-red-200 text-sm font-medium hover:bg-red-950 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          {criticals > 0 && (
            <span>{criticals} alerte{criticals > 1 ? 's' : ''} critique{criticals > 1 ? 's' : ''}</span>
          )}
          {criticals > 0 && warnings > 0 && <span className="text-red-600">·</span>}
          {warnings > 0 && (
            <span className="text-amber-300">{warnings} avertissement{warnings > 1 ? 's' : ''}</span>
          )}
        </span>
        <span className="text-xs text-red-500">{expanded ? '▲ masquer' : '▼ afficher'}</span>
      </button>

      {/* Détail des alertes */}
      {expanded && (
        <div className="flex flex-col gap-1 pl-2">
          {alerts.map((alert, i) => {
            const cls = SEVERITY_CLASSES[alert.severity]
            return (
              <div
                key={`${alert.machine_id}-${alert.type}-${i}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${cls.bar}`}
              >
                <span className="text-base">{SEVERITY_ICON[alert.severity]}</span>
                <span className={`text-sm ${cls.text}`}>{alert.message}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
