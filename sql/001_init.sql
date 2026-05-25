-- =============================================================================
-- PULVIS — Schéma SQL fondateur
-- Migration    : 001_init.sql
-- Architecture : event-driven / slot_events = source de vérité unique
-- Base         : Supabase / PostgreSQL 15+
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- gen_random_uuid() (natif pg15+)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- analyse des requêtes lentes


-- =============================================================================
-- UTILITAIRE : trigger générique updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- TABLE : locations
-- Emplacements physiques des machines (centres commerciaux, hôtels, gares…)
-- =============================================================================

CREATE TABLE locations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  address             TEXT,
  city                TEXT        NOT NULL,
  postal_code         TEXT,
  country             TEXT        NOT NULL DEFAULT 'FR',
  location_type       TEXT        NOT NULL CHECK (location_type IN (
                        'mall', 'hotel', 'train_station', 'airport',
                        'gym', 'office', 'restaurant', 'other'
                      )),
  -- Contact partenaire emplacement
  contact_name        TEXT,
  contact_email       TEXT,
  contact_phone       TEXT,
  -- Finance
  revenue_share_pct   NUMERIC(5,2) NOT NULL DEFAULT 0
                        CHECK (revenue_share_pct BETWEEN 0 AND 100),
  -- Métadonnées
  notes               TEXT,
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  locations IS 'Emplacements physiques où sont installées les machines Pulvis.';
COMMENT ON COLUMN locations.revenue_share_pct IS '% du CA reversé au partenaire emplacement (ex. : 10 = 10 %).';

CREATE TRIGGER set_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- TABLE : perfumes
-- Catalogue des parfums disponibles dans le réseau Pulvis
-- =============================================================================

CREATE TABLE perfumes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  brand           TEXT        NOT NULL,
  reference       TEXT        NOT NULL UNIQUE,    -- SKU interne Pulvis
  description     TEXT,
  price_per_spray NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (price_per_spray > 0),
  cost_per_spray  NUMERIC(5,2)           CHECK (cost_per_spray > 0), -- coût matière
  gender          TEXT        CHECK (gender IN ('homme', 'femme', 'mixte')),
  family          TEXT,                           -- ex. : oriental, floral, boisé
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  perfumes IS 'Catalogue des parfums Pulvis.';
COMMENT ON COLUMN perfumes.reference       IS 'SKU interne unique — utilisé pour les commandes fournisseur.';
COMMENT ON COLUMN perfumes.cost_per_spray  IS 'Coût matière unitaire pour le calcul de marge brute.';

CREATE TRIGGER set_perfumes_updated_at
  BEFORE UPDATE ON perfumes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- TABLE : machines
-- Distributeurs automatiques du réseau Pulvis
-- =============================================================================

