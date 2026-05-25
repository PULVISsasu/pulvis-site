/**
 * NetworkProjectionTable — Projections cashflow réseau multi-machines
 * 1 / 3 / 5 / 10 machines à même performance moyenne
 * V3 (009) : CAPEX V1 réel 1640€ · Phase 1 financement · délai prochaine machine
 */
import type { CompanyCost, MachineData, CompanyOverview } from '../types/pulvis'

// ---------------------------------------------------------------------------
// Constantes financières V1 (mirror de _financial_constants SQL)
// ---------------------------------------------------------------------------
const PRICE_HT          = 1.0 / 1.20    // 0,8333 €/spray HT
const COGS_PER_SPRAY    = 0.031          // 0,031 €/spray
const NAYAX_COMM_PCT    = 0.02           // 2% du CA TTC
const NAYAX_FEE_PM      = 15.0           // €/machine/mois
const ACTIVE_DAYS       = 305            // jours actifs/an
const MACHINE_COUNTS    = [1, 3, 5, 10]
const AUTONOMY_TARGET   = 2_000          // €/mois seuil autonomie
const CAPEX_PM          = 1_640          // CAPEX V1 / machine (machine 1200 + Nayax 440)
const MENSUALITE_PM     = 400            // mensualité financement / machine
const INSTALLMENTS      = 3              // nombre de mensualités

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
function fmtE(n: number, dec = 0) {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  }) + ' €'
}

// ---------------------------------------------------------------------------
// Calcul projection pour N machines
// ---------------------------------------------------------------------------
interface ProjectionRow {
  machineCount:           number
  sprayPerDayTotal:       number
  sprays30d:              number
  caHt:                   number
  cogs:                   number
  nayaxComm:              number
  nayaxFees:              number
  machineOpex:            number
  companyFixed:           number
  totalCosts:             number
  // Phase 2 — machine payée (steady state)
  cashflowTresorerie:     number
  cashflowPct:            number
  isAutonomous:           boolean
  // Phase 1 — pendant financement (N × mensualité)
  mensualitesTotal:       number
  cashflowPhase1:         number
  cashflowPhase1Pct:      number
  isAutonomousPhase1:     boolean
  // Délai prochaine machine (depuis CF Phase 2 total → 1 machine CAPEX)
  delaiProchaineMachine:  number | null
  // Projection annuelle
  cashflowAnnual:         number
}

