-- =============================================================================
-- PULVIS — Modèle financier V1 réel · CAPEX machine + Nayax + phases
-- Migration    : 009_v1_hardware.sql
-- Prérequis    : 008_network_projections.sql
-- =============================================================================
--
-- CAPEX V1 réel par machine :
--   Machine BMF          1 200,00 €   (paiement 3 × 400 €/mois)
--   Nayax Onyx terminal    415,00 €   (upfront)
--   Nayax activation        25,00 €   (upfront)
--   ─────────────────────────────────
--   Total CAPEX          1 640,00 €
--   Amortissement 36 mois : 45,56 €/mois (non-cash)
--
-- Frais société réels (mise à jour) :
--   Téléphone Bouygues     7,19 €/mois  ✓ inchangé
--   Revolut Business      10,00 €/mois  ✓ inchangé
--   Noms de domaine       10,00 €/mois  ✓ inchangé
--   Domiciliation         30,00 €/mois  ✓ inchangé (360 €/an)
--   Assurance             25,00 €/mois  ← DÉSACTIVÉ
--   Banque/compta/div.    20,00 €/mois  ← DÉSACTIVÉ
--   ─────────────────────────────────
--   Total société réel    57,19 €/mois  (vs 102,19 € estimé)
--
-- Deux phases d'exploitation :
--   Phase 1 (mois 1–3)  : cashflow après mensualité machine (-400 €/mois)
--   Phase 2 (mois 4+)   : cashflow sans mensualité (machine payée)
--
-- Seuils de rentabilité :
--   Phase 2 : (15 nayax + 47,50 opex + 57,19 société) / (0,7823 × 30) ≈ 5,1 sprays/j
--   Phase 1 : + 400 mensualité → ≈ 22,1 sprays/j
--   Sprays pour couvrir mensualité seule : 400 / (0,7823 × 30) ≈ 17 sprays/j
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Mise à jour frais société réels
--    Désactiver Assurance + Banque/compta (non confirmés terrain)
-- ---------------------------------------------------------------------------

UPDATE company_costs
  SET is_active = FALSE, notes = COALESCE(notes || ' ', '') || '[désactivé 009 — non confirmé V1]'
  WHERE name IN ('Assurance', 'Banque / compta / div.')
    AND is_active = TRUE;

-- Vérification que les 4 frais réels sont présents et actifs
-- (déjà insérés en 007 — on s'assure juste qu'ils sont actifs)
UPDATE company_costs
  SET is_active = TRUE
  WHERE name IN ('Téléphone Bouygues', 'Revolut Business', 'Noms de domaine', 'Domiciliation société')
    AND is_active = FALSE;

-- ---------------------------------------------------------------------------
-- 2. Colonnes hardware V1 sur la table machines
-- ---------------------------------------------------------------------------

ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS nayax_terminal_cost     NUMERIC(8,2)  DEFAULT 415.00,
  ADD COLUMN IF NOT EXISTS nayax_activation_cost   NUMERIC(8,2)  DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS machine_installments    INTEGER        DEFAULT 3,
  ADD COLUMN IF NOT EXISTS machine_installment_amt NUMERIC(8,2)  DEFAULT 400.00;

COMMENT ON COLUMN machines.nayax_terminal_cost     IS 'Coût terminal Nayax (€ · upfront)';
COMMENT ON COLUMN machines.nayax_activation_cost   IS 'Frais activation Nayax (€ · upfront)';
COMMENT ON COLUMN machines.machine_installments    IS 'Nombre de mensualités pour payer la machine';
COMMENT ON COLUMN machines.machine_installment_amt IS 'Montant mensualité machine (€/mois)';

-- ---------------------------------------------------------------------------
-- 3. Mise à jour BMF-001 avec les vrais coûts V1
-- ---------------------------------------------------------------------------

UPDATE machines
  SET
    machine_cost             = 1200.00,   -- budget machine réel
    amortization_months      = 36,
    nayax_terminal_cost      = 415.00,    -- Nayax Onyx
    nayax_activation_cost    = 25.00,     -- frais activation
    machine_installments     = 3,
    machine_installment_amt  = 400.00     -- 3 × 400 € = 1 200 €
  WHERE serial_number = 'BMF-001';