CREATE TABLE machines (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number    TEXT        NOT NULL UNIQUE,   -- gravé sur la machine, clé de provisioning ESP32
  location_id      UUID        REFERENCES locations(id) ON DELETE SET NULL,
  status           TEXT        NOT NULL DEFAULT 'offline' CHECK (status IN (
                     'active', 'maintenance', 'offline', 'decommissioned'
                   )),
  installed_at     TIMESTAMPTZ,
  last_seen_at     TIMESTAMPTZ,                   -- mis à jour à chaque événement reçu de l'ESP32
  firmware_version TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  machines IS 'Distributeurs automatiques du réseau Pulvis.';
COMMENT ON COLUMN machines.serial_number  IS 'Identifiant physique gravé sur la machine — utilisé pour le provisioning ESP32.';
COMMENT ON COLUMN machines.last_seen_at   IS 'Dernière activité reçue (heartbeat ou vente) — mis à jour par trigger sur slot_events.';

CREATE TRIGGER set_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- TABLE : machine_slots
-- 5 slots par machine, chacun associé à un parfum
-- =============================================================================

CREATE TABLE machine_slots (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id          UUID        NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  slot_position       INTEGER     NOT NULL CHECK (slot_position BETWEEN 1 AND 5),
  perfume_id          UUID        REFERENCES perfumes(id) ON DELETE SET NULL,
  capacity            INTEGER     NOT NULL DEFAULT 500 CHECK (capacity > 0),   -- sprays par remplissage complet
  current_stock       INTEGER     NOT NULL DEFAULT 0   CHECK (current_stock >= 0),
  low_stock_threshold INTEGER     NOT NULL DEFAULT 50  CHECK (low_stock_threshold >= 0),
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  last_restocked_at   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (machine_id, slot_position)           -- 1 slot par position par machine
);

COMMENT ON TABLE  machine_slots IS '5 slots par machine — suivi stock par slot. Source : slot_events.';
COMMENT ON COLUMN machine_slots.capacity            IS 'Nombre de sprays pour un remplissage complet.';
COMMENT ON COLUMN machine_slots.current_stock       IS 'Stock courant — mis à jour par trigger à chaque slot_event.';
COMMENT ON COLUMN machine_slots.low_stock_threshold IS 'Seuil déclenchant une alerte low_stock_alert.';

CREATE TRIGGER set_machine_slots_updated_at
  BEFORE UPDATE ON machine_slots
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- TABLE : event_types
-- Référentiel des types d'événements machine
-- =============================================================================

CREATE TABLE event_types (
  code          TEXT        PRIMARY KEY,    -- ex. : 'sale', 'restock', 'error'
  label         TEXT        NOT NULL,
  description   TEXT,
  category      TEXT        NOT NULL CHECK (category IN (
                  'transaction', 'maintenance', 'alert', 'system'
                )),
  affects_stock BOOLEAN     NOT NULL DEFAULT FALSE,  -- TRUE si cet event modifie current_stock
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  event_types IS 'Référentiel immuable des types d''événements machine.';
COMMENT ON COLUMN event_types.affects_stock IS 'TRUE si l''event porte un stock_delta à appliquer sur machine_slots.';

INSERT INTO event_types (code, label, description, category, affects_stock) VALUES
  ('sale',              'Vente',                   'Spray vendu — CB validé et spray dispensé',               'transaction', TRUE),
  ('restock',           'Remplissage',             'Remplissage d''un slot par l''équipe Pulvis',              'maintenance', TRUE),
  ('dispense_failed',   'Échec de dispense',       'CB accepté mais spray non dispensé — incident critique',   'alert',       FALSE),
  ('payment_failed',    'Échec de paiement',       'Tentative CB refusée',                                     'transaction', FALSE),
  ('low_stock_alert',   'Alerte stock bas',        'Stock slot sous le seuil de déclenchement',               'alert',       FALSE),
  ('out_of_stock',      'Rupture de stock',        'Slot vide',                                               'alert',       FALSE),
  ('heartbeat',         'Heartbeat',               'Signal de vie périodique de l''ESP32',                    'system',      FALSE),
  ('maintenance_start', 'Début de maintenance',    'Technicien démarre une intervention',                     'maintenance', FALSE),
  ('maintenance_end',   'Fin de maintenance',      'Intervention terminée',                                   'maintenance', FALSE),
  ('boot',              'Démarrage machine',       'ESP32 démarré ou redémarré',                              'system',      FALSE),
  ('firmware_update',   'Mise à jour firmware',    'Nouveau firmware installé sur l''ESP32',                  'system',      FALSE),
  ('slot_disabled',     'Slot désactivé',          'Slot mis hors service manuellement',                      'maintenance', FALSE),
  ('slot_enabled',      'Slot activé',             'Slot remis en service',                                   'maintenance', FALSE);


-- =============================================================================
-- TABLE : slot_events
-- *** SOURCE DE VÉRITÉ UNIQUE *** — tous les événements machine
-- Cette table est append-only : jamais de UPDATE ni de DELETE.
-- =============================================================================

CREATE TABLE slot_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id      UUID        NOT NULL REFERENCES machines(id)      ON DELETE CASCADE,
  slot_id         UUID                 REFERENCES machine_slots(id) ON DELETE SET NULL, -- NULL pour events machine-level
  event_type_code TEXT        NOT NULL REFERENCES event_types(code),

  -- Données financières (ventes)
  amount          NUMERIC(5,2)         CHECK (amount >= 0),        -- 1.00 pour une vente standard

  -- Données de stock
  stock_delta     INTEGER,                                          -- -1 vente / +N restock / NULL sinon
  stock_after     INTEGER              CHECK (stock_after >= 0),   -- stock slot après cet événement

  -- Données libres (error_code, firmware_version, operator_id…)
  payload         JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps (séparés pour la robustesse offline)
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),              -- horodatage ESP32 local (offline-safe)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),              -- horodatage d'arrivée dans Supabase

  -- Contraintes métier
  CONSTRAINT sale_requires_slot   CHECK (event_type_code != 'sale' OR slot_id  IS NOT NULL),
  CONSTRAINT sale_requires_amount CHECK (event_type_code != 'sale' OR amount   IS NOT NULL),
  CONSTRAINT restock_requires_slot CHECK (event_type_code != 'restock' OR slot_id IS NOT NULL)
);

