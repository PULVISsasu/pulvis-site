// =============================================================================
// Types Pulvis — miroir des vues SQL (007 + 008 + 009)
// =============================================================================

export type KPIStatus     = 'SCALE' | 'GO' | 'BON' | 'SURVEILLER' | 'CORRIGER'
export type AlertType     = 'empty_slot' | 'low_stock' | 'offline'
export type AlertSeverity = 'critical' | 'warning' | 'info'

// ---------------------------------------------------------------------------
// Vues de base
// ---------------------------------------------------------------------------

export interface MachineKPI {
  machine_id:             string
  serial_number:          string
  location_name:          string | null
  city:                   string | null
  location_type:          string | null
  machine_status:         string
  last_seen_at:           string | null
  installed_at:           string | null
  sprays_today:           number
  sprays_7d:              number
  sprays_30d:             number
  avg_sprays_per_day_30d: number
  kpi_status:             KPIStatus
  active_slots:           number
  empty_slots:            number
  low_stock_slots:        number
  total_stock:            number
  has_empty_slot:         boolean
  has_low_stock:          boolean
  is_offline_suspected:   boolean
}

export interface MachineFinancials {
  machine_id:         string
  serial_number:      string
  revenue_share_pct:  number
  total_sales:        number
  total_revenue:      number
  sales_today:        number
  revenue_today:      number
  sales_30d:          number
  revenue_30d:        number
  partner_share_30d:  number
  pulvis_net_30d:     number
}

// ---------------------------------------------------------------------------
// Vue machine_profitability (007 + 008 + 009)
// P&L complet par machine — Phase 1 financement + Phase 2 payée
// ---------------------------------------------------------------------------

export interface MachineProfitability {
  machine_id:                  string
  serial_number:               string
  simulation_mode:             boolean
  location_name:               string | null
  city:                        string | null
  active_days_per_year:        number
  nayax_commission_pct:        number
  nayax_monthly_fee:           number
  // Hardware V1 (009)
  machine_cost:                number   // prix machine seul (1200€)
  amortization_months:         number
  nayax_terminal_cost:         number   // terminal Nayax (415€)
  nayax_activation_cost:       number   // activation (25€)
  machine_installments:        number   // nb mensualités (3)
  machine_installment_amt:     number   // mensualité (400€)
  capex_total:                 number   // CAPEX total V1 (1640€)
  // KPI
  kpi_status:                  KPIStatus
  sprays_today:                number
  avg_sprays_per_day:          number
  sprays_30d:                  number
  // CA
  ca_ttc_30d:                  number
  ca_ht_30d:                   number
  tva_collectee_30d:           number
  ca_ttc_today:                number
  ca_ht_today:                 number
  tva_today:                   number
  // Coûts variables
  cogs_parfum_30d:             number
  nayax_commission_30d:        number
  nayax_fee_30d:               number
  // Marge machine
  machine_margin_30d:          number
  machine_margin_pct:          number
  // Frais opérationnels machine (scalables — ×N machines)
  machine_fixed_30d:           number
  // Frais fixes société (non scalables)
  company_fixed_30d:           number
  // Phase 2 — machine payée (steady state)
  cashflow_net_30d:            number   // CF Phase 2
  cashflow_net_pct:            number
  // Phase 1 — pendant financement (mois 1 à machine_installments)
  mensualite_30d:              number   // = machine_installment_amt
  cashflow_phase1_30d:         number   // CF Phase 2 − mensualité
  cashflow_phase1_pct:         number
  breakeven_phase1_sprays_per_day:  number   // seuil Phase 1
  sprays_per_day_for_installment:   number   // sprays pour couvrir mensualité seule
  // Délais
  delai_autofinancement_mois:  number | null   // délai réel CAPEX → prochaine machine
  delai_prochaine_machine:     number | null   // CAPEX / CF P2 (Phase 2 only)
  // Amortissement + résultat net comptable
  amortissement_30d:           number
  resultat_net_30d:            number
  // Projection
  breakeven_sprays_per_day:    number   // seuil Phase 2
  cashflow_annual_projection:  number
  // Détail par spray
  cost_per_spray_ht:           number
  contribution_per_spray:      number
}

// ---------------------------------------------------------------------------
// Vue company_monthly_overview (007 + 008 + 009)
// Résumé réseau complet pour le CEO
// ---------------------------------------------------------------------------

export interface CompanyOverview {
  machine_count:          number
  sim_count:              number
  ca_ttc_30d:             number
  ca_ht_30d:              number
  tva_collectee_30d:      number
  sprays_30d:             number
  avg_sprays_per_day:     number
  cogs_parfum_30d:        number
  nayax_commission_30d:   number
  nayax_fees_30d:         number
  machine_fixed_30d:      number   // opex machines ×N
  company_fixed_30d:      number
  total_costs_30d:        number
  machine_margin_30d:     number
  machine_margin_pct:     number
  cashflow_net_30d:       number   // CF Phase 2 réseau
  cashflow_net_pct:       number
  mensualites_total_30d:  number   // mensualités totales réseau (009)
  cashflow_phase1_30d:    number   // CF Phase 1 réseau (009)
}

