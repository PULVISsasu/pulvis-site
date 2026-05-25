-- =============================================================================
-- PULVIS — Simulation 30 jours — machine test MTEST-001
-- Fichier      : 003_simulate_mtest001.sql
-- Prérequis    : 001_init.sql appliqué (schéma + parfums seed)
-- Usage        : test des vues machine_kpis et machine_financials
--                JAMAIS en production
-- =============================================================================
--
-- Profil simulé : centre commercial moyen (progression + cycles semaine)
--
--   Sem 1 : 12–35 sprays/j  →  moyenne ~23/j  →  BON
--   Sem 2 : 14–38 sprays/j  →  moyenne ~25/j  →  BON
--   Sem 3 : 16–40 sprays/j  →  moyenne ~27/j  →  BON / GO
--   Sem 4 : 18–42 sprays/j  →  moyenne ~31/j  →  GO / SCALE
--
--   Total 30 j   : 792 ventes
--   Moyenne 30 j : ~26,4 sprays/j  →  KPI attendu : BON
--   CA simulé    :  792 €
--
-- Distribution par parfum (slot):
--   Slot 1 — Sauvage Dior          30 %  → ~238 ventes
--   Slot 2 — Bleu de Chanel        25 %  → ~198 ventes
--   Slot 3 — La Vie est Belle      20 %  → ~158 ventes
--   Slot 4 — Black Opium YSL       15 %  → ~119 ventes
--   Slot 5 — Acqua di Gio Armani   10 %  →  ~79 ventes
--
-- Distribution horaire (sur 20 créneaux) :
--   08h  10 %   10h  15 %   12h  20 %   14h  10 %
--   16h  15 %   18h  20 %   20h  10 %
--
-- UUIDs fixes (stable, rejouable) :
--   Machine  : e0000000-0000-0000-0000-000000000001
--   Slots    : e100…0001 à e100…0005
--   Location : a0000000-0000-0000-0000-000000000099
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- RESET — nettoyer les données précédentes de MTEST-001
-- (idempotent : ce script peut être rejoué à tout moment)
-- ---------------------------------------------------------------------------

DELETE FROM slot_events
  WHERE machine_id = 'e0000000-0000-0000-0000-000000000001';

DELETE FROM machine_slots
  WHERE machine_id = 'e0000000-0000-0000-0000-000000000001';

DELETE FROM machines
  WHERE id = 'e0000000-0000-0000-0000-000000000001';


-- ---------------------------------------------------------------------------
-- EMPLACEMENT TEST
-- ---------------------------------------------------------------------------

INSERT INTO locations (id, name, address, city, postal_code, location_type, revenue_share_pct, notes)
VALUES (
  'a0000000-0000-0000-0000-000000000099',
  'Emplacement Test — Simulation',
  '1 Rue du Test',
  'Paris', '75000',
  'mall',
  0.00,
  'Emplacement fictif pour tests SQL — ne pas déployer'
)
ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- MACHINE TEST
-- ---------------------------------------------------------------------------

INSERT INTO machines (id, serial_number, location_id, status, installed_at, firmware_version)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'MTEST-001',
  'a0000000-0000-0000-0000-000000000099',
  'active',
  NOW() - INTERVAL '31 days',
  '1.0.0-sim'
);


-- ---------------------------------------------------------------------------
-- 5 SLOTS — stock initialisé à 500 (plein)
-- Les triggers décrémenteront current_stock à chaque vente insérée
-- ---------------------------------------------------------------------------

INSERT INTO machine_slots
  (id, machine_id, slot_position, perfume_id, capacity, current_stock, low_stock_threshold)
VALUES
  -- Slot 1 : Sauvage Dior
  ('e1000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000001', 1,
   'b0000000-0000-0000-0000-000000000001', 500, 500, 60),

  -- Slot 2 : Bleu de Chanel
  ('e1000000-0000-0000-0000-000000000002',
   'e0000000-0000-0000-0000-000000000001', 2,
   'b0000000-0000-0000-0000-000000000002', 500, 500, 60),

  -- Slot 3 : La Vie est Belle
  ('e1000000-0000-0000-0000-000000000003',
   'e0000000-0000-0000-0000-000000000001', 3,
   'b0000000-0000-0000-0000-000000000003', 500, 500, 60),

  -- Slot 4 : Black Opium
  ('e1000000-0000-0000-0000-000000000004',
   'e0000000-0000-0000-0000-000000000001', 4,
   'b0000000-0000-0000-0000-000000000004', 500, 500, 60),

  -- Slot 5 : Acqua di Gio
  ('e1000000-0000-0000-0000-000000000005',
   'e0000000-0000-0000-0000-000000000001', 5,
   'b0000000-0000-0000-0000-000000000005', 500, 500, 60);


