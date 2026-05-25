-- =============================================================================
-- PULVIS — Coûts opérationnels par machine + amortissement + projections réseau
-- Migration    : 008_network_projections.sql
-- Prérequis    : 007_financial_views.sql
-- =============================================================================
-- Nouveaux coûts par machine (is_per_machine = TRUE) :
--
--   Déplacement maintenance   20,00 €/machine/mois  (~1 dépl.)
--   Remplacement matériel     12,50 €/machine/mois  (150€/an)
--   Réserve SAV               15,00 €/machine/mois
--   ──────────────────────────────────────────────
--   Total opex machine        47,50 €/machine/mois
--
-- Amortissement machine (non-cash) :
--   1 500 € / 36 mois = 41,67 €/machine/mois
--
-- Nouveau seuil de rentabilité cashflow :
--   (15 nayax + 47,50 opex + 102,19 société) / (0,7823 × 30) ≈ 7 sprays/j
--
-- Projections réseau 1 / 3 / 5 / 10 machines (fonction get_network_projections)
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Mise à jour de la contrainte de catégorie (ajout 'operations', 'hardware')
-- ---------------------------------------------------------------------------

ALTER TABLE company_costs DROP CONSTRAINT IF EXISTS company_costs_category_check;
ALTER TABLE company_costs
  ADD CONSTRAINT company_costs_category_check
  CHECK (category IN (
    'telecom', 'banking', 'insurance', 'domiciliation',
    'marketing', 'software', 'legal', 'operations', 'hardware', 'other'
  ));

-- ---------------------------------------------------------------------------
-- 2. Insertion des coûts opérationnels par machine
-- ---------------------------------------------------------------------------

INSERT INTO company_costs (name, category, monthly_amount, is_per_machine, notes)
SELECT v.name, v.category, v.monthly_amount::NUMERIC, v.is_per_machine, v.notes
FROM (VALUES
  ('Déplacement maintenance', 'operations', '20.00', TRUE,
   '~1 déplacement/mois par machine · carburant, stationnement, temps'),
  ('Remplacement matériel',   'hardware',   '12.50', TRUE,
   '150 €/an · pièces de rechange, câbles, consommables, écran'),
  ('Réserve SAV',             'operations', '15.00', TRUE,
   'Panne imprévue, intervention technique, main-d''œuvre externe')
) AS v(name, category, monthly_amount, is_per_machine, notes)
WHERE NOT EXISTS (
  SELECT 1 FROM company_costs cc WHERE cc.name = v.name
);

-- ---------------------------------------------------------------------------
-- 3. Champs amortissement sur la table machines
-- ---------------------------------------------------------------------------

ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS machine_cost        NUMERIC(10,2) DEFAULT 1500.00,
  ADD COLUMN IF NOT EXISTS amortization_months INTEGER       DEFAULT 36;

COMMENT ON COLUMN machines.machine_cost        IS 'Coût total d''acquisition machine (€)';
COMMENT ON COLUMN machines.amortization_months IS 'Durée amortissement linéaire (mois) · défaut 36 = 3 ans';

-- BMF-001 : machine Circle Club Auteuil
UPDATE machines
  SET machine_cost = 1500.00, amortization_months = 36
  WHERE serial_number = 'BMF-001';

-- ---------------------------------------------------------------------------
-- 4. Vue machine_profitability — mise à jour complète
--    Sépare frais machine (scalables) / frais société (fixes)
--    Ajoute : machine_fixed_30d, amortissement_30d, resultat_net_30d,
--             delai_prochaine_machine, machine_cost, amortization_months
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW machine_profitability AS
WITH
  fc  AS (SELECT * FROM _financial_constants),
  -- Coûts opérationnels par machine (se multiplient avec le nb de machines)
  pmc AS (
    SELECT COALESCE(SUM(monthly_amount), 0) AS total
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = TRUE
  ),
  -- Frais fixes société (ne se multiplient pas)
  cfc AS (
    SELECT COALESCE(SUM(monthly_amount), 0) AS total
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = FALSE
  )
