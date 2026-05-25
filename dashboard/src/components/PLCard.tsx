/**
 * PLCard — compte de résultat complet Pulvis sur 30 jours
 * V3 (009) : Phase 1 financement + Phase 2 payée · CAPEX V1 réel · délai autofinancement
 */
import SimulationBadge from './SimulationBadge'
import type { CompanyCost, MachineProfitability } from '../types/pulvis'

function fmt(n: number, dec = 2) {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  }) + ' €'
}

function fmtPct(n: number) {
  return n.toFixed(1) + '%'
}

// Ligne de résultat
interface LineProps {
  label:     string
  value:     number
  sub?:      string
  color?:    string
  bold?:     boolean
  indent?:   boolean
  sign?:     'minus' | 'plus' | 'neutral'
  border?:   'top' | 'double-top'
  dimmed?:   boolean
}

function Line({ label, value, sub, color, bold, indent, sign = 'neutral', border, dimmed }: LineProps) {
  const signedValue = sign === 'minus'
    ? '− ' + fmt(Math.abs(value))
    : sign === 'plus'
    ? '+ ' + fmt(value)
    : fmt(value)

  const valueColor = color ?? (
    sign === 'minus' ? (dimmed ? 'text-gray-700' : 'text-red-400') :
    sign === 'plus'  ? 'text-emerald-400' :
    'text-white'
  )

  return (
    <div className={`flex items-center justify-between py-1.5
      ${indent ? 'pl-4' : ''}
      ${border === 'top'        ? 'border-t border-gray-800 mt-1 pt-2.5' : ''}
      ${border === 'double-top' ? 'border-t-2 border-gray-700 mt-1 pt-2.5' : ''}
    `}>
      <div className="flex flex-col min-w-0">
        <span className={`text-sm ${bold ? 'font-semibold text-white' : dimmed ? 'text-gray-600' : 'text-gray-400'}`}>
          {label}
        </span>
        {sub && <span className="text-xs text-gray-600">{sub}</span>}
      </div>
      <span className={`text-sm tabular-nums flex-shrink-0 ml-4 ${valueColor} ${bold ? 'font-bold' : ''}`}>
        {signedValue}
      </span>
    </div>
  )
}

// Séparateur de section
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="pt-3 pb-0.5">
      <span className="text-[10px] uppercase tracking-widest text-gray-700 font-medium">
        {label}
      </span>
    </div>
  )
}

interface Props {
  profitability: MachineProfitability
  companyCosts:  CompanyCost[]
}

