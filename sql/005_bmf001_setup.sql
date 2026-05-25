-- =============================================================================
-- PULVIS — BMF-001 · Setup & configuration machine terrain
-- Migration    : 005_bmf001_setup.sql
-- Prérequis    : 001_init.sql, 004_rpc_dashboard.sql
-- Machine      : BMF-001 · Circle Club Auteuil · Salle de sport premium
-- =============================================================================
-- Architecture de transition simulation → terrain :
--   simulation_mode = TRUE  → machine de test, badge SIMULATION dans le dashboard
--   simulation_mode = FALSE → machine terrain, les slot_events ESP32 arrivent en live
--
-- Pour basculer vers la vraie machine (aucune modification d'architecture) :
--   UPDATE machines SET simulation_mode = false, firmware_version = '1.x.x'
--     WHERE serial_number = 'BMF-001';
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- SCHEMA — ajout des colonnes machine manquantes
-- ---------------------------------------------------------------------------

ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS simulation_mode       BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS nayax_commission_pct  NUMERIC(5,2) NOT NULL DEFAULT 2.00,
  ADD COLUMN IF NOT EXISTS nayax_monthly_fee     NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS operating_hours_start INTEGER      DEFAULT 6,   -- heure ouverture (0-23)
  ADD COLUMN IF NOT EXISTS operating_hours_end   INTEGER      DEFAULT 23,  -- heure fermeture (0-23)
  ADD COLUMN IF NOT EXISTS active_days_per_year  INTEGER      DEFAULT 365;

COMMENT ON COLUMN machines.simulation_mode       IS 'TRUE = machine de test simulée. FALSE = machine terrain avec ESP32 réel.';
COMMENT ON COLUMN machines.nayax_commission_pct  IS 'Commission Nayax en % du CA brut (ex : 2.00 = 2%).';
COMMENT ON COLUMN machines.nayax_monthly_fee     IS 'Abonnement terminal Nayax en €/mois.';
COMMENT ON COLUMN machines.operating_hours_start IS 'Heure d''ouverture de l''emplacement (format 24h).';
COMMENT ON COLUMN machines.operating_hours_end   IS 'Heure de fermeture de l''emplacement (format 24h).';
COMMENT ON COLUMN machines.active_days_per_year  IS 'Jours d''activité estimés/an (hors fermetures).';

-- RLS : authenticated peut lire les nouveaux champs (policies existantes couvrent déjà)
-- service_role : accès total (bypass RLS natif Supabase)


-- ---------------------------------------------------------------------------
-- VUE : machine_economics
-- Économie complète par machine :
--   Revenu brut → COGS (parfum) → Commission Nayax → Abonnement → Marge nette
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW machine_economics AS
WITH avg_costs AS (
  -- Coût moyen au spray pour chaque machine (moyenne pondérée des slots actifs)
  SELECT
    ms.machine_id,
    AVG(p.cost_per_spray)  AS avg_cost_per_spray
  FROM machine_slots ms
  JOIN perfumes p ON p.id = ms.perfume_id
  WHERE ms.is_active = TRUE
    AND p.cost_per_spray IS NOT NULL
  GROUP BY ms.machine_id
)
SELECT
  m.id                                                    AS machine_id,
  m.serial_number,
  m.simulation_mode,
  m.nayax_commission_pct,
  m.nayax_monthly_fee,

  -- Revenu
  COALESCE(mf.revenue_today,  0)                          AS revenue_today,
  COALESCE(mf.revenue_30d,    0)                          AS revenue_30d,
  COALESCE(mf.sales_30d,      0)                          AS sales_30d,

  -- COGS (coût matière : parfum)
  ROUND(COALESCE(mf.sales_30d, 0) * COALESCE(ac.avg_cost_per_spray, 0), 2) AS cogs_30d,

  -- Commission Nayax (% du CA)
  ROUND(COALESCE(mf.revenue_30d, 0) * m.nayax_commission_pct / 100, 2)      AS nayax_commission_30d,

  -- Marge brute 30j (avant abonnement terminal)
  ROUND(
    COALESCE(mf.revenue_30d,  0)
    - COALESCE(mf.sales_30d, 0) * COALESCE(ac.avg_cost_per_spray, 0)
    - COALESCE(mf.revenue_30d, 0) * m.nayax_commission_pct / 100
  , 2)                                                    AS gross_margin_30d,

  -- Marge nette 30j (après abonnement terminal Nayax)
  ROUND(
    COALESCE(mf.revenue_30d,  0)
    - COALESCE(mf.sales_30d, 0) * COALESCE(ac.avg_cost_per_spray, 0)
    - COALESCE(mf.revenue_30d, 0) * m.nayax_commission_pct / 100
    - m.nayax_monthly_fee
  , 2)                                                    AS net_margin_30d,

  -- Marge nette % (sur revenue_30d)
  ROUND(
    CASE WHEN COALESCE(mf.revenue_30d, 0) = 0 THEN 0 ELSE
      (
        COALESCE(mf.revenue_30d,  0)
        - COALESCE(mf.sales_30d, 0) * COALESCE(ac.avg_cost_per_spray, 0)
        - COALESCE(mf.revenue_30d, 0) * m.nayax_commission_pct / 100
        - m.nayax_monthly_fee
      ) / COALESCE(mf.revenue_30d, 0) * 100
    END
  , 1)                                                    AS net_margin_pct,

  -- Projection annuelle (marge nette × facteur jours)
  ROUND(
    (
      COALESCE(mf.revenue_30d,  0)
      - COALESCE(mf.sales_30d, 0) * COALESCE(ac.avg_cost_per_spray, 0)
      - COALESCE(mf.revenue_30d, 0) * m.nayax_commission_pct / 100
      - m.nayax_monthly_fee
    ) / 30 * m.active_days_per_year
  , 0)                                                    AS net_margin_annual_projection,

  -- Coût au spray détaillé (pour transparence)
  ROUND(COALESCE(ac.avg_cost_per_spray, 0), 4)            AS avg_cost_per_spray

FROM machines m
LEFT JOIN machine_financials mf ON mf.machine_id = m.id
LEFT JOIN avg_costs          ac ON ac.machine_id  = m.id;

COMMENT ON VIEW machine_economics IS
  'Économie complète par machine : COGS, commission Nayax, marge brute/nette, projection annuelle.';

-- RLS sur la vue (inherited de la table machines via policies authenticated)
GRANT SELECT ON machine_economics TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- EMPLACEMENT : Circle Club Auteuil
-- ---------------------------------------------------------------------------

INSERT INTO locations (
  id, name, address, city, postal_code,
  location_type, contact_name, contact_email, contact_phone,
  revenue_share_pct, notes, is_active
)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Circle Club Auteuil',
  '17 Rue Wilhem',
  'Paris', '75016',
  'gym',
  NULL, NULL, NULL,
  0.00,
  'Salle de sport premium Paris 16e — horaires 6h-23h 7j/7 — clientèle 20-40 ans CSP+',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name             = EXCLUDED.name,
  address          = EXCLUDED.address,
  notes            = EXCLUDED.notes;


-- ---------------------------------------------------------------------------
-- PARFUMS : collection BMF-001 (5 parfums)
-- Format 50ml · 0,10ml/spray · 500 sprays/flacon · coût 15,50€/flacon
-- Coût par spray = 15,50 / 500 = 0,031 €/spray
-- ---------------------------------------------------------------------------

INSERT INTO perfumes (id, name, brand, reference, price_per_spray, cost_per_spray, gender, family, description, is_active)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'Self', 'Collection Pulvis', 'BMF-SELF',
    1.00, 0.031, 'mixte', 'boisé',
    'Signature boisée et affirmée. Bestseller mixte.', TRUE
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'Love Intense', 'Collection Pulvis', 'BMF-LOVI',
    1.00, 0.031, 'femme', 'oriental',
    'Oriental intense, sillage profond. Préféré féminin.', TRUE
  ),
  (
    'f1000000-0000-0000-0000-000000000003',
    'Life', 'Collection Pulvis', 'BMF-LIFE',
    1.00, 0.031, 'mixte', 'floral',
    'Floral frais et lumineux. Polyvalent.', TRUE
  ),
  (
    'f1000000-0000-0000-0000-000000000004',
    'Indomptable', 'Collection Pulvis', 'BMF-INDO',
    1.00, 0.031, 'homme', 'boisé-épicé',
    'Boisé épicé masculin. Co-bestseller avec Self.', TRUE
  ),
  (
    'f1000000-0000-0000-0000-000000000005',
    'Intense', 'Collection Pulvis', 'BMF-INTS',
    1.00, 0.031, 'mixte', 'oriental',
    'Oriental profond, formule concentrée.', TRUE
  )
