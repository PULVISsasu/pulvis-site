-- =============================================================================
-- PULVIS — Modèle financier complet avec frais société réels
-- Migration    : 007_financial_views.sql
-- Prérequis    : 001_init.sql · 005_bmf001_setup.sql
-- =============================================================================
-- Modèle économique par spray (prix TTC = 1,00 €) :
--
--   CA TTC             1,0000 €
--   (−) TVA 20%        0,1667 €  → reversée à l'État
--   ────────────────────────────
--   CA HT              0,8333 €  ← base de calcul de la marge
--   (−) Parfum         0,0310 €  (15,50€ / 500 sprays)
--   (−) Nayax 2% TTC   0,0200 €  (commission sur CA TTC)
--   ────────────────────────────
--   Contribution/spray 0,7823 €
--
-- Frais fixes mensuels société :
--   Nayax abonnement   15,00 €
--   Téléphone          7,19 €
--   Revolut Business  10,00 €
--   Noms de domaine   10,00 €
--   Domiciliation     30,00 €
--   Assurance         25,00 €
--   Banque/compta     20,00 €
--   ────────────────────────────
--   Total fixe/mois  117,19 €
--
-- Seuil de rentabilité : 117,19 / 0,7823 = 149,8 sprays ≈ 5 sprays/jour
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- TABLE : company_costs
-- Frais fixes mensuels réels de la société Pulvis
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS company_costs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  category       TEXT        NOT NULL CHECK (category IN (
                   'telecom', 'banking', 'insurance', 'domiciliation',
                   'marketing', 'software', 'legal', 'other'
                 )),
  monthly_amount NUMERIC(8,2) NOT NULL CHECK (monthly_amount >= 0),
  is_per_machine BOOLEAN     NOT NULL DEFAULT FALSE,  -- TRUE = coût × nb machines
  notes          TEXT,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  company_costs IS 'Frais fixes mensuels réels de la société Pulvis.';
COMMENT ON COLUMN company_costs.is_per_machine IS 'TRUE = ce coût se multiplie avec le nombre de machines.';

ALTER TABLE company_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_company_costs"  ON company_costs FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "auth_write_company_costs" ON company_costs FOR ALL    TO authenticated USING (TRUE);

-- Seed frais réels
INSERT INTO company_costs (name, category, monthly_amount, is_per_machine, notes) VALUES
  ('Téléphone Bouygues',    'telecom',       7.19,  FALSE, 'Forfait téléphonique professionnel'),
  ('Revolut Business',      'banking',      10.00,  FALSE, 'Compte bancaire professionnel'),
  ('Noms de domaine',       'software',     10.00,  FALSE, 'pulvis.fr + domaines annexes (estimation)'),
  ('Domiciliation société', 'domiciliation',30.00,  FALSE, '360€/an ÷ 12 = 30€/mois'),
  ('Assurance',             'insurance',    25.00,  FALSE, 'Assurance professionnelle estimée'),
  ('Banque / compta / div.','other',        20.00,  FALSE, 'Frais bancaires, compta, divers')
ON CONFLICT DO NOTHING;


-- ---------------------------------------------------------------------------
-- CONSTANTES FINANCIÈRES (utilisées dans les vues et fonctions)
-- prix_ttc = 1,00 € · tva_rate = 0,20 · cost_per_spray HT = 0,031 €
-- ---------------------------------------------------------------------------

-- Vue helper : constantes du modèle (évite de dupliquer les valeurs)
CREATE OR REPLACE VIEW _financial_constants AS
SELECT
  1.00::numeric                                   AS price_ttc,
  0.20::numeric                                   AS vat_rate,
  (1.00 / 1.20)::numeric                          AS price_ht,           -- 0.8333
  (1.00 - 1.00 / 1.20)::numeric                   AS vat_per_spray,      -- 0.1667
  (15.50 / 500.0)::numeric                        AS cost_per_spray_ht,  -- 0.0310
  2.00::numeric                                   AS nayax_comm_pct,
  15.00::numeric                                  AS nayax_monthly_fee,
  (1.00 / 1.20 - 15.50/500.0 - 1.00 * 0.02)::numeric AS contribution_per_spray; -- 0.7823

GRANT SELECT ON _financial_constants TO authenticated, anon;


-- ===========================================================================
-- VUE : machine_profitability
-- P&L complet par machine sur les 30 derniers jours
-- ===========================================================================

