-- =============================================================================
-- PULVIS — BMF-001 · Simulation 30 jours · Circle Club Auteuil
-- Migration    : 006_bmf001_simulation.sql
-- Prérequis    : 005_bmf001_setup.sql
-- =============================================================================
-- Profil emplacement : salle de sport premium Paris 16e · 6h-23h · 7j/7
--
-- Paramètres simulation :
--   Parfums : Self ≈ 25% · Indomptable ≈ 25% · Love Intense ≈ 20%
--             Life ≈ 15% · Intense ≈ 15%
--   Self et Indomptable légèrement dominants (audience gym mixte)
--
--   Pics horaires (profil gym post-entraînement) :
--     06-08h  10%  (séance matin tôt)
--     08-11h  15%  (avant le travail)
--     11-14h  15%  (pause déjeuner)
--     14-17h  10%  (creux après-midi)
--     17-20h  35%  ← PIC PRINCIPAL (après le travail / entraînement soir)
--     20-23h  15%  (soirée tardive)
--
--   Volume journalier (semaine montante + week-end plus faible) :
--     Lun/Mar/Mer : 22–31  →  trafic travail + gym
--     Jeu/Ven     : 30–38  →  pic semaine (sortie week-end, motivation)
--     Sam/Dim     : 17–23  →  gym moins fréquentée le matin, trafic décalé
--
--   Total 30j : 800 sprays · moy. ≈ 26,7/j → KPI BON (≥20)
--   CA brut   : 800 €
--   Marge nette estimée ≈ 93%  (après COGS + Nayax commission + abonnement)
--
-- UUIDs stables :
--   Machine : f0000000-0000-0000-0000-000000000001
--   Slots   : f1100000-…-0001 à f1100000-…-0005
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- RESET — idempotent (rejouer ce script supprime et recrée toutes les données)
-- ---------------------------------------------------------------------------

DELETE FROM slot_events
  WHERE machine_id = 'f0000000-0000-0000-0000-000000000001';

UPDATE machine_slots
  SET current_stock = 1000, last_restocked_at = NULL
  WHERE machine_id  = 'f0000000-0000-0000-0000-000000000001';


-- ===========================================================================
-- VENTES SIMULÉES — 30 jours · profil salle de sport premium
-- ===========================================================================
-- Architecture CTE :
--   daily_plan    → 30 lignes (date + cible de ventes)
--   sales_expanded → 1 ligne par spray (CROSS JOIN generate_series)
--   sales_timed   → slot_id + heure + minute (déterministes, décorrélés)
--   INSERT final  → slot_events
-- ===========================================================================

WITH

-- ---------------------------------------------------------------------------
-- ÉTAPE 1 : plan journalier 30 jours
--
-- Pattern semaine gym (lun = J1) :
--   Lun-Mer : 22-31  (trafic avant/après travail)
--   Jeu-Ven : 30-38  (pic semaine, soirées)
--   Sam-Dim : 17-23  (trafic décalé, volume plus faible)
-- ---------------------------------------------------------------------------
daily_plan (day_offset, target_count) AS (
  VALUES
  -- J    Sprays  Jour semaine   Contexte
  (  1,  22 ),  -- Lundi S-1    démarrage semaine
  (  2,  26 ),  -- Mardi
  (  3,  25 ),  -- Mercredi
  (  4,  31 ),  -- Jeudi        ← pic semaine
  (  5,  35 ),  -- Vendredi     ← pic semaine + soirée
  (  6,  20 ),  -- Samedi       gym décalée
  (  7,  17 ),  -- Dimanche     plus calme

  (  8,  23 ),  -- Lundi S-2
  (  9,  27 ),  -- Mardi
  ( 10,  26 ),  -- Mercredi
  ( 11,  32 ),  -- Jeudi
  ( 12,  36 ),  -- Vendredi
  ( 13,  21 ),  -- Samedi
  ( 14,  18 ),  -- Dimanche

  ( 15,  24 ),  -- Lundi S-3
  ( 16,  28 ),  -- Mardi
  ( 17,  27 ),  -- Mercredi
  ( 18,  33 ),  -- Jeudi
  ( 19,  37 ),  -- Vendredi     ← meilleur vendredi
  ( 20,  22 ),  -- Samedi
  ( 21,  19 ),  -- Dimanche

  ( 22,  25 ),  -- Lundi S-4
  ( 23,  29 ),  -- Mardi
  ( 24,  28 ),  -- Mercredi
  ( 25,  34 ),  -- Jeudi
  ( 26,  38 ),  -- Vendredi     ← record semaine
  ( 27,  23 ),  -- Samedi
  ( 28,  20 ),  -- Dimanche

  ( 29,  26 ),  -- Hier (lundi)
  ( 30,  29 )   -- Aujourd'hui (partiel)
),

-- ---------------------------------------------------------------------------
-- ÉTAPE 2 : explosion (1 ligne = 1 spray)
-- ---------------------------------------------------------------------------
sales_expanded AS (
  SELECT
    (CURRENT_DATE - (30 - dp.day_offset))::date  AS sale_date,
    s.sale_num
  FROM daily_plan dp
  CROSS JOIN LATERAL generate_series(1, dp.target_count) AS s(sale_num)
),