function computeProjections(
  avgSprayPerDay: number,
  perMachineOpex: number,
  companyFixed:   number,
): ProjectionRow[] {
  return MACHINE_COUNTS.map(n => {
    const sprays30d        = n * avgSprayPerDay * 30
    const caHt             = sprays30d * PRICE_HT
    const cogs             = sprays30d * COGS_PER_SPRAY
    const nayaxComm        = sprays30d * NAYAX_COMM_PCT   // 2% de TTC ≈ 2% × 1€
    const nayaxFees        = n * NAYAX_FEE_PM
    const machineOpex      = n * perMachineOpex
    const cashflow         = caHt - cogs - nayaxComm - nayaxFees - machineOpex - companyFixed
    const mensualitesTotal = n * MENSUALITE_PM
    const cashflowP1       = cashflow - mensualitesTotal

    const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d

    return {
      machineCount:          n,
      sprayPerDayTotal:      n * avgSprayPerDay,
      sprays30d:             Math.round(sprays30d),
      caHt:                  r(caHt),
      cogs:                  r(cogs),
      nayaxComm:             r(nayaxComm),
      nayaxFees:             r(nayaxFees),
      machineOpex:           r(machineOpex),
      companyFixed:          r(companyFixed),
      totalCosts:            r(cogs + nayaxComm + nayaxFees + machineOpex + companyFixed),
      // Phase 2
      cashflowTresorerie:    r(cashflow),
      cashflowPct:           caHt > 0 ? r(cashflow / caHt * 100, 1) : 0,
      isAutonomous:          cashflow >= AUTONOMY_TARGET,
      // Phase 1
      mensualitesTotal:      r(mensualitesTotal),
      cashflowPhase1:        r(cashflowP1),
      cashflowPhase1Pct:     caHt > 0 ? r(cashflowP1 / caHt * 100, 1) : 0,
      isAutonomousPhase1:    cashflowP1 >= AUTONOMY_TARGET,
      // Délai prochaine machine : combien de mois pour épargner CAPEX_PM depuis le CF total actuel
      delaiProchaineMachine: cashflow > 0
        ? Math.round(CAPEX_PM / cashflow * 10) / 10
        : null,
      // Projection annuelle
      cashflowAnnual:        Math.round(cashflow / 30 * ACTIVE_DAYS),
    }
  })
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

interface Props {
  machines:     MachineData[]
  companyCosts: CompanyCost[]
  overview:     CompanyOverview | null
}

export default function NetworkProjectionTable({ machines, companyCosts, overview }: Props) {
  if (!companyCosts.length && !machines.length) return null

  const perMachineOpex = companyCosts
    .filter(c => c.is_active && c.is_per_machine)
    .reduce((s, c) => s + c.monthly_amount, 0)

  const companyFixed = companyCosts
    .filter(c => c.is_active && !c.is_per_machine)
    .reduce((s, c) => s + c.monthly_amount, 0)

  const avgSprayPerDay =
    overview?.avg_sprays_per_day ??
    (machines.length > 0 ? machines[0].avg_sprays_per_day_30d : 20)

  const rows = computeProjections(avgSprayPerDay, perMachineOpex, companyFixed)

  // Première ligne qui atteint l'autonomie (Phase 2)
  const machinesForAutonomy   = rows.find(r => r.isAutonomous)?.machineCount ?? null
  // Première ligne qui atteint l'autonomie en Phase 1
  const machinesForAutonomyP1 = rows.find(r => r.isAutonomousPhase1)?.machineCount ?? null

  return (
    <div className="card overflow-hidden">
      {/* En-tête */}
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Projections réseau multi-machines
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Base {avgSprayPerDay.toFixed(1)} sprays/j/machine
              · CAPEX {fmtE(CAPEX_PM, 0)}/machine · mensualité {fmtE(MENSUALITE_PM, 0)} × {INSTALLMENTS}
              · opex {fmtE(perMachineOpex, 2)}/machine · autonomie ≥ {fmtE(AUTONOMY_TARGET, 0)}/mois
            </p>
          </div>
          <div className="flex-shrink-0 ml-4 text-right">
            {machinesForAutonomy !== null && (
              <div className="mb-1">
                <div className="text-[10px] text-gray-600">Autonomie Phase 2</div>
                <div className="text-lg font-bold text-emerald-400">
                  {machinesForAutonomy} machine{machinesForAutonomy > 1 ? 's' : ''}
                </div>
              </div>
            )}
            {machinesForAutonomyP1 !== null && (
              <div>
                <div className="text-[10px] text-gray-600">Autonomie Phase 1</div>
                <div className="text-base font-bold text-emerald-600">
                  {machinesForAutonomyP1} machine{machinesForAutonomyP1 > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {[
                'Machines', 'Sprays/j', 'CA HT 30j',
                'Coûts var.', 'Opex machines', 'Frais sté',
                'CF Phase 2', 'CF Phase 1', '% CA HT',
                'Proj. annuelle', 'Délai machine', 'Autonomie',
              ].map(h => (
                <th key={h}
                  className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-gray-600 whitespace-nowrap font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={r.machineCount}
                className={`border-b border-gray-800/60 transition-colors
                  ${r.isAutonomous
                    ? 'bg-emerald-950/20 border-emerald-900/30'
                    : 'hover:bg-gray-800/20'}`}
              >
                {/* Machines */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-white tabular-nums">
                      {r.machineCount}
                    </span>
                    {r.isAutonomous && (
                      <span className="text-[10px] bg-emerald-900/50 text-emerald-300
                        border border-emerald-800/60 rounded px-1 py-0.5 font-medium">
                        auto
                      </span>
                    )}
                  </div>
                </td>

                {/* Sprays/j réseau */}
                <td className="px-3 py-3 text-gray-400 tabular-nums whitespace-nowrap">
                  {r.sprayPerDayTotal}
                </td>

                {/* CA HT */}
                <td className="px-3 py-3 text-white font-medium tabular-nums whitespace-nowrap">
                  {fmtE(r.caHt)}
                </td>

                {/* Coûts variables (COGS + nayax comm) */}
                <td className="px-3 py-3 text-red-500/70 tabular-nums whitespace-nowrap text-xs">
                  − {fmtE(r.cogs + r.nayaxComm, 2)}
                </td>

                {/* Opex machines (scalable) */}
                <td className="px-3 py-3 text-red-500/70 tabular-nums whitespace-nowrap text-xs">
                  − {fmtE(r.nayaxFees + r.machineOpex, 2)}
                </td>

                {/* Frais société (fixe) */}
                <td className="px-3 py-3 text-red-500/70 tabular-nums whitespace-nowrap text-xs">
                  − {fmtE(r.companyFixed, 2)}
                </td>

                {/* Cashflow Phase 2 (payée) */}
                <td className="px-3 py-3 font-bold tabular-nums whitespace-nowrap">
                  <span className={r.cashflowTresorerie >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {fmtE(r.cashflowTresorerie)}
                  </span>
                </td>

                {/* Cashflow Phase 1 (financement) */}
                <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                  <div>
                    <span className={r.cashflowPhase1 >= 0 ? 'text-emerald-300' : 'text-red-400'}>
                      {fmtE(r.cashflowPhase1)}
                    </span>
                    {r.isAutonomousPhase1 && (
                      <span className="ml-1 text-[9px] bg-emerald-900/40 text-emerald-400
                        border border-emerald-800/40 rounded px-1 py-0.5 font-medium">
                        auto
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-700">
                    − {fmtE(r.mensualitesTotal, 0)} mensualités
                  </div>
                </td>

                {/* % CA HT (Phase 2) */}
                <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                  <span className={
                    r.cashflowPct >= 65 ? 'text-emerald-500' :
                    r.cashflowPct >= 50 ? 'text-green-600'   :
                    r.cashflowPct >= 30 ? 'text-amber-600'   : 'text-red-600'
                  }>
                    {r.cashflowPct.toFixed(1)}%
                  </span>
                </td>

                {/* Projection annuelle */}
                <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                  <span className={r.cashflowTresorerie > 0 ? 'text-emerald-500 font-semibold' : 'text-gray-600'}>
                    {r.cashflowTresorerie > 0 ? fmtE(r.cashflowAnnual, 0) : '—'}
                  </span>
                </td>

                {/* Délai prochaine machine (depuis CF total actuel) */}
                <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                  {r.delaiProchaineMachine !== null ? (
                    <span className="text-violet-400">
                      {r.delaiProchaineMachine.toFixed(1)} mois
                    </span>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </td>

                {/* Autonomie Phase 2 */}
                <td className="px-3 py-3">
                  {r.isAutonomous ? (
                    <span className="text-emerald-400 text-xs font-medium">✓ Oui</span>
                  ) : (
                    <span className="text-gray-700 text-xs">✗ Non</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="px-5 py-3 border-t border-gray-800 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-gray-700">
        <span>
          <span className="text-gray-600 font-medium">Coûts var.</span>
          {' '}= COGS + Nayax comm (2%)
        </span>
        <span>
          <span className="text-gray-600 font-medium">Opex machines</span>
          {' '}= Nayax 15€ + déplacement + matériel + SAV (× N)
        </span>
        <span>
          <span className="text-gray-600 font-medium">CF Phase 1</span>
          {' '}= CF Phase 2 − mensualités (pendant financement)
        </span>
        <span>
          <span className="text-gray-600 font-medium">Délai machine</span>
          {' '}= {fmtE(CAPEX_PM, 0)} CAPEX ÷ CF Phase 2 total réseau
        </span>
        <span className="ml-auto text-gray-700">
          moy. 30j · CAPEX {fmtE(CAPEX_PM, 0)}/machine
        </span>
      </div>
    </div>
  )
}