COMMENT ON TABLE  slot_events IS '*** SOURCE DE VÉRITÉ *** — tous les événements machine. Table append-only (pas de UPDATE/DELETE).';
COMMENT ON COLUMN slot_events.recorded_at   IS 'Horodatage local ESP32 — permet la reconstitution chronologique en cas de perte réseau.';
COMMENT ON COLUMN slot_events.stock_delta   IS '-1 pour une vente, +N pour un remplissage, NULL pour les événements sans impact stock.';
COMMENT ON COLUMN slot_events.payload       IS 'JSON libre : error_code, firmware_version, operator_id, terminal_id, etc.';
COMMENT ON COLUMN slot_events.amount        IS 'Montant CB encaissé en EUR (1.00 pour un spray standard).';


-- =============================================================================
-- TRIGGER : mise à jour de machines.last_seen_at
-- Chaque événement reçu de l'ESP32 actualise la date de dernière activité.
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_update_machine_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE machines
  SET last_seen_at = NEW.created_at,
      updated_at   = NOW()
  WHERE id = NEW.machine_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_slot_event_update_machine_last_seen
  AFTER INSERT ON slot_events
  FOR EACH ROW EXECUTE FUNCTION trigger_update_machine_last_seen();


-- =============================================================================
-- TRIGGER : mise à jour du stock du slot
-- Applique stock_delta sur machine_slots.current_stock à chaque événement.
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_update_slot_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slot_id IS NOT NULL AND NEW.stock_delta IS NOT NULL THEN
    UPDATE machine_slots
    SET current_stock     = GREATEST(0, current_stock + NEW.stock_delta),
        last_restocked_at = CASE WHEN NEW.stock_delta > 0 THEN NOW() ELSE last_restocked_at END,
        updated_at        = NOW()
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_slot_event_update_stock
  AFTER INSERT ON slot_events
  FOR EACH ROW EXECUTE FUNCTION trigger_update_slot_stock();


-- =============================================================================
-- INDEXES — optimisés pour les requêtes dashboard et ESP32
-- =============================================================================

-- Requêtes par machine (le plus fréquent)
CREATE INDEX idx_slot_events_machine_id      ON slot_events (machine_id);
CREATE INDEX idx_slot_events_slot_id         ON slot_events (slot_id);
CREATE INDEX idx_slot_events_event_type      ON slot_events (event_type_code);

-- Requêtes temporelles — KPIs journaliers, hebdo, mensuel
CREATE INDEX idx_slot_events_created_at      ON slot_events (created_at DESC);
CREATE INDEX idx_slot_events_machine_date    ON slot_events (machine_id, created_at DESC);

-- Index partiel ventes uniquement — vue financière
CREATE INDEX idx_slot_events_sales           ON slot_events (machine_id, created_at DESC)
  WHERE event_type_code = 'sale';

-- Recherche par payload JSONB (error_code, firmware, etc.)
CREATE INDEX idx_slot_events_payload         ON slot_events USING GIN (payload);

-- Machines et slots
CREATE INDEX idx_machines_location_id        ON machines (location_id);
CREATE INDEX idx_machines_status             ON machines (status);
CREATE INDEX idx_machine_slots_machine_id    ON machine_slots (machine_id);
CREATE INDEX idx_machine_slots_perfume_id    ON machine_slots (perfume_id);
CREATE INDEX idx_machine_slots_low_stock     ON machine_slots (machine_id)
  WHERE current_stock <= low_stock_threshold AND is_active = TRUE;