-- ---------------------------------------------------------------------------
-- ÉTAPE 3 : assignation déterministe
--
-- SLOT — distribution par popularité parfum (modulo 20) :
--   Self        (slot 1) :  0–4   = 25%   mixte bestseller
--   Indomptable (slot 4) :  5–9   = 25%   homme bestseller
--   Love Intense(slot 2) : 10–13  = 20%   femme
--   Life        (slot 3) : 14–16  = 15%   mixte léger
--   Intense     (slot 5) : 17–19  = 15%   mixte oriental
--
-- HEURE — profil gym (modulo 20, décorré du slot via *3+11) :
--   0–1  → 7h  (10% : séance tôt le matin)
--   2–4  → 9h  (15% : avant le travail)
--   5–7  → 12h (15% : pause déjeuner)
--   8–9  → 15h (10% : creux après-midi)
--   10–16 → 18h (35% ← PIC : après le travail / post-entraînement)
--   17–19 → 21h (15% : soirée tardive)
-- ---------------------------------------------------------------------------
sales_timed AS (
  SELECT
    sale_date,
    sale_num,

    -- Slot : popularité parfum pondérée
    CASE
      WHEN (sale_num % 20) BETWEEN  0 AND  4 THEN 'f1100000-0000-0000-0000-000000000001'  -- 25% Self
      WHEN (sale_num % 20) BETWEEN  5 AND  9 THEN 'f1100000-0000-0000-0000-000000000004'  -- 25% Indomptable
      WHEN (sale_num % 20) BETWEEN 10 AND 13 THEN 'f1100000-0000-0000-0000-000000000002'  -- 20% Love Intense
      WHEN (sale_num % 20) BETWEEN 14 AND 16 THEN 'f1100000-0000-0000-0000-000000000003'  -- 15% Life
      ELSE                                        'f1100000-0000-0000-0000-000000000005'  -- 15% Intense
    END::uuid  AS slot_id,

    -- Heure : profil post-entraînement gym (pic 17h-20h)
    CASE
      WHEN ((sale_num * 3 + 11) % 20) BETWEEN  0 AND  1 THEN  7  -- 10% séance matin
      WHEN ((sale_num * 3 + 11) % 20) BETWEEN  2 AND  4 THEN  9  -- 15% avant travail
      WHEN ((sale_num * 3 + 11) % 20) BETWEEN  5 AND  7 THEN 12  -- 15% déjeuner
      WHEN ((sale_num * 3 + 11) % 20) BETWEEN  8 AND  9 THEN 15  -- 10% après-midi
      WHEN ((sale_num * 3 + 11) % 20) BETWEEN 10 AND 16 THEN 18  -- 35% ← PIC post-entraînement
      ELSE                                                    21  -- 15% soirée tardive
    END  AS sale_hour,

    -- Minute : pseudo-aléatoire déterministe [0-59]
    (sale_num * 13 + sale_num % 29 + sale_num % 19) % 60  AS sale_minute

  FROM sales_expanded
)

INSERT INTO slot_events
  (machine_id, slot_id, event_type_code, amount, stock_delta, payload, recorded_at, created_at)
SELECT
  'f0000000-0000-0000-0000-000000000001'::uuid,
  slot_id,
  'sale',
  1.00,
  -1,
  jsonb_build_object(
    'source',       'simulation',
    'script',       '006_bmf001_simulation',
    'machine_name', 'BMF-001',
    'location',     'Circle Club Auteuil'
  ),
  sale_date::timestamp + make_interval(hours => sale_hour, mins => sale_minute),
  sale_date::timestamp + make_interval(hours => sale_hour, mins => sale_minute)
FROM sales_timed;


-- ===========================================================================
-- HEARTBEATS — toutes les heures sur 30 jours (entre 6h et 23h)
-- Hors des horaires d'ouverture = pas de signal (réaliste)
-- ===========================================================================

INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
SELECT
  'f0000000-0000-0000-0000-000000000001',
  NULL,
  'heartbeat',
  jsonb_build_object(
    'firmware_version', '1.0.0-sim',
    'wifi_rssi',        -48 - (gs % 12),
    'uptime_h',          gs,
    'source',           'simulation'
  ),
  NOW() - (gs * INTERVAL '1 hour'),
  NOW() - (gs * INTERVAL '1 hour')
-- Uniquement entre 6h et 23h (17 créneaux/jour × 30 jours = 510 heartbeats)
FROM generate_series(1, 720) gs
WHERE EXTRACT(HOUR FROM (NOW() - (gs * INTERVAL '1 hour'))) BETWEEN 6 AND 22;


-- ===========================================================================
-- ÉVÉNEMENTS OPÉRATIONNELS — historique réaliste
-- ===========================================================================

-- Boot initial (machine installée J-31)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
VALUES (
  'f0000000-0000-0000-0000-000000000001', NULL, 'boot',
  '{"firmware_version": "1.0.0-sim", "reason": "first_boot", "source": "simulation"}',
  NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days'
);