ON CONFLICT (reference) DO UPDATE SET
  name             = EXCLUDED.name,
  cost_per_spray   = EXCLUDED.cost_per_spray,
  description      = EXCLUDED.description;


-- ---------------------------------------------------------------------------
-- MACHINE : BMF-001
-- simulation_mode = TRUE — basculer à FALSE lors du déploiement terrain
-- ---------------------------------------------------------------------------

INSERT INTO machines (
  id, serial_number, location_id, status,
  installed_at, firmware_version,
  simulation_mode, nayax_commission_pct, nayax_monthly_fee,
  operating_hours_start, operating_hours_end,
  active_days_per_year, notes
)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'BMF-001',
  'a1000000-0000-0000-0000-000000000001',
  'active',
  NOW() - INTERVAL '31 days',
  '1.0.0-sim',
  TRUE,   -- ← simulation_mode : passer à FALSE pour la machine terrain
  2.00,   -- commission Nayax 2%
  15.00,  -- abonnement terminal Nayax 15€/mois
  6,      -- ouverture 6h
  23,     -- fermeture 23h
  305,    -- jours d'activité estimés/an
  'Machine test BMF-001 · Circle Club Auteuil · Paris 16e · Phase prototype'
)
ON CONFLICT (serial_number) DO UPDATE SET
  location_id          = EXCLUDED.location_id,
  simulation_mode      = EXCLUDED.simulation_mode,
  nayax_commission_pct = EXCLUDED.nayax_commission_pct,
  nayax_monthly_fee    = EXCLUDED.nayax_monthly_fee,
  notes                = EXCLUDED.notes;