export default function PLCard({ profitability: p, companyCosts }: Props) {
  const perMachineCosts   = companyCosts.filter(c => c.is_active && c.is_per_machine)
  const companyFixedCosts = companyCosts.filter(c => c.is_active && !c.is_per_machine)
  const companyTotal      = companyFixedCosts.reduce((s, c) => s + c.monthly_amount, 0)

  const capexTotal          = p.capex_total          ?? (p.machine_cost + 440)
  const installmentAmt      = p.machine_installment_amt ?? 400
  const installments        = p.machine_installments    ?? 3
  const nayaxHardwareCost   = (p.nayax_terminal_cost ?? 415) + (p.nayax_activation_cost ?? 25)
  const cashflowPhase1      = p.cashflow_phase1_30d  ?? (p.cashflow_net_30d - installmentAmt)
  const cashflowPhase1Pct   = p.cashflow_phase1_pct  ?? 0
  const breakEvenP1         = p.breakeven_phase1_sprays_per_day ?? 0
  const spraysForInstallment = p.sprays_per_day_for_installment ?? 0
  const delaiAutofin        = p.delai_autofinancement_mois ?? null

  return (
    <div className="card p-5">
      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-white">Compte de résultat — 30 jours</h3>
            {p.simulation_mode && <SimulationBadge size="xs" />}
          </div>
          <p className="text-xs text-gray-600">
            {p.serial_number} · {p.location_name} · {p.sprays_30d} sprays
          </p>
        </div>

        {/* Phase 2 / Phase 1 côte à côte */}
        <div className="flex items-end gap-5">
          <div className="text-right">
            <div className="text-[10px] text-gray-700 mb-0.5 uppercase tracking-widest">Phase 1 · financement</div>
            <div className={`text-lg font-bold tabular-nums ${cashflowPhase1 >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
              {fmt(cashflowPhase1, 0)}
            </div>
            <div className="text-[10px] text-gray-600">
              {cashflowPhase1Pct.toFixed(1)}% CA HT
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-700 mb-0.5 uppercase tracking-widest">Phase 2 · payée</div>
            <div className={`text-2xl font-bold tabular-nums ${p.cashflow_net_30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmt(p.cashflow_net_30d, 0)}
            </div>
            <div className="text-[10px] text-gray-600">
              {fmtPct(p.cashflow_net_pct)} CA HT
            </div>
          </div>
        </div>
      </div>

      {/* ── P&L ──────────────────────────────────────────────── */}
      <div className="space-y-0">

        {/* Chiffre d'affaires */}
        <Line label="CA TTC"                  value={p.ca_ttc_30d}      bold color="text-white" />
        <Line label="(−) TVA collectée (20%)"
              value={p.tva_collectee_30d}
              sub="reversée à l'État · non encaissée"
              sign="minus" />
        <Line label="CA HT"                   value={p.ca_ht_30d}       bold border="top"
              color="text-blue-300" />

        {/* Coûts variables */}
        <SectionLabel label="Coûts variables" />
        <Line label="(−) Parfum"
              value={p.cogs_parfum_30d}
              sub="0,031 €/spray · 15,50 € / 500 sprays"
              sign="minus" indent />
        <Line label="(−) Commission Nayax"
              value={p.nayax_commission_30d}
              sub={`${p.nayax_commission_pct}% du CA TTC`}
              sign="minus" indent />
        <Line label="(−) Abonnement terminal Nayax"
              value={p.nayax_fee_30d}
              sub="15 €/mois"
              sign="minus" indent />

        <Line label="Marge machine"
              value={p.machine_margin_30d}
              sub={fmtPct(p.machine_margin_pct) + ' du CA HT'}
              bold border="top"
              color={p.machine_margin_30d > 0 ? 'text-emerald-400' : 'text-red-400'} />

        {/* Frais opérationnels machine (scalables) */}
        <SectionLabel label="Frais opérationnels machine" />
        {perMachineCosts.map(c => (
          <Line
            key={c.id}
            label={`(−) ${c.name}`}
            value={c.monthly_amount}
            sub={c.notes ?? undefined}
            sign="minus" indent
          />
        ))}
        <Line label="Sous-total opex machine"
              value={p.machine_fixed_30d}
              sign="minus" bold border="top" />

        {/* Frais fixes société */}
        <SectionLabel label="Frais fixes société" />
        {companyFixedCosts.map(c => (
          <Line
            key={c.id}
            label={`(−) ${c.name}`}
            value={c.monthly_amount}
            sign="minus" indent
          />
        ))}
        <Line label="Sous-total frais fixes"
              value={companyTotal}
              sign="minus" bold border="top" />

        {/* ── Cashflow trésorerie Phase 2 ── */}
        <Line
          label="Cashflow trésorerie  (Phase 2 · machine payée)"
          value={p.cashflow_net_30d}
          sub={fmtPct(p.cashflow_net_pct) + ' du CA HT · cash disponible'}
          bold border="double-top"
          color={p.cashflow_net_30d > 0 ? 'text-emerald-400' : 'text-red-400'}
        />

        {/* ── Phase 1 financement ── */}
        <SectionLabel label={`Phase financement machine · mois 1–${installments}`} />
        <Line
          label={`(−) Mensualité machine`}
          value={installmentAmt}
          sub={`${installments} × ${fmt(installmentAmt, 0)} · comptant · couvre ${spraysForInstallment.toFixed(1)} sprays/j`}
          sign="minus" indent
        />
        <Line
          label="Cashflow Phase 1  (pendant financement)"
          value={cashflowPhase1}
          sub={fmtPct(cashflowPhase1Pct) + ' du CA HT'}
          bold border="top"
          color={cashflowPhase1 >= 0 ? 'text-emerald-300' : 'text-red-400'}
        />

        {/* ── Amortissement (non-cash) ── */}
        <SectionLabel label="Amortissement comptable (non-cash)" />
        <Line
          label={`(−) Amortissement machine`}
          value={p.amortissement_30d}
          sub={`CAPEX ${fmt(capexTotal, 0)} / ${p.amortization_months} mois · non décaissé`}
          sign="minus" indent dimmed
        />

        {/* Résultat net comptable */}
        <Line
          label="Résultat net comptable"
          value={p.resultat_net_30d}
          sub="après amortissement · base IS"
          bold border="double-top"
          color={p.resultat_net_30d > 0 ? 'text-emerald-300' : 'text-red-400'}
        />
      </div>

      {/* ── Bloc KPIs — 3 colonnes ─────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-800">

        {/* Seuil rentabilité */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Seuil rentabilité</div>
          <div className="text-xl font-bold text-amber-400 tabular-nums">
            {p.breakeven_sprays_per_day.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-700">sprays/j · Phase 2</div>
          {breakEvenP1 > 0 && (
            <div className="text-[10px] text-amber-700 mt-0.5">
              Phase 1 : {breakEvenP1.toFixed(1)}/j
            </div>
          )}
        </div>

        {/* Cashflow Phase 1 */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Cashflow Phase 1</div>
          <div className={`text-xl font-bold tabular-nums ${cashflowPhase1 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(cashflowPhase1, 0)}
          </div>
          <div className="text-[10px] text-gray-700">mois financement</div>
          {spraysForInstallment > 0 && (
            <div className="text-[10px] text-gray-700 mt-0.5">
              {spraysForInstallment.toFixed(1)} sprays/j → mensualité
            </div>
          )}
        </div>

        {/* Délai autofinancement */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Délai autofinancement</div>
          {delaiAutofin !== null ? (
            <>
              <div className="text-xl font-bold text-violet-400 tabular-nums">
                {delaiAutofin.toFixed(1)}
              </div>
              <div className="text-[10px] text-gray-700">mois</div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-gray-700">—</div>
              <div className="text-[10px] text-gray-700">cashflow négatif</div>
            </>
          )}
        </div>
      </div>

      {/* ── CAPEX V1 + projection annuelle ─────────────────── */}
      <div className="mt-4 pt-4 border-t border-gray-800/60 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-gray-700">
          <span>
            CAPEX V1 · {fmt(capexTotal, 0)}
            {' '}(machine {fmt(p.machine_cost, 0)} + Nayax {fmt(nayaxHardwareCost, 0)})
            {' '}· amort. {fmt(p.amortissement_30d, 0)}/mois
          </span>
          {p.delai_prochaine_machine !== null && (
            <span className="text-violet-700">
              Délai machine suivante (P2) : {p.delai_prochaine_machine.toFixed(1)} mois
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Projection annuelle (305 j/an actifs)</span>
          <span className={`text-sm font-bold tabular-nums ${p.cashflow_annual_projection > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
            {p.cashflow_annual_projection > 0 ? fmt(p.cashflow_annual_projection, 0) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