-- ===========================================================================
-- VENTES SIMULÉES — 792 sprays sur 30 jours
--
-- Architecture du CTE :
--   1. daily_plan     → 30 lignes (date + cible de ventes)
--   2. sales_expanded → 1 ligne par vente (date × generate_series)
--   3. sales_timed    → ajout slot_id, heure, minute (déterministes)
--   4. INSERT final   → slot_events
-- ===========================================================================

WITH

-- ---------------------------------------------------------------------------
-- ÉTAPE 1 : plan journalier
-- Pattern : creux lundi, montée jeudi-vendredi, pic week-end
-- Semaines 3-4 légèrement plus fortes (machine qui prend de la traction)
-- ---------------------------------------------------------------------------
daily_plan (day_offset, target_count) AS (
  VALUES
  --  J    Sprays    Jour simulé             Contexte
  (  1,  12 ),  -- Lundi   S-4   démarrage lent
  (  2,  15 ),  -- Mardi
  (  3,  22 ),  -- Mercredi
  (  4,  18 ),  -- Jeudi
  (  5,  25 ),  -- Vendredi
  (  6,  35 ),  -- Samedi   ← pic week-end
  (  7,  30 ),  -- Dimanche

  (  8,  14 ),  -- Lundi   S-3
  (  9,  20 ),
  ( 10,  24 ),
  ( 11,  22 ),
  ( 12,  28 ),
  ( 13,  38 ),  -- Samedi
  ( 14,  32 ),  -- Dimanche

  ( 15,  16 ),  -- Lundi   S-2
  ( 16,  22 ),
  ( 17,  26 ),
  ( 18,  24 ),
  ( 19,  30 ),
  ( 20,  40 ),  -- Samedi   ← meilleur jour
  ( 21,  35 ),

  ( 22,  18 ),  -- Lundi   S-1
  ( 23,  25 ),
  ( 24,  30 ),
  ( 25,  28 ),
  ( 26,  35 ),
  ( 27,  42 ),  -- Samedi   ← record
  ( 28,  38 ),

  ( 29,  20 ),  -- Hier
  ( 30,  28 )   -- Aujourd'hui (partiel — simulation en cours)
),

-- ---------------------------------------------------------------------------
-- ÉTAPE 2 : explosion en lignes individuelles (1 ligne = 1 spray)
-- ---------------------------------------------------------------------------
sales_expanded AS (
  SELECT
    (CURRENT_DATE - (30 - dp.day_offset))::date  AS sale_date,
    s.sale_num
  FROM daily_plan dp
  CROSS JOIN LATERAL generate_series(1, dp.target_count) AS s(sale_num)
),

-- ---------------------------------------------------------------------------
-- ÉTAPE 3 : assignation déterministe du slot et de l'heure
--
--   Slot   → sale_num % 20       (modulo 20 → 7 valeurs différentes)
--   Heure  → (sale_num*3+7) % 20 (modulo décalé → décorréler slot/heure)
--   Minute → (sale_num*11 + sale_num%23 + sale_num%17) % 60
-- ---------------------------------------------------------------------------
sales_timed AS (
  SELECT
    sale_date,
    sale_num,

    -- Slot : distribution pondérée par popularité parfum
    CASE
      WHEN (sale_num % 20) BETWEEN 0  AND 5  THEN 'e1000000-0000-0000-0000-000000000001'  -- 30 % Sauvage
      WHEN (sale_num % 20) BETWEEN 6  AND 10 THEN 'e1000000-0000-0000-0000-000000000002'  -- 25 % Bleu Chanel
      WHEN (sale_num % 20) BETWEEN 11 AND 14 THEN 'e1000000-0000-0000-0000-000000000003'  -- 20 % La Vie est Belle
      WHEN (sale_num % 20) BETWEEN 15 AND 17 THEN 'e1000000-0000-0000-0000-000000000004'  -- 15 % Black Opium
      ELSE                                        'e1000000-0000-0000-0000-000000000005'  -- 10 % Acqua di Gio
    END::uuid  AS slot_id,

    -- Heure : distribution réaliste (pic midi et soirée)
    CASE
      WHEN ((sale_num * 3 + 7) % 20) BETWEEN 0  AND 1  THEN  8  -- 10 % matin tôt
      WHEN ((sale_num * 3 + 7) % 20) BETWEEN 2  AND 4  THEN 10  -- 15 % matin
      WHEN ((sale_num * 3 + 7) % 20) BETWEEN 5  AND 8  THEN 12  -- 20 % déjeuner ← pic
      WHEN ((sale_num * 3 + 7) % 20) BETWEEN 9  AND 10 THEN 14  -- 10 % après-midi
      WHEN ((sale_num * 3 + 7) % 20) BETWEEN 11 AND 13 THEN 16  -- 15 % fin après-midi
      WHEN ((sale_num * 3 + 7) % 20) BETWEEN 14 AND 17 THEN 18  -- 20 % soirée ← pic
      ELSE                                                    20  -- 10 % soirée tardive
    END  AS sale_hour,

    -- Minute : pseudo-aléatoire déterministe dans [0, 59]
    (sale_num * 11 + sale_num % 23 + sale_num % 17) % 60  AS sale_minute

  FROM sales_expanded
),