CREATE OR REPLACE VIEW machine_profitability AS
WITH
  fc AS (SELECT * FROM _financial_constants),
  co AS (SELECT COALESCE(SUM(monthly_amount), 0) AS total FROM company_costs WHERE is_active = TRUE)
SELECT
  m.id                                            AS machine_id,
  m.serial_number,
  m.simulation_mode,
  l.name                                          AS location_name,
  l.city,
  m.active_days_per_year,
  m.nayax_commission_pct,
  m.nayax_monthly_fee,

  -- ── KPI ──────────────────────────────────────────────────────────────────
  mk.kpi_status,
  mk.sprays_today,
  mk.avg_sprays_per_day_30d                       AS avg_sprays_per_day,
  mk.sprays_30d,

  -- ── CA TTC / HT / TVA ────────────────────────────────────────────────────
  ROUND(mf.revenue_30d, 2)                        AS ca_ttc_30d,
  ROUND(mf.revenue_30d / (1 + fc.vat_rate), 2)   AS ca_ht_30d,
  ROUND(mf.revenue_30d * fc.vat_rate
        / (1 + fc.vat_rate), 2)                   AS tva_collectee_30d,
  ROUND(mf.revenue_today, 2)                      AS ca_ttc_today,
  ROUND(mf.revenue_today / (1 + fc.vat_rate), 2) AS ca_ht_today,
  ROUND(mf.revenue_today * fc.vat_rate
        / (1 + fc.vat_rate), 2)                   AS tva_today,

  -- ── Coûts variables ──────────────────────────────────────────────────────
  ROUND(mf.sales_30d * fc.cost_per_spray_ht, 2)  AS cogs_parfum_30d,
  ROUND(mf.revenue_30d
        * m.nayax_commission_pct / 100, 2)        AS nayax_commission_30d,
  m.nayax_monthly_fee                             AS nayax_fee_30d,

  -- ── Marge machine HT (avant frais société) ───────────────────────────────
  ROUND(
    mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
  , 2)                                            AS machine_margin_30d,

  ROUND(CASE WHEN mf.revenue_30d = 0 THEN 0 ELSE (
    mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
  ) / (mf.revenue_30d / (1 + fc.vat_rate)) * 100 END, 1) AS machine_margin_pct,

  -- ── Frais fixes société ──────────────────────────────────────────────────
  ROUND(co.total, 2)                              AS company_fixed_30d,

  -- ── Cashflow net société ─────────────────────────────────────────────────
  ROUND(
    mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
    - co.total
  , 2)                                            AS cashflow_net_30d,

  ROUND(CASE WHEN mf.revenue_30d = 0 THEN 0 ELSE (
    mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
    - co.total
  ) / (mf.revenue_30d / (1 + fc.vat_rate)) * 100 END, 1) AS cashflow_net_pct,

  -- ── Seuil de rentabilité ─────────────────────────────────────────────────
  -- = (frais fixes totaux) / (contribution margin par spray) / 30
  ROUND(
    (m.nayax_monthly_fee + co.total) / fc.contribution_per_spray / 30
  , 1)                                            AS breakeven_sprays_per_day,

  -- ── Projections ──────────────────────────────────────────────────────────
  ROUND(
    (mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
    - co.total) / 30 * m.active_days_per_year
  , 0)                                            AS cashflow_annual_projection,

  -- ── Coût par spray (pour transparence) ───────────────────────────────────
  ROUND(fc.cost_per_spray_ht, 4)                  AS cost_per_spray_ht,
  ROUND(fc.contribution_per_spray, 4)             AS contribution_per_spray

FROM machines m
CROSS JOIN fc
CROSS JOIN co
JOIN locations       l  ON l.id  = m.location_id
JOIN machine_kpis    mk ON mk.machine_id = m.id
JOIN machine_financials mf ON mf.machine_id = m.id
WHERE m.status != 'decommissioned';

COMMENT ON VIEW machine_profitability IS
  'P&L complet par machine : CA TTC/HT, TVA, COGS, Nayax, frais société, cashflow net, breakeven, projections.';

GRANT SELECT ON machine_profitability TO authenticated, anon;


-- ===========================================================================
-- VUE : company_monthly_overview
-- Agrégats réseau complet — vision CEO tous frais inclus
-- ===========================================================================