-- ---------------------------------------------------------------------------
-- 4. Vue machine_profitability — reconstruction complète V1
--    Deux phases clairement séparées · amortissement CAPEX total
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW machine_profitability AS
WITH
  fc  AS (SELECT * FROM _financial_constants),
  pmc AS (                                          -- opex machine (scalable)
    SELECT COALESCE(SUM(monthly_amount), 0) AS total
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = TRUE
  ),
  cfc AS (                                          -- frais société (fixe)
    SELECT COALESCE(SUM(monthly_amount), 0) AS total
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = FALSE
  ),
  -- CTE principale : jointures + valeurs intermédiaires pour éviter répétition
  base AS (
    SELECT
      m.id                                                           AS machine_id,
      m.serial_number,
      m.simulation_mode,
      l.name                                                         AS location_name,
      l.city,
      m.active_days_per_year,
      m.nayax_commission_pct,
      m.nayax_monthly_fee,
      m.machine_cost,
      m.amortization_months,
      COALESCE(m.nayax_terminal_cost,     415.00)                    AS nayax_terminal_cost,
      COALESCE(m.nayax_activation_cost,    25.00)                    AS nayax_activation_cost,
      COALESCE(m.machine_installments,         3)                    AS machine_installments,
      COALESCE(m.machine_installment_amt,  400.00)                   AS machine_installment_amt,
      -- CAPEX total (machine + Nayax matériel)
      m.machine_cost
        + COALESCE(m.nayax_terminal_cost,  415.00)
        + COALESCE(m.nayax_activation_cost, 25.00)                   AS capex_total,
      -- KPI
      mk.kpi_status,
      mk.sprays_today,
      mk.avg_sprays_per_day_30d                                      AS avg_sprays_per_day,
      mk.sprays_30d,
      -- Revenue
      mf.revenue_30d,
      mf.revenue_today,
      mf.sales_30d,
      -- Constantes
      fc.vat_rate,
      fc.cost_per_spray_ht,
      fc.contribution_per_spray,
      -- Frais fixes
      pmc.total                                                      AS pmc_total,
      cfc.total                                                      AS cfc_total,
      -- Intermédiaires précalculés
      ROUND(mf.revenue_30d / (1 + fc.vat_rate), 2)                  AS ca_ht_30d,
      ROUND(mf.revenue_30d * fc.vat_rate / (1 + fc.vat_rate), 2)   AS tva_30d,
      ROUND(mf.sales_30d * fc.cost_per_spray_ht, 2)                 AS cogs_30d,
      ROUND(mf.revenue_30d * m.nayax_commission_pct / 100, 2)       AS nayax_comm_30d,
      -- Marge machine HT
      ROUND(
        mf.revenue_30d / (1 + fc.vat_rate)
        - mf.sales_30d * fc.cost_per_spray_ht
        - mf.revenue_30d * m.nayax_commission_pct / 100
        - m.nayax_monthly_fee
      , 2)                                                           AS machine_margin_30d,
      -- Cashflow phase 2 (machine payée)
      ROUND(
        mf.revenue_30d / (1 + fc.vat_rate)
        - mf.sales_30d * fc.cost_per_spray_ht
        - mf.revenue_30d * m.nayax_commission_pct / 100
        - m.nayax_monthly_fee
        - pmc.total
        - cfc.total
      , 2)                                                           AS cf_p2
    FROM machines m
    CROSS JOIN fc, pmc, cfc
    JOIN locations          l  ON l.id  = m.location_id
    JOIN machine_kpis       mk ON mk.machine_id = m.id
    JOIN machine_financials mf ON mf.machine_id = m.id
    WHERE m.status != 'decommissioned'
  )
