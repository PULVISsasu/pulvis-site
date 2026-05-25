/**
 * ScenarioTable — Tableau comparatif de rentabilité
 * 10 / 15 / 20 / 30 / 40 sprays/jour
 * V3 (009) : Phase 1 financement + Phase 2 payée
 */
import KPIBadge from './KPIBadge'
import type { ProfitabilityScenario } from '../types/pulvis'

function fmtE(n: number, dec = 0) {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  }) + ' €'
}

interface Props {
  scenarios:          ProfitabilityScenario[]
  currentSprayPerDay: number
}

export default function ScenarioTable({ scenarios, currentSprayPerDay }: Props) {
  if (!scenarios.length) return null

  // Ligne la plus proche des performances actuelles
  const closest = scenarios.reduce((best, s) =>
    Math.abs(s.sprays_per_day - currentSprayPerDay) <
    Math.abs(best.sprays_per_day - currentSprayPerDay) ? s : best
  )

  // Seuil de rentabilité dynamique depuis les données scénario
  const s0 = scenarios[0]
  const contribPerSpray = s0
    ? (s0.ca_ht_30d - s0.cogs_parfum_30d - s0.nayax_commission_30d) / s0.sprays_30d
    : 0.7823
  const totalFixed = s0 ? s0.nayax_fee_30d + s0.company_fixed_30d : 119.69
  const mensualitePM = s0?.mensualite_30d ?? 400

  const breakevenP2 = contribPerSpray > 0
    ? Math.ceil(totalFixed / (contribPerSpray * 30))
    : 5
  const breakevenP1 = contribPerSpray > 0
    ? Math.ceil((totalFixed + mensualitePM) / (contribPerSpray * 30))
    : 22
  const spraysForInstallment = contribPerSpray > 0
    ? Math.ceil(mensualitePM / (contribPerSpray * 30))
    : 17

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">
          Tableau de rentabilité par scénario
        </h3>
        <p className="text-xs text-gray-600 mt-0.5">
          Tous frais inclus · TVA + COGS + Nayax + opex machine + frais société · projection 305 j/an
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {[
                'Sprays/j', 'Statut', 'CA TTC', 'CA HT',
                'TVA', 'COGS', 'Nayax', 'Frais fixes',
                'Marge machine', 'CF Phase 2', 'CF Phase 1', '%', 'Proj. annuelle',
              ].map(h => (
                <th key={h}
                  className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-gray-600 whitespace-nowrap font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => {
              const isCurrent = s.sprays_per_day === closest.sprays_per_day
              const cfPhase1  = s.cashflow_phase1_30d ?? (s.cashflow_net_30d - mensualitePM)
              const cfP1Pct   = s.cashflow_phase1_pct ?? 0

              return (
                <tr
                  key={s.sprays_per_day}
                  className={`border-b border-gray-800/60 transition-colors
                    ${isCurrent
                      ? 'bg-blue-950/30 border-blue-900/40'
                      : 'hover:bg-gray-800/20'}`}
                >
                  {/* Sprays/j */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-white tabular-nums">
                        {s.sprays_per_day}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-900 text-blue-300
                          border border-blue-800 rounded px-1 py-0.5 font-medium">
                          actuel
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Statut KPI */}
                  <td className="px-3 py-3">
                    <KPIBadge status={s.kpi_status} size="sm" showEmoji={false} />
                  </td>

                  {/* CA TTC */}
                  <td className="px-3 py-3 text-gray-300 tabular-nums whitespace-nowrap">
                    {fmtE(s.ca_ttc_30d)}
                  </td>

                  {/* CA HT */}
                  <td className="px-3 py-3 text-white font-medium tabular-nums whitespace-nowrap">
                    {fmtE(s.ca_ht_30d)}
                  </td>

                  {/* TVA */}
                  <td className="px-3 py-3 text-gray-600 tabular-nums whitespace-nowrap">
                    {fmtE(s.tva_30d)}
                  </td>

                  {/* COGS */}
                  <td className="px-3 py-3 text-red-500 tabular-nums whitespace-nowrap">
                    − {fmtE(s.cogs_parfum_30d, 2)}
                  </td>

                  {/* Nayax (comm + fee) */}
                  <td className="px-3 py-3 text-red-500 tabular-nums whitespace-nowrap">
                    − {fmtE(s.nayax_commission_30d + s.nayax_fee_30d, 2)}
                  </td>

                  {/* Frais fixes (opex machine + société) */}
                  <td className="px-3 py-3 text-red-500 tabular-nums whitespace-nowrap">
                    − {fmtE(s.company_fixed_30d, 2)}
                  </td>

                  {/* Marge machine */}
                  <td className="px-3 py-3 text-gray-300 tabular-nums whitespace-nowrap">
                    {fmtE(s.machine_margin_30d)}
                  </td>

                  {/* Cashflow Phase 2 (machine payée) */}
                  <td className="px-3 py-3 font-bold tabular-nums whitespace-nowrap">
                    <span className={s.cashflow_net_30d > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {fmtE(s.cashflow_net_30d)}
                    </span>
                  </td>

                  {/* Cashflow Phase 1 (financement) */}
                  <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                    <div>
                      <span className={cfPhase1 >= 0 ? 'text-emerald-300' : 'text-red-400'}>
                        {fmtE(cfPhase1)}
                      </span>
                      {cfP1Pct !== 0 && (
                        <div className="text-[10px] text-gray-700">
                          {cfP1Pct.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </td>

                  {/* % Phase 2 */}
                  <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                    <span className={
                      s.cashflow_net_pct >= 70 ? 'text-emerald-500' :
                      s.cashflow_net_pct >= 50 ? 'text-green-600'   :
                      s.cashflow_net_pct >= 30 ? 'text-amber-600'   : 'text-red-600'
                    }>
                      {s.cashflow_net_pct.toFixed(0)}%
                    </span>
                  </td>

                  {/* Projection annuelle */}
                  <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                    <span className={s.is_profitable ? 'text-emerald-500 font-semibold' : 'text-gray-600'}>
                      {s.is_profitable ? fmtE(s.cashflow_annual_305d, 0) : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Légende seuils */}
      <div className="px-5 py-3 border-t border-gray-800 flex flex-wrap gap-x-5 gap-y-1">
        <span className="text-[10px] text-gray-700">
          Seuil Phase 2 :{' '}
          <span className="text-amber-600 font-medium">~{breakevenP2} sprays/j</span>
          {' '}· frais fixes (1 machine) :{' '}
          <span className="text-gray-600 font-medium">{fmtE(totalFixed, 2)}/mois</span>
        </span>
        <span className="text-[10px] text-gray-700">
          Seuil Phase 1 :{' '}
          <span className="text-amber-700 font-medium">~{breakevenP1} sprays/j</span>
          {' '}· dont mensualité :{' '}
          <span className="text-gray-600 font-medium">~{spraysForInstallment} sprays/j</span>
        </span>
        <span className="text-[10px] text-gray-700 ml-auto">
          1 spray = 1€ TTC · TVA 20% · parfum 0,031€ · Nayax 2%+15€ · opex 47,50€ · mensualité {fmtE(mensualitePM, 0)}
        </span>
      </div>
    </div>
  )
}