-- ---------------------------------------------------------------------------
-- ÉTAPE 4 : construction du timestamp final
-- ---------------------------------------------------------------------------
sales_final AS (
  SELECT
    slot_id,
    sale_date::timestamp
      + make_interval(hours => sale_hour, mins => sale_minute)  AS event_ts
  FROM sales_timed
)

-- ---------------------------------------------------------------------------
-- INSERT dans slot_events
-- stock_delta = -1 → le trigger on_slot_event_update_stock décrémente
--               machine_slots.current_stock automatiquement
-- ---------------------------------------------------------------------------
INSERT INTO slot_events
  (machine_id, slot_id, event_type_code, amount, stock_delta, payload, recorded_at, created_at)
SELECT
  'e0000000-0000-0000-0000-000000000001'::uuid,
  slot_id,
  'sale',
  1.00,
  -1,
  '{"source": "simulation", "script": "003_simulate_mtest001"}'::jsonb,
  event_ts,
  event_ts
FROM sales_final;


-- ===========================================================================
-- HEARTBEATS — signal de vie toutes les heures sur 30 jours
-- ===========================================================================

INSERT INTO slot_events
  (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
SELECT
  'e0000000-0000-0000-0000-000000000001',
  NULL,
  'heartbeat',
  jsonb_build_object(
    'firmware_version', '1.0.0-sim',
    'wifi_rssi',        -50 - (gs % 15),   -- variance RSSI simulée [-50, -64]
    'uptime_h',         gs,
    'source',           'simulation'
  ),
  NOW() - (gs * INTERVAL '1 hour'),
  NOW() - (gs * INTERVAL '1 hour')
FROM generate_series(1, 720) gs;   -- 30 jours × 24 h


-- ===========================================================================
-- ÉVÉNEMENTS OPÉRATIONNELS — pour enrichir l'historique
-- ===========================================================================

-- Boot initial (machine installée J-31)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
VALUES (
  'e0000000-0000-0000-0000-000000000001', NULL, 'boot',
  '{"firmware_version": "1.0.0-sim", "reason": "first_boot", "source": "simulation"}',
  NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days'
);

-- 3 paiements refusés (taux normal < 0,5 %)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
VALUES
  ('e0000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001', 'payment_failed',
   '{"error_code": "CB_DECLINED", "terminal_id": "SIM-TRM-001", "source": "simulation"}',
   NOW() - INTERVAL '22 days 14 hours 23 minutes',
   NOW() - INTERVAL '22 days 14 hours 23 minutes'),

  ('e0000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003', 'payment_failed',
   '{"error_code": "CB_TIMEOUT", "terminal_id": "SIM-TRM-001", "source": "simulation"}',
   NOW() - INTERVAL '11 days 18 hours 07 minutes',
   NOW() - INTERVAL '11 days 18 hours 07 minutes'),

  ('e0000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000002', 'payment_failed',
   '{"error_code": "CB_DECLINED", "terminal_id": "SIM-TRM-001", "source": "simulation"}',
   NOW() - INTERVAL '3 days 11 hours 41 minutes',
   NOW() - INTERVAL '3 days 11 hours 41 minutes');

-- 1 échec de dispense (incident isolé, J-16)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000004', 'dispense_failed',
  '{"error_code": "SERVO_JAM", "terminal_id": "SIM-TRM-001", "amount_refunded": true, "source": "simulation"}',
  NOW() - INTERVAL '16 days 15 hours 52 minutes',
  NOW() - INTERVAL '16 days 15 hours 52 minutes'
);