CREATE OR REPLACE VIEW company_monthly_overview AS
WITH
  fc AS (SELECT * FROM _financial_constants),
  co AS (SELECT COALESCE(SUM(monthly_amount), 0) AS total FROM company_costs WHERE is_active = TRUE),
  machines_agg AS (
    SELECT
      COUNT(*)                                              AS machine_count,
      COUNT(*) FILTER (WHERE m.simulation_mode)            AS sim_count,
      SUM(mf.revenue_30d)                                  AS ca_ttc,
      SUM(mf.revenue_30d / (1 + fc.vat_rate))              AS ca_ht,
      SUM(mf.revenue_30d * fc.vat_rate / (1 + fc.vat_rate)) AS tva,
      SUM(mf.sales_30d)                                    AS sprays,
      SUM(mf.sales_30d * fc.cost_per_spray_ht)             AS cogs,
      SUM(mf.revenue_30d * m.nayax_commission_pct / 100)   AS nayax_comm,
      SUM(m.nayax_monthly_fee)                             AS nayax_fees
    FROM machine_financials mf
    JOIN machines m ON m.id = mf.machine_id
    CROSS JOIN fc
    WHERE m.status != 'decommissioned'
  )
SELECT
  ma.machine_count,
  ma.sim_count,

  -- CA
  ROUND(ma.ca_ttc, 2)                                           AS ca_ttc_30d,
  ROUND(ma.ca_ht, 2)                                            AS ca_ht_30d,
  ROUND(ma.tva, 2)                                              AS tva_collectee_30d,
  ma.sprays::integer                                            AS sprays_30d,
  ROUND(ma.sprays::numeric / 30, 1)                             AS avg_sprays_per_day,

  -- Coûts
  ROUND(ma.cogs, 2)                                             AS cogs_parfum_30d,
  ROUND(ma.nayax_comm, 2)                                       AS nayax_commission_30d,
  ROUND(ma.nayax_fees, 2)                                       AS nayax_fees_30d,
  ROUND(co.total, 2)                                            AS company_fixed_30d,
  ROUND(ma.cogs + ma.nayax_comm + ma.nayax_fees + co.total, 2) AS total_costs_30d,

  -- Marge machine (avant frais société)
  ROUND(ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees, 2) AS machine_margin_30d,
  ROUND(CASE WHEN ma.ca_ht = 0 THEN 0 ELSE
    (ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees) / ma.ca_ht * 100
  END, 1)                                                       AS machine_margin_pct,

  -- Cashflow net société
  ROUND(ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees - co.total, 2) AS cashflow_net_30d,
  ROUND(CASE WHEN ma.ca_ht = 0 THEN 0 ELSE
    (ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees - co.total) / ma.ca_ht * 100
  END, 1)                                                       AS cashflow_net_pct

FROM machines_agg ma, co;

COMMENT ON VIEW company_monthly_overview IS
  'Vision CEO réseau complet : CA TTC/HT, TVA, tous frais, marges, cashflow net.';

GRANT SELECT ON company_monthly_overview TO authenticated, anon;


-- ===========================================================================
-- FONCTION RPC : get_profitability_scenarios
-- Tableau comparatif : 10 / 15 / 20 / 30 / 40 sprays/jour
-- Tous frais inclus — base décision terrain
-- ===========================================================================