// ---------------------------------------------------------------------------
// RPC get_profitability_scenarios (007 + 008 + 009)
// Tableau comparatif 10/15/20/30/40 sprays/j
// ---------------------------------------------------------------------------

export interface ProfitabilityScenario {
  sprays_per_day:        number
  sprays_30d:            number
  ca_ttc_30d:            number
  ca_ht_30d:             number
  tva_30d:               number
  cogs_parfum_30d:       number
  nayax_commission_30d:  number
  nayax_fee_30d:         number
  machine_margin_30d:    number
  company_fixed_30d:     number   // opex + société fusionnés (1 machine)
  cashflow_net_30d:      number   // CF Phase 2
  cashflow_net_pct:      number
  cashflow_annual_305d:  number
  is_profitable:         boolean
  kpi_status:            KPIStatus
  // Phase 1 (009)
  mensualite_30d:        number
  cashflow_phase1_30d:   number
  cashflow_phase1_pct:   number
}

// ---------------------------------------------------------------------------
// Projection réseau multi-machines (client-side, NetworkProjectionTable)
// ---------------------------------------------------------------------------

export interface NetworkProjection {
  machine_count:              number
  sprays_per_day_total:       number
  sprays_30d_total:           number
  ca_ht_30d:                  number
  cogs_30d:                   number
  nayax_commission_30d:       number
  nayax_fees_30d:             number
  machine_opex_30d:           number
  company_fixed_30d:          number
  total_costs_30d:            number
  // Phase 2 (steady state)
  cashflow_tresorerie_30d:    number
  cashflow_tresorerie_pct:    number
  is_autonomous:              boolean
  // Phase 1 (financement — 009)
  mensualites_total_30d:      number
  cashflow_phase1_30d:        number
  cashflow_phase1_pct:        number
  is_autonomous_phase1:       boolean
  // Délais
  delai_prochaine_machine:    number | null   // CAPEX / CF P2 total → 1 machine suivante
  // Non-cash (info)
  amortissement_30d:          number
  resultat_net_30d:           number
  cashflow_annual_305d:       number
}

// ---------------------------------------------------------------------------
// Frais fixes société (table company_costs)
// ---------------------------------------------------------------------------

export interface CompanyCost {
  id:             string
  name:           string
  category:       string
  monthly_amount: number
  is_per_machine: boolean
  notes:          string | null
  is_active:      boolean
}

// ---------------------------------------------------------------------------
// Top parfum (RPC get_top_perfumes)
// ---------------------------------------------------------------------------

export interface TopPerfume {
  perfume_name: string
  brand:        string
  total_sales:  number
  pct_of_total: number
}

// ---------------------------------------------------------------------------
// Alertes dashboard
// ---------------------------------------------------------------------------

export interface DashboardAlert {
  machine_id:    string
  serial_number: string
  location_name: string
  type:          AlertType
  severity:      AlertSeverity
  message:       string
}

// ---------------------------------------------------------------------------
// Données machine fusionnées (KPI + Profitability pour la table)
// ---------------------------------------------------------------------------

export interface MachineData extends MachineKPI {
  revenue_today:              number
  revenue_30d:                number
  simulation_mode:            boolean
  // CA
  ca_ttc_today:               number
  ca_ht_today:                number
  tva_today:                  number
  ca_ttc_30d:                 number
  ca_ht_30d:                  number
  tva_collectee_30d:          number
  // Coûts (pour PLCard)
  cogs_parfum_30d:            number
  nayax_commission_30d:       number
  nayax_fee_30d:              number
  nayax_commission_pct:       number
  nayax_monthly_fee:          number
  // Marges
  machine_margin_30d:         number
  machine_margin_pct:         number
  machine_fixed_30d:          number
  company_fixed_30d:          number
  // Phase 2 — machine payée
  cashflow_net_30d:           number
  cashflow_net_pct:           number
  // Phase 1 — pendant financement (009)
  mensualite_30d:             number
  cashflow_phase1_30d:        number
  cashflow_phase1_pct:        number
  // Délais
  delai_prochaine_machine:    number | null
  delai_autofinancement_mois: number | null
  // Hardware V1 (009)
  active_days_per_year:       number
  avg_sprays_per_day:         number   // alias de avg_sprays_per_day_30d (MachineKPI)
  machine_cost:               number
  amortization_months:        number
  nayax_terminal_cost:        number
  nayax_activation_cost:      number
  machine_installments:       number
  machine_installment_amt:    number
  capex_total:                number
  breakeven_phase1_sprays_per_day:  number
  sprays_per_day_for_installment:   number
  // Amortissement + résultat net
  amortissement_30d:          number
  resultat_net_30d:           number
  cashflow_annual_projection: number
  cashflow_annual_projection_phase1: number
  breakeven_sprays_per_day:   number
  cost_per_spray_ht:          number
  contribution_per_spray:     number
}