SELECT
  m.id                                            AS machine_id,
  m.serial_number,
  m.simulation_mode,
  l.name                                          AS location_name,
  l.city,
  m.active_days_per_year,
  m.nayax_commission_pct,
  m.nayax_monthly_fee,
  m.machine_cost,
  m.amortization_months,

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

  -- ── Marge machine HT (avant frais fixes) ─────────────────────────────────
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

  -- ── Frais opérationnels machine (scalables — × nb machines) ──────────────
  ROUND(pmc.total, 2)                             AS machine_fixed_30d,

  -- ── Frais fixes société (non scalables) ──────────────────────────────────
  ROUND(cfc.total, 2)                             AS company_fixed_30d,

  -- ── Cashflow trésorerie (cash réel · avant amortissement) ────────────────
  ROUND(
    mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
    - pmc.total
    - cfc.total
  , 2)                                            AS cashflow_net_30d,

  ROUND(CASE WHEN mf.revenue_30d = 0 THEN 0 ELSE (
    mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
    - pmc.total
    - cfc.total
  ) / (mf.revenue_30d / (1 + fc.vat_rate)) * 100 END, 1) AS cashflow_net_pct,

  -- ── Amortissement machine (non-cash, comptable) ───────────────────────────
  ROUND(
    CASE WHEN m.amortization_months > 0
      THEN m.machine_cost / m.amortization_months
      ELSE 0 END
  , 2)                                            AS amortissement_30d,

  -- ── Résultat net comptable (cashflow − amortissement) ────────────────────
  ROUND(
    mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
    - pmc.total
    - cfc.total
    - CASE WHEN m.amortization_months > 0
        THEN m.machine_cost / m.amortization_months
        ELSE 0 END
  , 2)                                            AS resultat_net_30d,

  -- ── Seuil de rentabilité cashflow (sprays/jour) ───────────────────────────
  ROUND(
    (m.nayax_monthly_fee + pmc.total + cfc.total)
    / fc.contribution_per_spray / 30
  , 1)                                            AS breakeven_sprays_per_day,

  -- ── Délai financement prochaine machine (mois) ────────────────────────────
  ROUND(
    CASE WHEN (
      mf.revenue_30d / (1 + fc.vat_rate)
      - mf.sales_30d * fc.cost_per_spray_ht
      - mf.revenue_30d * m.nayax_commission_pct / 100
      - m.nayax_monthly_fee
      - pmc.total
      - cfc.total
    ) > 0 THEN m.machine_cost / (
      mf.revenue_30d / (1 + fc.vat_rate)
      - mf.sales_30d * fc.cost_per_spray_ht
      - mf.revenue_30d * m.nayax_commission_pct / 100
      - m.nayax_monthly_fee
      - pmc.total
      - cfc.total
    ) ELSE NULL END
  , 1)                                            AS delai_prochaine_machine,

  -- ── Projection annuelle cashflow trésorerie ───────────────────────────────
  ROUND(
    (mf.revenue_30d / (1 + fc.vat_rate)
    - mf.sales_30d * fc.cost_per_spray_ht
    - mf.revenue_30d * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
    - pmc.total
    - cfc.total) / 30 * m.active_days_per_year
  , 0)                                            AS cashflow_annual_projection,

  -- ── Coût par spray (pour transparence) ───────────────────────────────────
  ROUND(fc.cost_per_spray_ht, 4)                  AS cost_per_spray_ht,
  ROUND(fc.contribution_per_spray, 4)             AS contribution_per_spray

FROM machines m
CROSS JOIN fc
CROSS JOIN pmc
CROSS JOIN cfc
JOIN locations          l  ON l.id  = m.location_id
JOIN machine_kpis       mk ON mk.machine_id = m.id
JOIN machine_financials mf ON mf.machine_id = m.id
WHERE m.status != 'decommissioned';

COMMENT ON VIEW machine_profitability IS
  'P&L complet par machine : CA TTC/HT, TVA, COGS, Nayax, opex machine, frais société, cashflow trésorerie, amortissement, résultat net, breakeven, projections.';

GRANT SELECT ON machine_profitability TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- 5. Vue company_monthly_overview — mise à jour
--    Prend en compte les coûts opex machine × nb machines
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW company_monthly_overview AS
WITH
  fc AS (SELECT * FROM _financial_constants),
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
      SUM(m.nayax_monthly_fee)                              AS nayax_fees
    FROM machine_financials mf
    JOIN machines m ON m.id = mf.machine_id
    CROSS JOIN fc
    WHERE m.status != 'decommissioned'
  )