-- =============================================================================
-- VUE : machine_financials
-- CA et métriques financières par machine — dashboard CEO
-- =============================================================================

CREATE OR REPLACE VIEW machine_financials AS
WITH sales AS (
  SELECT
    machine_id,
    COUNT(*)                                                          AS total_sales,
    COALESCE(SUM(amount), 0)                                          AS total_revenue,

    COUNT(*)    FILTER (WHERE created_at >= CURRENT_DATE)             AS sales_today,
    COALESCE(SUM(amount) FILTER (
      WHERE created_at >= CURRENT_DATE), 0)                          AS revenue_today,

    COUNT(*)    FILTER (WHERE created_at >= date_trunc('week',  NOW())) AS sales_this_week,
    COALESCE(SUM(amount) FILTER (
      WHERE created_at >= date_trunc('week',  NOW())), 0)             AS revenue_this_week,

    COUNT(*)    FILTER (WHERE created_at >= date_trunc('month', NOW())) AS sales_this_month,
    COALESCE(SUM(amount) FILTER (
      WHERE created_at >= date_trunc('month', NOW())), 0)             AS revenue_this_month,

    COUNT(*)    FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS sales_30d,
    COALESCE(SUM(amount) FILTER (
      WHERE created_at >= NOW() - INTERVAL '30 days'), 0)             AS revenue_30d
  FROM slot_events
  WHERE event_type_code = 'sale'
  GROUP BY machine_id
)
SELECT
  m.id                              AS machine_id,
  m.serial_number,
  l.name                            AS location_name,
  l.city,
  l.location_type,
  l.revenue_share_pct,
  m.status                          AS machine_status,
  m.last_seen_at,

  COALESCE(s.total_sales,        0) AS total_sales,
  COALESCE(s.total_revenue,      0) AS total_revenue,
  COALESCE(s.sales_today,        0) AS sales_today,
  COALESCE(s.revenue_today,      0) AS revenue_today,
  COALESCE(s.sales_this_week,    0) AS sales_this_week,
  COALESCE(s.revenue_this_week,  0) AS revenue_this_week,
  COALESCE(s.sales_this_month,   0) AS sales_this_month,
  COALESCE(s.revenue_this_month, 0) AS revenue_this_month,
  COALESCE(s.sales_30d,          0) AS sales_30d,
  COALESCE(s.revenue_30d,        0) AS revenue_30d,

  -- Part partenaire emplacement (30j)
  ROUND(COALESCE(s.revenue_30d, 0) *      l.revenue_share_pct  / 100, 2) AS partner_share_30d,
  -- CA net Pulvis (30j)
  ROUND(COALESCE(s.revenue_30d, 0) * (1 - l.revenue_share_pct  / 100), 2) AS pulvis_net_30d

FROM machines m
LEFT JOIN locations l ON m.location_id = l.id
LEFT JOIN sales     s ON m.id = s.machine_id;

COMMENT ON VIEW machine_financials IS
  'Vue financière par machine : CA total / jour / semaine / mois / 30j. Part partenaire et net Pulvis calculés. Référence dashboard CEO.';


-- =============================================================================
-- VUE : machine_kpis
-- Statut opérationnel et KPIs de performance Pulvis par machine
-- Seuils : ≥40 → SCALE / ≥30 → GO / ≥20 → BON / ≥10 → SURVEILLER / <10 → CORRIGER
-- =============================================================================

