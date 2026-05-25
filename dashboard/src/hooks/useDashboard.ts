import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  CompanyCost,
  CompanyOverview,
  DashboardAlert,
  MachineData,
  MachineFinancials,
  MachineKPI,
  MachineProfitability,
  ProfitabilityScenario,
  TopPerfume,
  KPIStatus,
} from '../types/pulvis'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const KPI_RANK: Record<KPIStatus, number> = {
  SCALE: 5, GO: 4, BON: 3, SURVEILLER: 2, CORRIGER: 1,
}

const REFRESH_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL ?? 60_000)

// ---------------------------------------------------------------------------
// État du hook
// ---------------------------------------------------------------------------

export interface DashboardState {
  machines:     MachineData[]
  overview:     CompanyOverview | null
  scenarios:    ProfitabilityScenario[]
  companyCosts: CompanyCost[]
  topPerfumes:  TopPerfume[]
  alerts:       DashboardAlert[]
  bestStatus:   KPIStatus | null
  lastUpdated:  Date | null
  loading:      boolean
  error:        string | null
}

const EMPTY: DashboardState = {
  machines: [], overview: null, scenarios: [],
  companyCosts: [], topPerfumes: [], alerts: [],
  bestStatus: null, lastUpdated: null, loading: true, error: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mergeData(
  kpis:  MachineKPI[],
  fins:  MachineFinancials[],
  profs: MachineProfitability[],
): MachineData[] {
  return kpis
    .map(kpi => {
      const f = fins.find(x => x.machine_id === kpi.machine_id)
      const p = profs.find(x => x.machine_id === kpi.machine_id)
      return {
        ...kpi,
        revenue_today:              f?.revenue_today              ?? 0,
        revenue_30d:                f?.revenue_30d                ?? 0,
        simulation_mode:            p?.simulation_mode            ?? false,
        // CA
        ca_ttc_today:               p?.ca_ttc_today               ?? 0,
        ca_ht_today:                p?.ca_ht_today                ?? 0,
        tva_today:                  p?.tva_today                  ?? 0,
        ca_ttc_30d:                 p?.ca_ttc_30d                 ?? 0,
        ca_ht_30d:                  p?.ca_ht_30d                  ?? 0,
        tva_collectee_30d:          p?.tva_collectee_30d          ?? 0,
        // Coûts
        cogs_parfum_30d:            p?.cogs_parfum_30d            ?? 0,
        nayax_commission_30d:       p?.nayax_commission_30d       ?? 0,
        nayax_fee_30d:              p?.nayax_fee_30d              ?? 0,
        nayax_commission_pct:       p?.nayax_commission_pct       ?? 2,
        nayax_monthly_fee:          p?.nayax_monthly_fee          ?? 15,
        // Marges
        machine_margin_30d:         p?.machine_margin_30d         ?? 0,
        machine_margin_pct:         p?.machine_margin_pct         ?? 0,
        machine_fixed_30d:          p?.machine_fixed_30d          ?? 0,
        company_fixed_30d:          p?.company_fixed_30d          ?? 0,
        // Phase 2 — steady state
        cashflow_net_30d:           p?.cashflow_net_30d           ?? 0,
        cashflow_net_pct:           p?.cashflow_net_pct           ?? 0,
        // Phase 1 — financement V1 (009)
        mensualite_30d:             p?.mensualite_30d             ?? 400,
        cashflow_phase1_30d:        p?.cashflow_phase1_30d        ?? 0,
        cashflow_phase1_pct:        p?.cashflow_phase1_pct        ?? 0,
        // Délais
        delai_prochaine_machine:    p?.delai_prochaine_machine    ?? null,
        delai_autofinancement_mois: p?.delai_autofinancement_mois ?? null,
        // Hardware V1 (009)
        active_days_per_year:       p?.active_days_per_year       ?? 305,
        avg_sprays_per_day:         p?.avg_sprays_per_day         ?? kpi.avg_sprays_per_day_30d,
        machine_cost:               p?.machine_cost               ?? 1200,
        amortization_months:        p?.amortization_months        ?? 36,
        nayax_terminal_cost:        p?.nayax_terminal_cost        ?? 415,
        nayax_activation_cost:      p?.nayax_activation_cost      ?? 25,
        machine_installments:       p?.machine_installments       ?? 3,
        machine_installment_amt:    p?.machine_installment_amt    ?? 400,
        capex_total:                p?.capex_total                ?? 1640,
        breakeven_phase1_sprays_per_day: p?.breakeven_phase1_sprays_per_day ?? 0,
        sprays_per_day_for_installment:  p?.sprays_per_day_for_installment  ?? 0,
        // Amortissement + résultat net
        amortissement_30d:          p?.amortissement_30d          ?? 0,
        resultat_net_30d:           p?.resultat_net_30d           ?? 0,
        cashflow_annual_projection: p?.cashflow_annual_projection ?? 0,
        cashflow_annual_projection_phase1: 0,   // non fourni par la vue SQL
        breakeven_sprays_per_day:   p?.breakeven_sprays_per_day   ?? 0,
        cost_per_spray_ht:          p?.cost_per_spray_ht          ?? 0,
        contribution_per_spray:     p?.contribution_per_spray     ?? 0,
      }
    })
    .sort((a, b) => KPI_RANK[b.kpi_status] - KPI_RANK[a.kpi_status])
}

function buildAlerts(machines: MachineData[]): DashboardAlert[] {
  return machines
    .flatMap(m => {
      const loc = m.location_name ?? m.serial_number
      const alerts: DashboardAlert[] = []

      if (m.is_offline_suspected)
        alerts.push({ machine_id: m.machine_id, serial_number: m.serial_number, location_name: loc,
          type: 'offline',     severity: 'critical',
          message: `${m.serial_number} · ${loc} — hors-ligne > 2h` })

      if (m.has_empty_slot)
        alerts.push({ machine_id: m.machine_id, serial_number: m.serial_number, location_name: loc,
          type: 'empty_slot',  severity: 'critical',
          message: `${m.serial_number} · ${loc} — ${m.empty_slots} slot${m.empty_slots > 1 ? 's' : ''} vide${m.empty_slots > 1 ? 's' : ''} · remplissage requis` })

      if (m.has_low_stock && !m.has_empty_slot)
        alerts.push({ machine_id: m.machine_id, serial_number: m.serial_number, location_name: loc,
          type: 'low_stock',   severity: 'warning',
          message: `${m.serial_number} · ${loc} — stock bas sur ${m.low_stock_slots} slot${m.low_stock_slots > 1 ? 's' : ''}` })

      return alerts
    })
    .sort((a, b) => (b.severity === 'critical' ? 1 : 0) - (a.severity === 'critical' ? 1 : 0))
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

export function useDashboard(): DashboardState & { refresh: () => void } {
  const [state, setState] = useState<DashboardState>(EMPTY)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setState(prev => ({ ...prev, loading: prev.lastUpdated === null }))

    try {
      const [kpiR, finR, profR, ovR, scenR, costsR, perfR] = await Promise.all([
        supabase.from('machine_kpis').select('*'),
        supabase.from('machine_financials').select('*'),
        supabase.from('machine_profitability').select('*'),
        supabase.from('company_monthly_overview').select('*').single(),
        supabase.rpc('get_profitability_scenarios'),
        supabase.from('company_costs').select('*').eq('is_active', true).order('monthly_amount', { ascending: false }),
        supabase.rpc('get_top_perfumes', { days_back: 30, limit_n: 3 }),
      ])

      if (kpiR.error)  throw new Error(`machine_kpis : ${kpiR.error.message}`)
      if (finR.error)  throw new Error(`machine_financials : ${finR.error.message}`)

      const kpis     = (kpiR.data   ?? []) as MachineKPI[]
      const fins     = (finR.data   ?? []) as MachineFinancials[]
      const profs    = (profR.data  ?? []) as MachineProfitability[]
      const machines = mergeData(kpis, fins, profs)
      const alerts   = buildAlerts(machines)

      const bestStatus = machines.reduce<KPIStatus | null>(
        (best, m) => !best ? m.kpi_status
          : KPI_RANK[m.kpi_status] > KPI_RANK[best] ? m.kpi_status : best,
        null,
      )

      setState({
        machines,
        overview:     ovR.data   as CompanyOverview | null,
        scenarios:    (scenR.data ?? []) as ProfitabilityScenario[],
        companyCosts: (costsR.data ?? []) as CompanyCost[],
        topPerfumes:  (perfR.data  ?? []) as TopPerfume[],
        alerts,
        bestStatus,
        lastUpdated: new Date(),
        loading: false,
        error: null,
      })
    } catch (err) {
      setState(prev => ({
        ...prev, loading: false,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      }))
    }
  }, [])

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, REFRESH_MS)
    return () => clearInterval(t)
  }, [fetchData])

  // Realtime : refresh instantané sur toute nouvelle vente
  useEffect(() => {
    const ch = supabase
      .channel('pulvis_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'slot_events' },
        () => fetchData())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchData])

  return { ...state, refresh: fetchData }
}