SELECT
  ma.machine_count,
  ma.sim_count,

  -- CA
  ROUND(ma.ca_ttc, 2)                                             AS ca_ttc_30d,
  ROUND(ma.ca_ht, 2)                                              AS ca_ht_30d,
  ROUND(ma.tva, 2)                                                AS tva_collectee_30d,
  ma.sprays::integer                                              AS sprays_30d,
  ROUND(ma.sprays::numeric / 30, 1)                               AS avg_sprays_per_day,

  -- Coûts
  ROUND(ma.cogs, 2)                                               AS cogs_parfum_30d,
  ROUND(ma.nayax_comm, 2)                                         AS nayax_commission_30d,
  ROUND(ma.nayax_fees, 2)                                         AS nayax_fees_30d,
  -- Opex machines (× nb machines)
  ROUND(pmc.total * ma.machine_count, 2)                          AS machine_fixed_30d,
  -- Frais société fixes
  ROUND(cfc.total, 2)                                             AS company_fixed_30d,
  ROUND(ma.cogs + ma.nayax_comm + ma.nayax_fees
        + pmc.total * ma.machine_count + cfc.total, 2)            AS total_costs_30d,

  -- Marge machine (avant frais fixes)
  ROUND(ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees, 2)   AS machine_margin_30d,
  ROUND(CASE WHEN ma.ca_ht = 0 THEN 0 ELSE
    (ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees)
    / ma.ca_ht * 100
  END, 1)                                                         AS machine_margin_pct,

  -- Cashflow trésorerie réseau
  ROUND(ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees
        - pmc.total * ma.machine_count - cfc.total, 2)            AS cashflow_net_30d,
  ROUND(CASE WHEN ma.ca_ht = 0 THEN 0 ELSE
    (ma.ca_ht - ma.cogs - ma.nayax_comm - ma.nayax_fees
     - pmc.total * ma.machine_count - cfc.total)
    / ma.ca_ht * 100
  END, 1)                                                         AS cashflow_net_pct

FROM machines_agg ma, pmc, cfc;

COMMENT ON VIEW company_monthly_overview IS
  'Vision CEO réseau complet : CA TTC/HT, TVA, tous frais (opex ×N + fixes), marges, cashflow trésorerie.';

GRANT SELECT ON company_monthly_overview TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- 6. Fonction get_profitability_scenarios — mise à jour
--    Sépare correctement opex machine / frais société
--    Note : company_fixed_30d = opex_machine + frais_société (pour 1 machine)
-- ---------------------------------------------------------------------------

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
  company_fixed_30d     NUMERIC,   -- opex machine + frais société (1 machine)
  cashflow_net_30d      NUMERIC,
  cashflow_net_pct      NUMERIC,
  cashflow_annual_305d  NUMERIC,
  is_profitable         BOOLEAN,
  kpi_status            TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH
    fc  AS (SELECT * FROM _financial_constants),
    pmc AS (SELECT COALESCE(SUM(monthly_amount), 0) AS total
            FROM company_costs WHERE is_active = TRUE AND is_per_machine = TRUE),
    cfc AS (SELECT COALESCE(SUM(monthly_amount), 0) AS total
            FROM company_costs WHERE is_active = TRUE AND is_per_machine = FALSE),
    scenarios AS (SELECT unnest(ARRAY[10,15,20,30,40]) AS spd)
  SELECT
    s.spd,
    (s.spd * 30),
    ROUND(s.spd * 30 * fc.price_ttc,                              2),
    ROUND(s.spd * 30 * fc.price_ht,                               2),
    ROUND(s.spd * 30 * fc.vat_per_spray,                          2),
    ROUND(s.spd * 30 * fc.cost_per_spray_ht,                      2),
    ROUND(s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100,    2),
    ROUND(fc.nayax_monthly_fee,                                   2),
    -- Marge machine HT
    ROUND(
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee
    , 2),
    -- Frais fixes totaux 1 machine (opex + société)
    ROUND(pmc.total + cfc.total, 2),
    -- Cashflow net trésorerie
    ROUND(
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee
      - pmc.total - cfc.total
    , 2),
    -- Cashflow %
    ROUND(CASE WHEN s.spd = 0 THEN 0 ELSE (
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total
    ) / (s.spd * 30 * fc.price_ht) * 100 END, 1),
    -- Projection annuelle 305 j
    ROUND((
      s.spd * 30 * fc.price_ht
      - s.spd * 30 * fc.cost_per_spray_ht
      - s.spd * 30 * fc.price_ttc * fc.nayax_comm_pct / 100
      - fc.nayax_monthly_fee - pmc.total - cfc.total
    ) / 30 * 305, 0),
    -- Rentable ?
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
  'Tableau comparatif 10/15/20/30/40 sprays/j pour 1 machine — tous frais inclus (TVA, COGS, Nayax, opex machine, société).';