CREATE OR REPLACE VIEW machine_kpis AS
WITH daily_sales AS (
  -- Sprays par jour sur les 30 derniers jours (base pour la moyenne)
  SELECT
    machine_id,
    DATE(created_at) AS sale_date,
    COUNT(*)         AS sprays_count
  FROM slot_events
  WHERE event_type_code = 'sale'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY machine_id, DATE(created_at)
),
averages AS (
  SELECT
    machine_id,
    ROUND(AVG(sprays_count), 1) AS avg_sprays_per_day_30d,
    SUM(sprays_count)           AS total_sprays_30d
  FROM daily_sales
  GROUP BY machine_id
),
today_sales AS (
  SELECT
    machine_id,
    COUNT(*) AS sprays_today
  FROM slot_events
  WHERE event_type_code = 'sale'
    AND created_at >= CURRENT_DATE
  GROUP BY machine_id
),
week_sales AS (
  SELECT
    machine_id,
    COUNT(*) AS sprays_7d
  FROM slot_events
  WHERE event_type_code = 'sale'
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY machine_id
),
slot_stock AS (
  SELECT
    machine_id,
    COUNT(*)  FILTER (WHERE is_active)                                    AS active_slots,
    COUNT(*)  FILTER (WHERE current_stock = 0 AND is_active)              AS empty_slots,
    COUNT(*)  FILTER (WHERE current_stock <= low_stock_threshold
                        AND current_stock > 0 AND is_active)              AS low_stock_slots,
    SUM(current_stock)                                                    AS total_stock
  FROM machine_slots
  GROUP BY machine_id
)
SELECT
  m.id                            AS machine_id,
  m.serial_number,
  l.name                          AS location_name,
  l.city,
  l.location_type,
  m.status                        AS machine_status,
  m.last_seen_at,
  m.installed_at,

  -- Activité
  COALESCE(t.sprays_today,              0)  AS sprays_today,
  COALESCE(w.sprays_7d,                 0)  AS sprays_7d,
  COALESCE(a.total_sprays_30d,          0)  AS sprays_30d,
  COALESCE(a.avg_sprays_per_day_30d,    0)  AS avg_sprays_per_day_30d,

  -- Statut KPI (basé sur la moyenne des 30 derniers jours)
  CASE
    WHEN COALESCE(a.avg_sprays_per_day_30d, 0) >= 40 THEN 'SCALE'
    WHEN COALESCE(a.avg_sprays_per_day_30d, 0) >= 30 THEN 'GO'
    WHEN COALESCE(a.avg_sprays_per_day_30d, 0) >= 20 THEN 'BON'
    WHEN COALESCE(a.avg_sprays_per_day_30d, 0) >= 10 THEN 'SURVEILLER'
    ELSE 'CORRIGER'
  END                                       AS kpi_status,

  -- Stock
  COALESCE(ss.active_slots,             0)  AS active_slots,
  COALESCE(ss.empty_slots,              0)  AS empty_slots,
  COALESCE(ss.low_stock_slots,          0)  AS low_stock_slots,
  COALESCE(ss.total_stock,              0)  AS total_stock,

  -- Flags d'alerte (pour le dashboard)
  COALESCE(ss.empty_slots, 0) > 0           AS has_empty_slot,
  COALESCE(ss.low_stock_slots, 0) > 0       AS has_low_stock,
  (m.last_seen_at IS NULL
    OR m.last_seen_at < NOW() - INTERVAL '2 hours') AS is_offline_suspected

FROM machines m
LEFT JOIN locations   l  ON m.location_id = l.id
LEFT JOIN averages    a  ON m.id = a.machine_id
LEFT JOIN today_sales t  ON m.id = t.machine_id
LEFT JOIN week_sales  w  ON m.id = w.machine_id
LEFT JOIN slot_stock  ss ON m.id = ss.machine_id;

COMMENT ON VIEW machine_kpis IS
  'KPIs opérationnels par machine : statut (SCALE/GO/BON/SURVEILLER/CORRIGER), stock, alertes. Référence principale dashboard CEO.';


-- =============================================================================
-- RLS — Row Level Security
-- Supabase : service_role bypasse RLS par défaut (pas de policy nécessaire).
-- =============================================================================

ALTER TABLE locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfumes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types   ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_events   ENABLE ROW LEVEL SECURITY;

-- authenticated (dashboard CEO / ops) : lecture totale
CREATE POLICY "auth_read_locations"     ON locations     FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "auth_read_perfumes"      ON perfumes      FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "auth_read_machines"      ON machines      FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "auth_read_machine_slots" ON machine_slots FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "auth_read_event_types"   ON event_types   FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "auth_read_slot_events"   ON slot_events   FOR SELECT TO authenticated USING (TRUE);

-- authenticated : écriture sur les tables opérationnelles (hors slot_events direct)
CREATE POLICY "auth_write_machines"      ON machines      FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "auth_write_machine_slots" ON machine_slots FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "auth_write_locations"     ON locations     FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "auth_write_perfumes"      ON perfumes      FOR ALL TO authenticated USING (TRUE);