-- ---------------------------------------------------------------------------
-- SLOTS : 5 parfums × BMF-001
-- Capacité : 100ml/slot ÷ 0,10ml/spray = 1 000 sprays/slot
-- Seuil alerte : 100 sprays (= 10% de la capacité)
-- ---------------------------------------------------------------------------

INSERT INTO machine_slots (
  id, machine_id, slot_position, perfume_id,
  capacity, current_stock, low_stock_threshold, is_active
)
VALUES
  -- Slot 1 : Self (mixte, bestseller)
  ('f1100000-0000-0000-0000-000000000001',
   'f0000000-0000-0000-0000-000000000001', 1,
   'f1000000-0000-0000-0000-000000000001', 1000, 1000, 100, TRUE),

  -- Slot 2 : Love Intense (femme)
  ('f1100000-0000-0000-0000-000000000002',
   'f0000000-0000-0000-0000-000000000001', 2,
   'f1000000-0000-0000-0000-000000000002', 1000, 1000, 100, TRUE),

  -- Slot 3 : Life (mixte)
  ('f1100000-0000-0000-0000-000000000003',
   'f0000000-0000-0000-0000-000000000001', 3,
   'f1000000-0000-0000-0000-000000000003', 1000, 1000, 100, TRUE),

  -- Slot 4 : Indomptable (homme, bestseller)
  ('f1100000-0000-0000-0000-000000000004',
   'f0000000-0000-0000-0000-000000000001', 4,
   'f1000000-0000-0000-0000-000000000004', 1000, 1000, 100, TRUE),

  -- Slot 5 : Intense (mixte, oriental)
  ('f1100000-0000-0000-0000-000000000005',
   'f0000000-0000-0000-0000-000000000001', 5,
   'f1000000-0000-0000-0000-000000000005', 1000, 1000, 100, TRUE)

ON CONFLICT (machine_id, slot_position) DO UPDATE SET
  perfume_id          = EXCLUDED.perfume_id,
  capacity            = EXCLUDED.capacity,
  low_stock_threshold = EXCLUDED.low_stock_threshold;

COMMIT;

-- =============================================================================
-- VÉRIFICATION après insertion
-- =============================================================================
/*
SELECT
  m.serial_number,
  m.simulation_mode,
  l.name AS location,
  m.nayax_commission_pct,
  m.nayax_monthly_fee,
  m.operating_hours_start || 'h - ' || m.operating_hours_end || 'h' AS horaires,
  m.active_days_per_year || ' j/an' AS activite
FROM machines m
JOIN locations l ON l.id = m.location_id
WHERE m.serial_number = 'BMF-001';

SELECT slot_position, p.name, p.gender, ms.capacity, ms.current_stock, ms.low_stock_threshold
FROM machine_slots ms
JOIN perfumes p ON p.id = ms.perfume_id
WHERE ms.machine_id = 'f0000000-0000-0000-0000-000000000001'
ORDER BY slot_position;
*/
