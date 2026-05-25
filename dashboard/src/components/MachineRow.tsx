import KPIBadge      from './KPIBadge'
import StockDots     from './StockDots'
import SimulationBadge from './SimulationBadge'
import type { MachineData } from '../types/pulvis'

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function fmtE(n: number, decimals = 0) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: decimals,
  }).format(n)
}

function fmtSignal(iso: string | null): string {
  if (!iso) return 'jamais'
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 2)   return 'à l\'instant'
  if (mins < 60)  return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `il y a ${hrs}h`
  return `il y a ${Math.floor(hrs / 24)}j`
}

interface Props {
  machine: MachineData
}

export default function MachineRow({ machine: m }: Props) {
  const hasAlert = m.has_empty_slot || m.has_low_stock || m.is_offline_suspected

  return (
    <tr className={`border-b border-gray-800 transition-colors hover:bg-gray-800/30
      ${hasAlert ? 'bg-red-950/10' : ''}`}>

      {/* Machine + emplacement */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-mono">{m.serial_number}</span>
            {m.simulation_mode && <SimulationBadge size="xs" />}
          </div>
          <span className="text-xs text-gray-500 truncate max-w-[200px]">
            {m.location_name ?? '—'}
            {m.city && ` · ${m.city}`}
          </span>
        </div>
      </td>

      {/* Statut KPI */}
      <td className="px-4 py-4">
        <KPIBadge status={m.kpi_status} size="md" />
      </td>

      {/* Sprays auj. */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-bold text-white tabular-nums">{m.sprays_today}</span>
          <span className="text-xs text-gray-600">
            moy. {Number(m.avg_sprays_per_day_30d).toFixed(0)}<span className="text-gray-700">/j 30j</span>
          </span>
        </div>
      </td>

      {/* CA TTC (aujourd'hui + 30j) */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-bold text-white tabular-nums">{fmtE(m.ca_ttc_today)}</span>
          <span className="text-xs text-gray-600">
            {fmtE(m.ca_ttc_30d)}<span className="text-gray-700"> 30j</span>
          </span>
        </div>
      </td>

      {/* CA HT (aujourd'hui + 30j) */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-blue-300 tabular-nums">{fmtE(m.ca_ht_today)}</span>
          <span className="text-xs text-gray-600">
            {fmtE(m.ca_ht_30d)}<span className="text-gray-700"> 30j</span>
          </span>
        </div>
      </td>

      {/* Cashflow trésorerie 30j — Phase 2 / Phase 1 */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <span className={`text-lg font-bold tabular-nums
            ${m.cashflow_net_30d > 0 ? 'text-emerald-400' : m.cashflow_net_30d < 0 ? 'text-red-400' : 'text-gray-500'}`}>
            {fmtE(m.cashflow_net_30d)}
          </span>
          {/* Phase 1 — seulement si différent (financement actif) */}
          {m.machine_installments > 0 && m.cashflow_phase1_30d !== m.cashflow_net_30d && (
            <span className={`text-xs tabular-nums
              ${m.cashflow_phase1_30d >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              P1 {fmtE(m.cashflow_phase1_30d)}
            </span>
          )}
        </div>
      </td>

      {/* Stock */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <StockDots
            activeSlots={m.active_slots}
            emptySlots={m.empty_slots}
            lowStockSlots={m.low_stock_slots}
          />
          <span className="text-xs text-gray-600">
            {m.total_stock.toLocaleString('fr-FR')} sprays
          </span>
        </div>
      </td>

      {/* Signal */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0
            ${m.is_offline_suspected ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className={`text-xs ${m.is_offline_suspected ? 'text-red-400' : 'text-gray-500'}`}>
            {fmtSignal(m.last_seen_at)}
          </span>
        </div>
      </td>

    </tr>
  )
}