-- anon (ESP32 avec clé anon) : INSERT uniquement sur slot_events
-- L'ESP32 n'a pas accès en lecture aux données financières.
CREATE POLICY "anon_insert_slot_events"  ON slot_events   FOR INSERT TO anon WITH CHECK (TRUE);

-- anon : lecture du référentiel pour la validation firmware
CREATE POLICY "anon_read_event_types"    ON event_types   FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_machines"       ON machines      FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_machine_slots"  ON machine_slots FOR SELECT TO anon USING (TRUE);


-- =============================================================================
-- FONCTION RPC : record_sale
-- Enregistrement atomique d'une vente — appelée directement par l'ESP32.
-- Gère : vérification stock, INSERT slot_event, alertes low_stock / out_of_stock.
-- Utilise SELECT FOR UPDATE pour éviter les race conditions.
-- =============================================================================

CREATE OR REPLACE FUNCTION record_sale(
  p_machine_id  UUID,
  p_slot_id     UUID,
  p_amount      NUMERIC      DEFAULT 1.00,
  p_recorded_at TIMESTAMPTZ  DEFAULT NOW(),
  p_payload     JSONB        DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot        machine_slots%ROWTYPE;
  v_event_id    UUID;
  v_stock_after INTEGER;
BEGIN
  -- Verrouiller le slot pour éviter les ventes simultanées (race condition)
  SELECT * INTO v_slot
  FROM machine_slots
  WHERE id = p_slot_id
    AND machine_id = p_machine_id
    AND is_active  = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error',   'slot_not_found',
      'message', 'Slot introuvable ou inactif pour cette machine'
    );
  END IF;

  -- Vérifier le stock
  IF v_slot.current_stock <= 0 THEN
    INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at)
    VALUES (p_machine_id, p_slot_id, 'out_of_stock',
            p_payload || jsonb_build_object('stock_remaining', 0), p_recorded_at);

    RETURN jsonb_build_object(
      'success', FALSE,
      'error',   'out_of_stock',
      'message', 'Stock épuisé pour ce slot'
    );
  END IF;

  v_stock_after := v_slot.current_stock - 1;

  -- Insérer l'événement de vente (le trigger met à jour le stock et last_seen_at)
  INSERT INTO slot_events (
    machine_id, slot_id, event_type_code,
    amount, stock_delta, stock_after,
    payload, recorded_at
  )
  VALUES (
    p_machine_id, p_slot_id, 'sale',
    p_amount, -1, v_stock_after,
    p_payload, p_recorded_at
  )
  RETURNING id INTO v_event_id;

  -- Alerte stock bas (après la vente, avant rupture)
  IF v_stock_after > 0 AND v_stock_after <= v_slot.low_stock_threshold THEN
    INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at)
    VALUES (
      p_machine_id, p_slot_id, 'low_stock_alert',
      jsonb_build_object(
        'stock_remaining', v_stock_after,
        'threshold',       v_slot.low_stock_threshold
      ),
      p_recorded_at
    );
  END IF;

  -- Alerte rupture (slot vide après cette vente)
  IF v_stock_after = 0 THEN
    INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at)
    VALUES (
      p_machine_id, p_slot_id, 'out_of_stock',
      jsonb_build_object('stock_remaining', 0),
      p_recorded_at
    );
  END IF;

  RETURN jsonb_build_object(
    'success',     TRUE,
    'event_id',    v_event_id,
    'stock_after', v_stock_after
  );
END;
$$;

COMMENT ON FUNCTION record_sale IS
  'RPC appelée par l''ESP32 pour enregistrer une vente de façon atomique. Gère le verrouillage de stock, les alertes et retourne le résultat à la machine.';

GRANT EXECUTE ON FUNCTION record_sale TO anon;


-- =============================================================================
-- FONCTION RPC : record_restock
-- Remplissage d'un slot — appelée par un technicien Pulvis (rôle authenticated).
-- =============================================================================