CREATE OR REPLACE FUNCTION get_profitability_scenarios()
RETURNS TABLE (
  sprays_per_day        INTEGER,
  sprays_30d            INTEGER,
  ca_ttc_30d            NUMERIC,
  ca_ht_30d             NUMERIC,
  tva_30d               NUMERIC,
  cogs_parfum_30d       NUMERIC,
  nayax_commission_30d  NUMERIC,
  nayax_fee_30d         NUMERIC,
  machine_margin_30d    NUMERIC,
  company_fixed_30d     NUMERIC,
  cashflow_net_30d      NUMERIC,
  cashflow_net_pct      NUMERIC,
  cashflow_annual_305d  NUMERIC,
  is_profitable         BOOLEAN,
  kpi_status            TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH
    fc AS (SELECT * FROM _financial_constants),
    co AS (SELECT COALESCE(SUM(monthly_amount), 0) AS total FROM company_costs WHERE is_active = TRUE),
    scenarios AS (SELECT unnest(ARRAY[10,15,20,30,40]) AS spd)
  SELECT
    s.spd                                                                 AS sprays_per_day,
    (s.spd * 30)                                                          AS sprays_30d,
    ROUND(s.spd * 30 * fc.price_ttc,                               2)    AS ca_ttc_30d,
    ROUND(s.spd * 30 * fc.price_ht,                                2)    AS ca_ht_30d,
    ROUND(s.spd * 30 * fc.vat_per_spray,                           2)    AS tva_30d,
    ROUND(s.spd * 30 * fc.cost_per_spray_ht,                       2)    AS cogs_parfum_30d,
    ROUND(s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100,     2)    AS nayax_commission_30d,
    ROUND(fc.nayax_monthly_fee,                                    2)    AS nayax_fee_30d,
    -- Marge machine HT
    ROUND(
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee
    ,                                                              2)    AS machine_margin_30d,
    ROUND(co.total,                                                2)    AS company_fixed_30d,
    -- Cashflow net société
    ROUND(
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee
      - co.total
    ,                                                              2)    AS cashflow_net_30d,
    -- Cashflow %
    ROUND(CASE WHEN s.spd = 0 THEN 0 ELSE (
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - co.total
    ) / (s.spd * 30 * fc.price_ht) * 100 END,                     1)   AS cashflow_net_pct,
    -- Projection annuelle (305 j actifs)
    ROUND((
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - co.total
    ) / 30 * 305,                                                  0)   AS cashflow_annual_305d,
    -- Rentable ?
    (s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - co.total) > 0                             AS is_profitable,
    -- KPI Pulvis
    CASE
      WHEN s.spd >= 40 THEN 'SCALE'
      WHEN s.spd >= 30 THEN 'GO'
      WHEN s.spd >= 20 THEN 'BON'
      WHEN s.spd >= 10 THEN 'SURVEILLER'
      ELSE 'CORRIGER'
    END                                                                  AS kpi_status
  FROM scenarios s, fc, co
  ORDER BY s.spd;
$$;

COMMENT ON FUNCTION get_profitability_scenarios IS
  'Tableau comparatif 10/15/20/30/40 sprays/j — tous frais inclus (TVA, COGS, Nayax, société). Base décision terrain.';

GRANT EXECUTE ON FUNCTION get_profitability_scenarios TO authenticated, anon;


-- ===========================================================================
-- VÉRIFICATION — décommenter après exécution
-- ===========================================================================
/*

-- 1. Frais fixes société actifs
SELECT name, category, monthly_amount
FROM company_costs WHERE is_active = TRUE
ORDER BY monthly_amount DESC;
-- Attendu : 6 lignes · total = 102,19 €

-- 2. Constantes financières
SELECT * FROM _financial_constants;
-- Attendu : price_ht=0.8333, cost_per_spray=0.031, contribution=0.7823

-- 3. P&L machine BMF-001
SELECT
  serial_number, simulation_mode,
  sprays_30d, kpi_status,
  ca_ttc_30d, ca_ht_30d, tva_collectee_30d,
  cogs_parfum_30d, nayax_commission_30d, nayax_fee_30d,
  machine_margin_30d, machine_margin_pct,
  company_fixed_30d,
  cashflow_net_30d, cashflow_net_pct,
  breakeven_sprays_per_day,
  cashflow_annual_projection
FROM machine_profitability
WHERE serial_number = 'BMF-001';
-- Attendu (≈800 sprays, 26.7/j) :
--   ca_ttc=800€ · ca_ht=666,67€ · tva=133,33€
--   cogs=24,80€ · nayax_comm=16,00€ · nayax_fee=15,00€
--   machine_margin=610,87€ (91,6%)
--   company_fixed=102,19€
--   cashflow_net=508,68€ (76,3%)
--   breakeven≈5,0 sprays/j
--   projection_annuelle≈5172€

-- 4. Vue société
SELECT * FROM company_monthly_overview;

-- 5. Tableau comparatif
SELECT
  sprays_per_day,
  kpi_status,
  ca_ttc_30d   || ' €' AS ca_ttc,
  ca_ht_30d    || ' €' AS ca_ht,
  tva_30d      || ' €' AS tva,
  cashflow_net_30d || ' €' AS cashflow,
  cashflow_net_pct || '%'  AS pct,
  cashflow_annual_305d || ' €' AS annuel,
  CASE WHEN is_profitable THEN '✓' ELSE '✗' END AS rentable
FROM get_profitability_scenarios();
-- Attendu :
--  10/j SURVEILLER  300€  250€  50€   117,51€  47,0%  1196€  ✓
--  15/j SURVEILLER  450€  375€  75€   234,86€  62,6%  2388€  ✓
--  20/j BON         600€  500€ 100€   352,21€  70,4%  3580€  ✓
--  30/j GO          900€  750€ 150€   586,91€  78,3%  5966€  ✓
--  40/j SCALE      1200€ 1000€ 200€   821,61€  82,2%  8353€  ✓

*/

COMMIT;