-- Maintenance (suite à l'incident servo)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
VALUES
  ('e0000000-0000-0000-0000-000000000001', NULL, 'maintenance_start',
   '{"operator": "tech_sim", "reason": "servo_jam_slot4", "source": "simulation"}',
   NOW() - INTERVAL '15 days 10 hours',
   NOW() - INTERVAL '15 days 10 hours'),
  ('e0000000-0000-0000-0000-000000000001', NULL, 'maintenance_end',
   '{"operator": "tech_sim", "notes": "Servo slot 4 nettoyé et recalibré. RAS.", "duration_min": 25, "source": "simulation"}',
   NOW() - INTERVAL '15 days 9 hours 35 minutes',
   NOW() - INTERVAL '15 days 9 hours 35 minutes');

-- Alerte stock bas slot 1 (J-7 — Sauvage très demandé)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000001', 'low_stock_alert',
  '{"stock_remaining": 55, "threshold": 60, "source": "simulation"}',
  NOW() - INTERVAL '7 days 16 hours',
  NOW() - INTERVAL '7 days 16 hours'
);

-- Remplissage slot 1 le lendemain (J-6)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, stock_delta, stock_after, payload, recorded_at, created_at)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000001', 'restock',
  445, 500,
  '{"operator": "tech_sim", "notes": "Remplissage Sauvage Dior — slot 1", "source": "simulation"}',
  NOW() - INTERVAL '6 days 11 hours',
  NOW() - INTERVAL '6 days 11 hours'
);


-- ===========================================================================
-- VÉRIFICATION — résultats attendus
-- Décommenter pour contrôler le seed après exécution
-- ===========================================================================

/*
-- KPIs machine
SELECT
  serial_number,
  location_name,
  kpi_status,
  sprays_today,
  sprays_7d,
  avg_sprays_per_day_30d,
  active_slots,
  empty_slots,
  low_stock_slots,
  total_stock,
  is_offline_suspected
FROM machine_kpis
WHERE serial_number = 'MTEST-001';

-- Résultats attendus :
--   kpi_status            = 'BON'  (avg ~26,4 → ≥20 et <30)
--   sprays_today          = 28
--   avg_sprays_per_day_30d ≈ 26.4
--   active_slots          = 5
--   empty_slots           = 0
--   is_offline_suspected  = false

-- Métriques financières
SELECT
  serial_number,
  location_name,
  sales_today,
  revenue_today,
  sales_this_week,
  revenue_this_week,
  sales_30d,
  revenue_30d,
  pulvis_net_30d
FROM machine_financials
WHERE serial_number = 'MTEST-001';

-- Résultats attendus :
--   revenue_today         = 28.00 €
--   revenue_30d           = 792.00 €
--   pulvis_net_30d        = 792.00 € (pas de partage partenaire sur emplacement test)

-- Distribution des ventes par parfum
SELECT
  p.name          AS parfum,
  ms.slot_position,
  COUNT(*)        AS nb_ventes,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM slot_events se
JOIN machine_slots ms ON ms.id = se.slot_id
JOIN perfumes p       ON p.id  = ms.perfume_id
WHERE se.machine_id     = 'e0000000-0000-0000-0000-000000000001'
  AND se.event_type_code = 'sale'
GROUP BY p.name, ms.slot_position
ORDER BY ms.slot_position;

-- Résultats attendus :
--   Sauvage          ≈ 30 %
--   Bleu de Chanel   ≈ 25 %
--   La Vie est Belle ≈ 20 %
--   Black Opium      ≈ 15 %
--   Acqua di Gio     ≈ 10 %

-- Stock restant par slot
SELECT slot_position, current_stock, low_stock_threshold
FROM machine_slots
WHERE machine_id = 'e0000000-0000-0000-0000-000000000001'
ORDER BY slot_position;

-- Résultats attendus (après trigger) :
--   Slot 1 Sauvage     : 500 - 238 + 445 = ~707 → plafonné à 500 (restock)
--   Slot 2 Bleu Chanel : 500 - 198 = ~302
--   Slot 3 Belle       : 500 - 158 = ~342
--   Slot 4 Black Opium : 500 - 119 = ~381
--   Slot 5 Acqua       : 500 -  79 = ~421

-- Volume journalier (graphique sparkline dashboard)
SELECT
  DATE(created_at) AS jour,
  COUNT(*)         AS sprays,
  CASE
    WHEN COUNT(*) >= 40 THEN 'SCALE'
    WHEN COUNT(*) >= 30 THEN 'GO'
    WHEN COUNT(*) >= 20 THEN 'BON'
    WHEN COUNT(*) >= 10 THEN 'SURVEILLER'
    ELSE 'CORRIGER'
  END AS statut_jour
FROM slot_events
WHERE machine_id      = 'e0000000-0000-0000-0000-000000000001'
  AND event_type_code = 'sale'
GROUP BY DATE(created_at)
ORDER BY jour;
*/

COMMIT;