CREATE OR REPLACE FUNCTION record_restock(
  p_machine_id UUID,
  p_slot_id    UUID,
  p_quantity   INTEGER,
  p_payload    JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot        machine_slots%ROWTYPE;
  v_event_id    UUID;
  v_stock_after INTEGER;
BEGIN
  SELECT * INTO v_slot
  FROM machine_slots
  WHERE id = p_slot_id AND machine_id = p_machine_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'slot_not_found');
  END IF;

  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'invalid_quantity',
                              'message', 'La quantité doit être > 0');
  END IF;

  -- Plafonner au maximum de la capacité
  v_stock_after := LEAST(v_slot.current_stock + p_quantity, v_slot.capacity);

  INSERT INTO slot_events (
    machine_id, slot_id, event_type_code,
    stock_delta, stock_after, payload
  )
  VALUES (
    p_machine_id, p_slot_id, 'restock',
    p_quantity, v_stock_after,
    p_payload || jsonb_build_object(
      'stock_before',  v_slot.current_stock,
      'stock_after',   v_stock_after,
      'quantity_added', p_quantity
    )
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'success',      TRUE,
    'event_id',     v_event_id,
    'stock_before', v_slot.current_stock,
    'stock_after',  v_stock_after
  );
END;
$$;

COMMENT ON FUNCTION record_restock IS
  'RPC pour les techniciens Pulvis — remplissage d''un slot avec plafonnement à la capacité et log d''événement.';

GRANT EXECUTE ON FUNCTION record_restock TO authenticated;


-- =============================================================================
-- SEED : données de démonstration
-- =============================================================================

-- Emplacement de démo
INSERT INTO locations (id, name, address, city, postal_code, location_type, revenue_share_pct, notes)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Centre Commercial Les Halles',
  '101 Porte Berger',
  'Paris', '75001',
  'mall',
  10.00,
  'Emplacement prototype — machine de démo'
);

-- Parfums de démo (5 best-sellers)
INSERT INTO perfumes (id, name, brand, reference, price_per_spray, cost_per_spray, gender, family) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Sauvage',          'Dior',    'DIOR-SAU', 1.00, 0.15, 'homme', 'boisé'),
  ('b0000000-0000-0000-0000-000000000002', 'Bleu de Chanel',   'Chanel',  'CHA-BLC',  1.00, 0.18, 'homme', 'boisé'),
  ('b0000000-0000-0000-0000-000000000003', 'La Vie est Belle', 'Lancôme', 'LAN-LVB',  1.00, 0.14, 'femme', 'gourmand'),
  ('b0000000-0000-0000-0000-000000000004', 'Black Opium',      'YSL',     'YSL-BLO',  1.00, 0.16, 'femme', 'oriental'),
  ('b0000000-0000-0000-0000-000000000005', 'Acqua di Gio',     'Armani',  'ARM-ADG',  1.00, 0.12, 'homme', 'aquatique');

-- Machine prototype
INSERT INTO machines (id, serial_number, location_id, status, installed_at, firmware_version)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'PUL-2024-001',
  'a0000000-0000-0000-0000-000000000001',
  'active',
  NOW(),
  '1.0.0'
);

-- 5 slots de la machine prototype
INSERT INTO machine_slots (id, machine_id, slot_position, perfume_id, capacity, current_stock, low_stock_threshold)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 1, 'b0000000-0000-0000-0000-000000000001', 500, 490, 50),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 2, 'b0000000-0000-0000-0000-000000000002', 500, 485, 50),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 3, 'b0000000-0000-0000-0000-000000000003', 500, 492, 50),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 4, 'b0000000-0000-0000-0000-000000000004', 500, 478, 50),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 5, 'b0000000-0000-0000-0000-000000000005', 500, 495, 50);

-- Ventes de démo sur 30 jours (pour que les vues machine_kpis et machine_financials aient des données)
-- Simule ~25 ventes/jour → statut "BON emplacement"
INSERT INTO slot_events (machine_id, slot_id, event_type_code, amount, stock_delta, stock_after, recorded_at, created_at)
SELECT
  'c0000000-0000-0000-0000-000000000001',
  ('d0000000-0000-0000-0000-00000000000' || ((gs % 5) + 1))::uuid,
  'sale',
  1.00,
  -1,
  480 - (gs / 5),
  NOW() - (INTERVAL '1 minute' * gs * 60),
  NOW() - (INTERVAL '1 minute' * gs * 60)
FROM generate_series(1, 750) gs;  -- 750 ventes ≈ 25/jour sur 30 jours