-- 2 paiements refusés (taux normal < 0.3%)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at) VALUES
  ('f0000000-0000-0000-0000-000000000001',
   'f1100000-0000-0000-0000-000000000001', 'payment_failed',
   '{"error_code":"CB_DECLINED","terminal_id":"NYX-BMF001","source":"simulation"}',
   NOW() - INTERVAL '18 days 18 hours 12 minutes',
   NOW() - INTERVAL '18 days 18 hours 12 minutes'),
  ('f0000000-0000-0000-0000-000000000001',
   'f1100000-0000-0000-0000-000000000004', 'payment_failed',
   '{"error_code":"CB_TIMEOUT","terminal_id":"NYX-BMF001","source":"simulation"}',
   NOW() - INTERVAL '7 days 19 hours 43 minutes',
   NOW() - INTERVAL '7 days 19 hours 43 minutes');

-- Maintenance initiale + calibration (J-28)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', NULL, 'maintenance_start',
   '{"operator":"tech_pulvis","reason":"installation_calibration","source":"simulation"}',
   NOW() - INTERVAL '28 days 10 hours',
   NOW() - INTERVAL '28 days 10 hours'),
  ('f0000000-0000-0000-0000-000000000001', NULL, 'maintenance_end',
   '{"operator":"tech_pulvis","notes":"Calibration slots + test paiement Nayax OK","duration_min":45,"source":"simulation"}',
   NOW() - INTERVAL '28 days 9 hours 15 minutes',
   NOW() - INTERVAL '28 days 9 hours 15 minutes');

COMMIT;


-- ===========================================================================
-- VÉRIFICATION — décommenter pour valider après exécution
-- ===========================================================================
/*

-- 1. KPIs machine
SELECT
  serial_number,
  location_name,
  kpi_status,
  sprays_today,
  avg_sprays_per_day_30d,
  sprays_30d,
  active_slots,
  empty_slots,
  total_stock
FROM machine_kpis
WHERE serial_number = 'BMF-001';
-- Attendu : kpi_status = 'BON', avg ≈ 26.7, total_stock < 5000 (décrément par triggers)

-- 2. Économie machine
SELECT
  serial_number,
  simulation_mode,
  revenue_30d           AS "CA brut 30j (€)",
  cogs_30d              AS "COGS parfum (€)",
  nayax_commission_30d  AS "Commission Nayax (€)",
  nayax_monthly_fee     AS "Abonnement terminal (€)",
  gross_margin_30d      AS "Marge brute (€)",
  net_margin_30d        AS "Marge nette (€)",
  net_margin_pct        AS "Marge nette %",
  net_margin_annual_projection AS "Projection annuelle (€)"
FROM machine_economics
WHERE serial_number = 'BMF-001';
-- Attendu :
--   CA brut 30j         ≈  800 €
--   COGS                ≈   24.80 €  (800 × 0.031)
--   Nayax commission    ≈   16.00 €  (800 × 2%)
--   Abonnement          =   15.00 €
--   Marge nette         ≈  744.20 €
--   Marge nette %       ≈   93.0 %
--   Projection annuelle ≈ 7 567 € (305 j/an)

-- 3. Distribution par parfum
SELECT
  p.name                                                          AS parfum,
  ms.slot_position,
  COUNT(*)                                                        AS ventes_30j,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1)             AS pct,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) || '%'      AS part
FROM slot_events se
JOIN machine_slots ms ON ms.id  = se.slot_id
JOIN perfumes      p  ON p.id   = ms.perfume_id
WHERE se.machine_id      = 'f0000000-0000-0000-0000-000000000001'
  AND se.event_type_code = 'sale'
GROUP BY p.name, ms.slot_position
ORDER BY ventes_30j DESC;
-- Attendu : Self ≈25% · Indomptable ≈25% · Love Intense ≈20% · Life ≈15% · Intense ≈15%

-- 4. Distribution horaire (profil gym)
SELECT
  EXTRACT(HOUR FROM created_at)::int   AS heure,
  COUNT(*)                             AS ventes,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) || '%' AS part
FROM slot_events
WHERE machine_id      = 'f0000000-0000-0000-0000-000000000001'
  AND event_type_code = 'sale'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY heure;
-- Attendu : pic à 18h (≈35%), puis 9h et 12h et 21h

-- 5. Volume journalier
SELECT
  DATE(created_at)  AS jour,
  TO_CHAR(DATE(created_at), 'Dy') AS jour_semaine,
  COUNT(*)          AS sprays,
  CASE
    WHEN COUNT(*) >= 40 THEN '🚀 SCALE'
    WHEN COUNT(*) >= 30 THEN '✅ GO'
    WHEN COUNT(*) >= 20 THEN '👍 BON'
    WHEN COUNT(*) >= 10 THEN '⚠️ SURVEILLER'
    ELSE '🔴 CORRIGER'
  END AS statut_jour
FROM slot_events
WHERE machine_id      = 'f0000000-0000-0000-0000-000000000001'
  AND event_type_code = 'sale'
GROUP BY DATE(created_at)
ORDER BY jour;

*/