GRANT EXECUTE ON FUNCTION get_profitability_scenarios TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- 7. Nouvelle fonction : get_network_projections
--    Projections cashflow réseau pour 1 / 3 / 5 / 10 machines
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_network_projections(
  p_avg_sprays_per_day  NUMERIC  DEFAULT 20,
  p_machine_cost        NUMERIC  DEFAULT 1500,
  p_amort_months        INTEGER  DEFAULT 36,
  p_autonomy_target     NUMERIC  DEFAULT 2000    -- €/mois cashflow cible autonomie
)
RETURNS TABLE (
  machine_count              INTEGER,
  sprays_per_day_total       NUMERIC,
  sprays_30d_total           BIGINT,
  ca_ht_30d                  NUMERIC,
  cogs_30d                   NUMERIC,
  nayax_commission_30d       NUMERIC,
  nayax_fees_30d             NUMERIC,
  machine_opex_30d           NUMERIC,
  company_fixed_30d          NUMERIC,
  total_costs_30d            NUMERIC,
  cashflow_tresorerie_30d    NUMERIC,
  cashflow_tresorerie_pct    NUMERIC,
  amortissement_30d          NUMERIC,
  resultat_net_30d           NUMERIC,
  cashflow_annual_305d       NUMERIC,
  capacite_reinvestissement  NUMERIC,
  delai_prochaine_machine    NUMERIC,
  is_autonomous              BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_per_machine_opex   NUMERIC;
  v_company_fixed      NUMERIC;
  v_price_ht           CONSTANT NUMERIC := 1.0 / 1.20;
  v_cogs_ps            CONSTANT NUMERIC := 0.031;
  v_nayax_comm_pct     CONSTANT NUMERIC := 0.02;   -- 2% du CA TTC
  v_nayax_fee_pm       CONSTANT NUMERIC := 15.0;   -- €/machine/mois
  v_n                  INTEGER;
  v_sp30               BIGINT;
  v_ca_ht              NUMERIC;
  v_cogs               NUMERIC;
  v_nayax_comm_t       NUMERIC;
  v_nayax_fees_t       NUMERIC;
  v_mach_opex_t        NUMERIC;
  v_cash               NUMERIC;
  v_amort              NUMERIC;
BEGIN
  -- Coûts depuis la base (dynamiques)
  SELECT COALESCE(SUM(monthly_amount), 0) INTO v_per_machine_opex
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = TRUE;
  SELECT COALESCE(SUM(monthly_amount), 0) INTO v_company_fixed
    FROM company_costs WHERE is_active = TRUE AND is_per_machine = FALSE;

  FOREACH v_n IN ARRAY ARRAY[1, 3, 5, 10] LOOP
    v_sp30         := (v_n * p_avg_sprays_per_day * 30)::BIGINT;
    v_ca_ht        := v_sp30 * v_price_ht;
    v_cogs         := v_sp30 * v_cogs_ps;
    v_nayax_comm_t := v_sp30 * v_nayax_comm_pct;  -- 2% du CA TTC (price_ttc=1€)
    v_nayax_fees_t := v_n * v_nayax_fee_pm;
    v_mach_opex_t  := v_n * v_per_machine_opex;
    v_cash         := v_ca_ht - v_cogs - v_nayax_comm_t
                      - v_nayax_fees_t - v_mach_opex_t - v_company_fixed;
    v_amort        := v_n * CASE WHEN p_amort_months > 0
                        THEN p_machine_cost / p_amort_months
                        ELSE 0 END;

    machine_count             := v_n;
    sprays_per_day_total      := v_n * p_avg_sprays_per_day;
    sprays_30d_total          := v_sp30;
    ca_ht_30d                 := ROUND(v_ca_ht, 2);
    cogs_30d                  := ROUND(v_cogs, 2);
    nayax_commission_30d      := ROUND(v_nayax_comm_t, 2);
    nayax_fees_30d            := ROUND(v_nayax_fees_t, 2);
    machine_opex_30d          := ROUND(v_mach_opex_t, 2);
    company_fixed_30d         := ROUND(v_company_fixed, 2);
    total_costs_30d           := ROUND(v_cogs + v_nayax_comm_t + v_nayax_fees_t
                                       + v_mach_opex_t + v_company_fixed, 2);
    cashflow_tresorerie_30d   := ROUND(v_cash, 2);
    cashflow_tresorerie_pct   := ROUND(
      CASE WHEN v_ca_ht > 0 THEN v_cash / v_ca_ht * 100 ELSE 0 END, 1);
    amortissement_30d         := ROUND(v_amort, 2);
    resultat_net_30d          := ROUND(v_cash - v_amort, 2);
    cashflow_annual_305d      := ROUND(v_cash / 30.0 * 305, 0);
    capacite_reinvestissement := ROUND(GREATEST(v_cash, 0), 2);
    delai_prochaine_machine   := CASE WHEN v_cash > 0
                                   THEN ROUND(p_machine_cost / v_cash, 1)
                                   ELSE NULL END;
    is_autonomous             := v_cash >= p_autonomy_target;
    RETURN NEXT;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION get_network_projections IS
  'Projections cashflow réseau Pulvis pour 1/3/5/10 machines. Paramètres : sprays/j moyen, coût machine, durée amort., cible autonomie.';

GRANT EXECUTE ON FUNCTION get_network_projections TO authenticated, anon;


-- ===========================================================================
-- VÉRIFICATION — décommenter après exécution
-- ===========================================================================
/*

-- 1. Nouveaux coûts par machine
SELECT name, category, monthly_amount, is_per_machine
FROM company_costs WHERE is_active = TRUE
ORDER BY is_per_machine DESC, monthly_amount DESC;
-- Attendu : 9 lignes · opex machine = 47,50 € · société = 102,19 €

-- 2. P&L mis à jour BMF-001 (≈800 sprays, 26.7/j)
SELECT
  serial_number,
  sprays_30d,
  ca_ttc_30d, ca_ht_30d,
  cogs_parfum_30d, nayax_commission_30d, nayax_fee_30d,
  machine_margin_30d, machine_margin_pct,
  machine_fixed_30d,     -- 47,50 €  ← NOUVEAU
  company_fixed_30d,     -- 102,19 €
  cashflow_net_30d,      -- ≈ 461,18 €  (vs 508,68 € avant)
  cashflow_net_pct,      -- ≈ 69,2 %
  amortissement_30d,     -- 41,67 €  ← NOUVEAU
  resultat_net_30d,      -- ≈ 419,51 €  ← NOUVEAU
  breakeven_sprays_per_day, -- ≈ 7,0 (vs 5,0 avant)
  delai_prochaine_machine,  -- ≈ 3,3 mois  ← NOUVEAU
  cashflow_annual_projection
FROM machine_profitability
WHERE serial_number = 'BMF-001';

-- 3. Scénarios mis à jour
SELECT
  sprays_per_day, kpi_status,
  ca_ht_30d, company_fixed_30d, cashflow_net_30d, cashflow_net_pct,
  cashflow_annual_305d, is_profitable
FROM get_profitability_scenarios();
-- Attendu (company_fixed_30d = 149,69 € · opex 47,50 + société 102,19) :
--  spd   CA_HT  fixed    cashflow  %      annual   rentable
--  10/j   250€  149,69€   70,01€  28,0%    712€   TRUE
--  15/j   375€  149,69€  187,36€  50,0%   1905€   TRUE
--  20/j   500€  149,69€  304,71€  60,9%   3098€   TRUE
--  30/j   750€  149,69€  539,41€  71,9%   5485€   TRUE
--  40/j  1000€  149,69€  774,11€  77,4%   7871€   TRUE

-- 4. Projections réseau (20 sprays/j moyen)
SELECT
  machine_count,
  sprays_per_day_total,
  ca_ht_30d,
  total_costs_30d,
  cashflow_tresorerie_30d,
  cashflow_tresorerie_pct,
  amortissement_30d,
  resultat_net_30d,
  cashflow_annual_305d,
  delai_prochaine_machine,
  is_autonomous
FROM get_network_projections(20);
-- Attendu :
--  N   spd   CA_HT   Coûts     Cashflow  %      Amort.  RésNet   Annual  Délai  Auto
--  1   20/j   500€   195,29€   304,71€  60,9%  41,67€  263,04€   3098€  4,9m   NON
--  3   60/j  1500€   381,49€  1118,51€  74,6% 125,01€  993,50€  11372€  1,3m   NON
--  5  100/j  2500€   567,69€  1932,31€  77,3% 208,35€ 1723,96€  19628€  0,8m   NON
-- 10  200/j  5000€  1033,19€  3966,81€  79,3% 416,70€ 3550,11€  40313€  0,4m   OUI

*/

COMMIT;