SELECT
  b.machine_id, b.serial_number, b.simulation_mode,
  b.location_name, b.city, b.active_days_per_year,
  b.nayax_commission_pct, b.nayax_monthly_fee,
  b.machine_cost,        b.amortization_months,
  b.nayax_terminal_cost, b.nayax_activation_cost,
  b.machine_installments,b.machine_installment_amt,
  ROUND(b.capex_total, 2)                              AS capex_total,

  -- ── KPI ──────────────────────────────────────────────────────────────────
  b.kpi_status,
  b.sprays_today,
  b.avg_sprays_per_day,
  b.sprays_30d,

  -- ── CA TTC / HT / TVA ────────────────────────────────────────────────────
  ROUND(b.revenue_30d, 2)                              AS ca_ttc_30d,
  b.ca_ht_30d,
  b.tva_30d                                            AS tva_collectee_30d,
  ROUND(b.revenue_today, 2)                            AS ca_ttc_today,
  ROUND(b.revenue_today / (1 + b.vat_rate), 2)        AS ca_ht_today,
  ROUND(b.revenue_today * b.vat_rate / (1 + b.vat_rate), 2) AS tva_today,

  -- ── Coûts variables ──────────────────────────────────────────────────────
  b.cogs_30d                                           AS cogs_parfum_30d,
  b.nayax_comm_30d                                     AS nayax_commission_30d,
  b.nayax_monthly_fee                                  AS nayax_fee_30d,

  -- ── Marge machine (avant frais fixes) ────────────────────────────────────
  b.machine_margin_30d,
  ROUND(CASE WHEN b.ca_ht_30d = 0 THEN 0
    ELSE b.machine_margin_30d / b.ca_ht_30d * 100 END, 1) AS machine_margin_pct,

  -- ── Frais fixes ──────────────────────────────────────────────────────────
  ROUND(b.pmc_total, 2)                                AS machine_fixed_30d,
  ROUND(b.cfc_total, 2)                                AS company_fixed_30d,

  -- ── PHASE 2 : machine payée (état d'exploitation normale) ────────────────
  b.cf_p2                                              AS cashflow_net_30d,
  ROUND(CASE WHEN b.ca_ht_30d = 0 THEN 0
    ELSE b.cf_p2 / b.ca_ht_30d * 100 END, 1)          AS cashflow_net_pct,

  -- ── PHASE 1 : machine en financement (mois 1–N) ──────────────────────────
  b.machine_installment_amt                            AS mensualite_30d,
  ROUND(b.cf_p2 - b.machine_installment_amt, 2)       AS cashflow_phase1_30d,
  ROUND(CASE WHEN b.ca_ht_30d = 0 THEN 0
    ELSE (b.cf_p2 - b.machine_installment_amt) / b.ca_ht_30d * 100 END, 1) AS cashflow_phase1_pct,

  -- ── Seuils de rentabilité ────────────────────────────────────────────────
  -- Phase 2 : sans mensualité
  ROUND(
    (b.nayax_monthly_fee + b.pmc_total + b.cfc_total)
    / b.contribution_per_spray / 30
  , 1)                                                 AS breakeven_sprays_per_day,
  -- Phase 1 : avec mensualité
  ROUND(
    (b.nayax_monthly_fee + b.pmc_total + b.cfc_total + b.machine_installment_amt)
    / b.contribution_per_spray / 30
  , 1)                                                 AS breakeven_phase1_sprays_per_day,
  -- Sprays/j pour couvrir la mensualité seule
  ROUND(b.machine_installment_amt / b.contribution_per_spray / 30, 1)
                                                       AS sprays_per_day_for_installment,

  -- ── Amortissement CAPEX total (non-cash · comptable) ─────────────────────
  ROUND(b.capex_total / NULLIF(b.amortization_months, 0), 2)
                                                       AS amortissement_30d,

  -- ── Résultat net comptable (phase 2 − amort.) ────────────────────────────
  ROUND(b.cf_p2 - b.capex_total / NULLIF(b.amortization_months, 0), 2)
                                                       AS resultat_net_30d,

  -- ── Délai autofinancement prochaine machine (total phase 1 + 2) ──────────
  -- = si épargne phase1 couvre CAPEX → financement dans phase1
  -- = sinon installments + (CAPEX − épargne_phase1) / cashflow_phase2
  ROUND(
    CASE
      WHEN b.cf_p2 <= 0 THEN NULL
      WHEN (b.cf_p2 - b.machine_installment_amt) * b.machine_installments >= b.capex_total
        THEN b.capex_total / NULLIF(b.cf_p2 - b.machine_installment_amt, 0)
      ELSE
        b.machine_installments::numeric
        + (b.capex_total - (b.cf_p2 - b.machine_installment_amt) * b.machine_installments)
        / b.cf_p2
    END
  , 1)                                                 AS delai_autofinancement_mois,

  -- ── Délai prochaine machine en phase 2 seule (depuis fin remboursement) ──
  ROUND(
    CASE WHEN b.cf_p2 > 0 THEN b.capex_total / b.cf_p2 ELSE NULL END, 1
  )                                                    AS delai_prochaine_machine,

  -- ── Projection annuelle cashflow trésorerie (phase 2 · 305 j/an) ─────────
  ROUND(b.cf_p2 / 30.0 * b.active_days_per_year, 0)   AS cashflow_annual_projection,

  -- ── Coût par spray ───────────────────────────────────────────────────────
  ROUND(b.cost_per_spray_ht, 4)                        AS cost_per_spray_ht,
  ROUND(b.contribution_per_spray, 4)                   AS contribution_per_spray

FROM base b;

COMMENT ON VIEW machine_profitability IS
  'P&L V1 complet par machine : deux phases (financement/payée), CAPEX réel 1640€, amortissement, breakeven, délai autofinancement.';

GRANT SELECT ON machine_profitability TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- 5. Vue company_monthly_overview — mise à jour (héritage automatique des coûts)
--    Ajoute : mensualites_total_30d (total mensualités actives réseau)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW company_monthly_overview AS
WITH
  fc  AS (SELECT * FROM _financial_constants),
  pmc AS (
    SELECT COALESCE(SUM(monthly_amount), 0) AS total
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = TRUE
  ),
  cfc AS (
    SELECT COALESCE(SUM(monthly_amount), 0) AS total
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = FALSE
  ),
  machines_agg AS (
    SELECT
      COUNT(*)                                               AS machine_count,
      COUNT(*) FILTER (WHERE m.simulation_mode)             AS sim_count,
      SUM(mf.revenue_30d)                                   AS ca_ttc,
      SUM(mf.revenue_30d / (1 + fc.vat_rate))               AS ca_ht,
      SUM(mf.revenue_30d * fc.vat_rate / (1 + fc.vat_rate)) AS tva,
      SUM(mf.sales_30d)                                     AS sprays,
      SUM(mf.sales_30d * fc.cost_per_spray_ht)              AS cogs,
      SUM(mf.revenue_30d * m.nayax_commission_pct / 100)    AS nayax_comm,
      SUM(m.nayax_monthly_fee)                              AS nayax_fees,
      SUM(COALESCE(m.machine_installment_amt, 400))         AS mensualites_total
    FROM machine_financials mf
    JOIN machines m ON m.id = mf.machine_id
    CROSS JOIN fc
    WHERE m.status != 'decommissioned'
  )
SELECT
  ma.machine_count, ma.sim_count,
  ROUND(ma.ca_ttc, 2)                                             AS ca_ttc_30d,
  ROUND(ma.ca_ht, 2)                                              AS ca_ht_30d,
  ROUND(ma.tva, 2)                                                AS tva_collectee_30d,
  ma.sprays::integer                                              AS sprays_30d,
  ROUND(ma.sprays::numeric / 30, 1)                               AS avg_sprays_per_day,
  ROUND(ma.cogs, 2)                                               AS cogs_parfum_30d,
  ROUND(ma.nayax_comm, 2)                                         AS nayax_commission_30d,
  ROUND(ma.nayax_fees, 2)                                         AS nayax_fees_30d,
  ROUND(pmc.total * ma.machine_count, 2)                          AS machine_fixed_30d,
  ROUND(cfc.total, 2)                                             AS company_fixed_30d,
  ROUND(ma.cogs + ma.nayax_comm + ma.nayax_fees
        + pmc.total * ma.machine_count + cfc.total, 2)            AS total_costs_30d,
  ROUND(ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees, 2)   AS machine_margin_30d,
  ROUND(CASE WHEN ma.ca_ht = 0 THEN 0 ELSE
    (ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees) / ma.ca_ht * 100
  END, 1)                                                         AS machine_margin_pct,
  -- Phase 2 (machines payées)
  ROUND(ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees
        - pmc.total * ma.machine_count - cfc.total, 2)            AS cashflow_net_30d,
  ROUND(CASE WHEN ma.ca_ht = 0 THEN 0 ELSE
    (ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees
     - pmc.total * ma.machine_count - cfc.total) / ma.ca_ht * 100
  END, 1)                                                         AS cashflow_net_pct,
  -- Phase 1 (machines en financement)
  ROUND(ma.mensualites_total, 2)                                  AS mensualites_total_30d,
  ROUND(ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees
        - pmc.total * ma.machine_count - cfc.total
        - ma.mensualites_total, 2)                                AS cashflow_phase1_30d

FROM machines_agg ma, pmc, cfc;

COMMENT ON VIEW company_monthly_overview IS
  'Vision CEO réseau : CA TTC/HT, TVA, tous frais V1, cashflow phase 1 (financement) + phase 2 (payée).';

GRANT SELECT ON company_monthly_overview TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- 6. Fonction get_profitability_scenarios — V1 avec deux phases
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_profitability_scenarios(
  p_mensualite_pm  NUMERIC  DEFAULT 400.00   -- mensualité machine V1
)
RETURNS TABLE (
  sprays_per_day                  INTEGER,
  sprays_30d                      INTEGER,
  ca_ttc_30d                      NUMERIC,
  ca_ht_30d                       NUMERIC,
  tva_30d                         NUMERIC,
  cogs_parfum_30d                 NUMERIC,
  nayax_commission_30d            NUMERIC,
  nayax_fee_30d                   NUMERIC,
  machine_margin_30d              NUMERIC,
  company_fixed_30d               NUMERIC,   -- opex machine + société pour 1 machine
  -- Phase 2 : machine payée
  cashflow_net_30d                NUMERIC,
  cashflow_net_pct                NUMERIC,
  -- Phase 1 : machine en financement
  mensualite_30d                  NUMERIC,
  cashflow_phase1_30d             NUMERIC,
  cashflow_phase1_pct             NUMERIC,
  -- Projections + statuts
  cashflow_annual_305d            NUMERIC,
  is_profitable                   BOOLEAN,
  kpi_status                      TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH
    fc  AS (SELECT * FROM _financial_constants),
    pmc AS (SELECT COALESCE(SUM(monthly_amount), 0) AS total
            FROM company_costs WHERE is_active = TRUE AND is_per_machine = TRUE),
    cfc AS (SELECT COALESCE(SUM(monthly_amount), 0) AS total
            FROM company_costs WHERE is_active = TRUE AND is_per_machine = FALSE),
    scenarios AS (SELECT unnest(ARRAY[10, 15, 20, 30, 40]) AS spd)
  SELECT
    s.spd,
    (s.spd * 30),
    ROUND(s.spd * 30 * fc.price_ttc,                          2),   -- CA TTC
    ROUND(s.spd * 30 * fc.price_ht,                           2),   -- CA HT
    ROUND(s.spd * 30 * fc.vat_per_spray,                      2),   -- TVA
    ROUND(s.spd * 30 * fc.cost_per_spray_ht,                  2),   -- COGS
    ROUND(s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100,2),   -- Nayax comm
    ROUND(fc.nayax_monthly_fee,                               2),   -- Nayax fee
    -- Marge machine HT
    ROUND(
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee
    , 2),
    -- Frais fixes totaux (opex machine + société) pour 1 machine
    ROUND(pmc.total + cfc.total, 2),
    -- Phase 2 : cashflow trésorerie (machine payée)
    ROUND(
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total
    , 2),
    -- Phase 2 %
    ROUND(CASE WHEN s.spd = 0 THEN 0 ELSE (
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total
    ) / (s.spd * 30 * fc.price_ht) * 100 END, 1),
    -- Phase 1 : mensualité
    ROUND(p_mensualite_pm, 2),
    -- Phase 1 : cashflow trésorerie (avec mensualité)
    ROUND(
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total
      - p_mensualite_pm
    , 2),
    -- Phase 1 %
    ROUND(CASE WHEN s.spd = 0 THEN 0 ELSE (
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total
      - p_mensualite_pm
    ) / (s.spd * 30 * fc.price_ht) * 100 END, 1),
    -- Projection annuelle phase 2 (305 j)
    ROUND((
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total
    ) / 30 * 305, 0),
    -- Rentable phase 2 ?
    (s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total) > 0,
    CASE
      WHEN s.spd >= 40 THEN 'SCALE'
      WHEN s.spd >= 30 THEN 'GO'
      WHEN s.spd >= 20 THEN 'BON'
      WHEN s.spd >= 10 THEN 'SURVEILLER'
      ELSE 'CORRIGER'
    END
  FROM scenarios s, fc, pmc, cfc
  ORDER BY s.spd;
$$;

COMMENT ON FUNCTION get_profitability_scenarios IS
  'Tableau comparatif V1 10/15/20/30/40 sprays/j · deux phases (financement/payée) · coûts réels V1.';

GRANT EXECUTE ON FUNCTION get_profitability_scenarios TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- 7. Fonction get_network_projections — V1 avec phases
--    Paramètres mis à jour : CAPEX 1640 €, mensualité 400 €
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_network_projections(
  p_avg_sprays_per_day  NUMERIC  DEFAULT 20,
  p_capex_pm            NUMERIC  DEFAULT 1640,   -- CAPEX réel V1 par machine
  p_amort_months        INTEGER  DEFAULT 36,
  p_mensualite_pm       NUMERIC  DEFAULT 400,    -- mensualité machine V1
  p_installments        INTEGER  DEFAULT 3,
  p_autonomy_target     NUMERIC  DEFAULT 2000    -- seuil autonomie €/mois P2
)
RETURNS TABLE (
  machine_count              INTEGER,
  sprays_per_day_total       NUMERIC,
  sprays_30d_total           BIGINT,
  ca_ht_30d                  NUMERIC,
  cogs_30d                   NUMERIC,
  nayax_total_30d            NUMERIC,
  machine_opex_30d           NUMERIC,
  company_fixed_30d          NUMERIC,
  total_costs_30d            NUMERIC,
  -- Phase 2 : machines payées
  cashflow_p2_30d            NUMERIC,
  cashflow_p2_pct            NUMERIC,
  -- Phase 1 : machines en financement
  mensualites_total_30d      NUMERIC,
  cashflow_p1_30d            NUMERIC,
  cashflow_p1_pct            NUMERIC,
  -- Amortissement + résultat net
  amortissement_30d          NUMERIC,
  resultat_net_30d           NUMERIC,
  -- Projections
  cashflow_p2_annual         NUMERIC,
  -- Capacité de réinvestissement
  capacite_reinvest_p2       NUMERIC,
  delai_autofin_mois         NUMERIC,    -- depuis mise en service (phases 1+2)
  delai_machine_suiv_p2      NUMERIC,    -- depuis fin financement (P2 seule)
  is_autonomous_p2           BOOLEAN,
  is_autonomous_p1           BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_pmc         NUMERIC;
  v_cfc         NUMERIC;
  v_price_ht    CONSTANT NUMERIC := 1.0 / 1.20;
  v_cogs        CONSTANT NUMERIC := 0.031;
  v_nayax_pct   CONSTANT NUMERIC := 0.02;
  v_nayax_fee   CONSTANT NUMERIC := 15.0;
  v_n           INTEGER;
  v_sp30        BIGINT;
  v_ca_ht       NUMERIC;
  v_var_costs   NUMERIC;
  v_nayax_tot   NUMERIC;
  v_opex        NUMERIC;
  v_cf_p2       NUMERIC;
  v_cf_p1       NUMERIC;
  v_mensual_tot NUMERIC;
  v_amort       NUMERIC;
BEGIN
  SELECT COALESCE(SUM(monthly_amount), 0) INTO v_pmc
    FROM company_costs WHERE is_active AND is_per_machine;
  SELECT COALESCE(SUM(monthly_amount), 0) INTO v_cfc
    FROM company_costs WHERE is_active AND NOT is_per_machine;

  FOREACH v_n IN ARRAY ARRAY[1, 3, 5, 10] LOOP
    v_sp30        := (v_n * p_avg_sprays_per_day * 30)::BIGINT;
    v_ca_ht       := v_sp30 * v_price_ht;
    v_var_costs   := v_sp30 * v_cogs + v_sp30 * v_nayax_pct;
    v_nayax_tot   := v_sp30 * v_nayax_pct + v_n * v_nayax_fee;
    v_opex        := v_n * v_pmc;
    v_cf_p2       := v_ca_ht - v_sp30 * v_cogs - v_nayax_tot - v_opex - v_cfc;
    v_mensual_tot := v_n * p_mensualite_pm;
    v_cf_p1       := v_cf_p2 - v_mensual_tot;
    v_amort       := v_n * CASE WHEN p_amort_months > 0 THEN p_capex_pm / p_amort_months ELSE 0 END;

    machine_count          := v_n;
    sprays_per_day_total   := v_n * p_avg_sprays_per_day;
    sprays_30d_total       := v_sp30;
    ca_ht_30d              := ROUND(v_ca_ht, 2);
    cogs_30d               := ROUND(v_sp30 * v_cogs, 2);
    nayax_total_30d        := ROUND(v_nayax_tot, 2);
    machine_opex_30d       := ROUND(v_opex, 2);
    company_fixed_30d      := ROUND(v_cfc, 2);
    total_costs_30d        := ROUND(v_sp30 * v_cogs + v_nayax_tot + v_opex + v_cfc, 2);
    cashflow_p2_30d        := ROUND(v_cf_p2, 2);
    cashflow_p2_pct        := ROUND(CASE WHEN v_ca_ht > 0 THEN v_cf_p2 / v_ca_ht * 100 ELSE 0 END, 1);
    mensualites_total_30d  := ROUND(v_mensual_tot, 2);
    cashflow_p1_30d        := ROUND(v_cf_p1, 2);
    cashflow_p1_pct        := ROUND(CASE WHEN v_ca_ht > 0 THEN v_cf_p1 / v_ca_ht * 100 ELSE 0 END, 1);
    amortissement_30d      := ROUND(v_amort, 2);
    resultat_net_30d       := ROUND(v_cf_p2 - v_amort, 2);
    cashflow_p2_annual     := ROUND(v_cf_p2 / 30.0 * 305, 0);
    capacite_reinvest_p2   := ROUND(GREATEST(v_cf_p2, 0), 2);
    -- Délai autofin : depuis mise en service (phases 1+2)
    delai_autofin_mois     :=
      CASE WHEN v_cf_p2 <= 0 THEN NULL
      WHEN v_cf_p1 * p_installments >= p_capex_pm THEN
        ROUND(p_capex_pm / NULLIF(v_cf_p1, 0), 1)
      ELSE
        ROUND(p_installments::numeric
          + (p_capex_pm - v_cf_p1 * p_installments) / NULLIF(v_cf_p2, 0), 1)
      END;
    -- Délai depuis fin financement (phase 2 seule)
    delai_machine_suiv_p2  :=
      CASE WHEN v_cf_p2 > 0 THEN ROUND(p_capex_pm / v_cf_p2, 1) ELSE NULL END;
    is_autonomous_p2       := v_cf_p2 >= p_autonomy_target;
    is_autonomous_p1       := v_cf_p1 >= p_autonomy_target;
    RETURN NEXT;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION get_network_projections IS
  'Projections réseau V1 pour 1/3/5/10 machines · CAPEX 1640€ · deux phases · délai autofinancement.';

GRANT EXECUTE ON FUNCTION get_network_projections TO authenticated, anon;


-- ===========================================================================
-- VÉRIFICATION — décommenter après exécution
-- ===========================================================================
/*

-- 1. Frais société actifs après mise à jour
SELECT name, monthly_amount, is_active, is_per_machine
FROM company_costs ORDER BY is_active DESC, is_per_machine, monthly_amount DESC;
-- Attendu actifs : Téléphone 7,19 + Revolut 10 + Domaines 10 + Domiciliation 30 = 57,19 €
-- + opex machine : Déplacement 20 + Matériel 12,50 + SAV 15 = 47,50 €
-- Désactivés : Assurance 25 + Banque/compta 20

-- 2. BMF-001 V1 — P&L avec deux phases (≈801 sprays, 26.7/j)
SELECT
  serial_number, sprays_30d, kpi_status,
  ca_ttc_30d, ca_ht_30d, tva_collectee_30d,
  cogs_parfum_30d, nayax_commission_30d, nayax_fee_30d,
  machine_margin_30d, machine_margin_pct,
  machine_fixed_30d,    -- 47,50 € (opex machine)
  company_fixed_30d,    -- 57,19 € (frais société réels)
  cashflow_net_30d,     -- ≈ 506,96 € (phase 2)
  cashflow_net_pct,     -- ≈ 76,0 %
  mensualite_30d,       -- 400,00 €
  cashflow_phase1_30d,  -- ≈ 106,96 € (phase 1)
  cashflow_phase1_pct,  -- ≈ 16,0 %
  breakeven_sprays_per_day,        -- ≈ 5,1 sprays/j (phase 2)
  breakeven_phase1_sprays_per_day, -- ≈ 22,1 sprays/j (phase 1)
  sprays_per_day_for_installment,  -- ≈ 17,0 sprays/j
  amortissement_30d,     -- 45,56 € (CAPEX 1640 / 36)
  resultat_net_30d,      -- ≈ 461,40 €
  delai_autofinancement_mois, -- ≈ 5,6 mois (phase1+2)
  delai_prochaine_machine,    -- ≈ 3,2 mois (phase2 seule)
  cashflow_annual_projection  -- ≈ 5153 €
FROM machine_profitability WHERE serial_number = 'BMF-001';

-- 3. Scénarios V1 mis à jour
SELECT sprays_per_day, kpi_status,
  ca_ht_30d, company_fixed_30d,
  cashflow_net_30d AS cf_p2, cashflow_net_pct AS pct_p2,
  mensualite_30d, cashflow_phase1_30d AS cf_p1, cashflow_phase1_pct AS pct_p1,
  is_profitable, cashflow_annual_305d
FROM get_profitability_scenarios();
-- Attendu (cfc=57,19 · pmc=47,50 · total_fixe=119,69 €) :
--  spd   CA_HT  fixed    CF_P2   %P2    mensual  CF_P1    %P1    annual  renta
--  10/j   250€  119,69€  115,01€ 46,0%   400€  -284,99€ -114%    1169€  TRUE
--  15/j   375€  119,69€  232,36€ 62,0%   400€  -167,64€  -44,7%  2362€  TRUE
--  20/j   500€  119,69€  349,71€ 69,9%   400€   -50,29€  -10,1%  3553€  TRUE
--  30/j   750€  119,69€  584,41€ 77,9%   400€   184,41€   24,6%  5940€  TRUE
--  40/j  1000€  119,69€  819,11€ 81,9%   400€   419,11€   41,9%  8327€  TRUE

-- 4. Projections réseau (27 sprays/j moyen)
SELECT machine_count, sprays_per_day_total,
  ca_ht_30d, total_costs_30d,
  cashflow_p2_30d, cashflow_p2_pct,
  mensualites_total_30d, cashflow_p1_30d, cashflow_p1_pct,
  amortissement_30d, resultat_net_30d,
  cashflow_p2_annual, delai_autofin_mois, delai_machine_suiv_p2,
  is_autonomous_p2, is_autonomous_p1
FROM get_network_projections(27);
-- Attendu :
--  N   spd    CA_HT   Coûts   CF_P2   %P2   Mensual  CF_P1   %P1   Amort  RésNet  Annual  Autofin Délai_P2 Auto_P2 Auto_P1
--  1   27/j    675€   168€     507€  75,1%    400€    107€  15,9%   45,6€   461€   5153€   5,6m   3,2m    NON     NON
--  3   81/j   2025€   504€    1521€  75,1%   1200€    321€  15,9%  136,7€  1384€  15462€   5,6m   1,1m    NON     NON
--  5  135/j   3375€   840€    2535€  75,1%   2000€    535€  15,9%  227,8€  2307€  25771€   5,6m   0,6m    OUI     NON
-- 10  270/j   6750€  1680€    5070€  75,1%   4000€   1070€  15,9%  455,6€  4614€  51541€   5,6m   0,3m    OUI     NON

*/

COMMIT;
