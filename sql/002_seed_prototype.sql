-- =============================================================================
-- PULVIS — Seed prototype / données simulées
-- Migration    : 002_seed_prototype.sql
-- Usage        : environnement de test uniquement — NE PAS appliquer en production
-- Objectif     : simuler un réseau de 4 machines avec des KPIs variés
--                pour tester les vues machine_kpis et machine_financials
-- =============================================================================
-- KPIs simulés :
--   Machine 1 (Les Halles)       → ~42 sprays/jour → SCALE
--   Machine 2 (Hôtel Lutetia)    → ~31 sprays/jour → GO
--   Machine 3 (Gare de Lyon)     → ~22 sprays/jour → BON
--   Machine 4 (Salle de sport)   → ~8  sprays/jour → CORRIGER
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Nettoyer les données de démo existantes (001_init.sql seed)
-- ---------------------------------------------------------------------------

DELETE FROM slot_events   WHERE machine_id IN (
  'c0000000-0000-0000-0000-000000000001'
);
DELETE FROM machine_slots WHERE machine_id IN (
  'c0000000-0000-0000-0000-000000000001'
);
DELETE FROM machines      WHERE id IN (
  'c0000000-0000-0000-0000-000000000001'
);
DELETE FROM locations     WHERE id IN (
  'a0000000-0000-0000-0000-000000000001'
);


-- =============================================================================
-- LOCATIONS (4 emplacements)
-- =============================================================================

INSERT INTO locations (id, name, address, city, postal_code, location_type, contact_name, contact_email, revenue_share_pct, notes) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Forum des Halles', '101 Porte Berger', 'Paris', '75001',
    'mall', 'Marie Dubois', 'marie.dubois@forumdeshalles.com', 12.00,
    'Niveau -1, face escalator central. Fort trafic week-end.'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Hôtel Lutetia', '45 Boulevard Raspail', 'Paris', '75006',
    'hotel', 'Pierre Martin', 'pierre.martin@lutetia.com', 8.00,
    'Hall d''entrée. Clientèle internationale, fort pouvoir d''achat.'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Gare de Lyon', 'Place Louis-Armand', 'Paris', '75012',
    'train_station', 'Sylvie Renard', 'sylvie.renard@sncf.fr', 15.00,
    'Hall central grande vitesse. Flux important mais rapide.'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Basic-Fit Nation', '23 Rue de la Paix', 'Paris', '75002',
    'gym', 'Thomas Leroy', 'thomas.leroy@basicfit.com', 5.00,
    'Vestiaires mixtes. Trafic creux en dehors des heures de pointe.'
  );


-- =============================================================================
-- MACHINES (4 machines)
-- =============================================================================

INSERT INTO machines (id, serial_number, location_id, status, installed_at, firmware_version, last_seen_at) VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'PUL-2024-001',
    'a0000000-0000-0000-0000-000000000001',
    'active', NOW() - INTERVAL '45 days', '1.2.0',
    NOW() - INTERVAL '3 minutes'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'PUL-2024-002',
    'a0000000-0000-0000-0000-000000000002',
    'active', NOW() - INTERVAL '38 days', '1.2.0',
    NOW() - INTERVAL '7 minutes'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'PUL-2024-003',
    'a0000000-0000-0000-0000-000000000003',
    'active', NOW() - INTERVAL '32 days', '1.1.5',
    NOW() - INTERVAL '12 minutes'
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'PUL-2024-004',
    'a0000000-0000-0000-0000-000000000004',
    'active', NOW() - INTERVAL '20 days', '1.1.5',
    NOW() - INTERVAL '1 hour 45 minutes'   -- sera détectée offline_suspected
  );


-- =============================================================================
-- MACHINE SLOTS — 5 slots par machine, 4 machines = 20 slots
-- =============================================================================

INSERT INTO machine_slots (id, machine_id, slot_position, perfume_id, capacity, current_stock, low_stock_threshold) VALUES
  -- Machine 1 — Forum des Halles (fort trafic)
  ('d1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 1, 'b0000000-0000-0000-0000-000000000001', 500, 420, 60),
  ('d1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 2, 'b0000000-0000-0000-0000-000000000002', 500, 380, 60),
  ('d1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 3, 'b0000000-0000-0000-0000-000000000003', 500, 410, 60),
  ('d1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 4, 'b0000000-0000-0000-0000-000000000004', 500, 395, 60),
  ('d1000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 5, 'b0000000-0000-0000-0000-000000000005', 500, 430, 60),

  -- Machine 2 — Hôtel Lutetia
  ('d2000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 1, 'b0000000-0000-0000-0000-000000000002', 500, 455, 50),
  ('d2000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 2, 'b0000000-0000-0000-0000-000000000001', 500, 440, 50),
  ('d2000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 3, 'b0000000-0000-0000-0000-000000000004', 500, 448, 50),
  ('d2000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 4, 'b0000000-0000-0000-0000-000000000003', 500, 462, 50),
  ('d2000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 5, 'b0000000-0000-0000-0000-000000000005', 500, 435, 50),

  -- Machine 3 — Gare de Lyon
  ('d3000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 1, 'b0000000-0000-0000-0000-000000000001', 500, 465, 50),
  ('d3000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 2, 'b0000000-0000-0000-0000-000000000003', 500, 470, 50),
  ('d3000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 3, 'b0000000-0000-0000-0000-000000000005', 500, 458, 50),
  ('d3000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 4, 'b0000000-0000-0000-0000-000000000002', 500, 472, 50),
  ('d3000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 5, 'b0000000-0000-0000-0000-000000000004', 500,  45, 50), -- stock bas

  -- Machine 4 — Basic-Fit (sous-performance)
  ('d4000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 1, 'b0000000-0000-0000-0000-000000000001', 500, 490, 50),
  ('d4000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 2, 'b0000000-0000-0000-0000-000000000005', 500, 488, 50),
  ('d4000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 3, 'b0000000-0000-0000-0000-000000000003', 500, 492, 50),
  ('d4000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 4, 'b0000000-0000-0000-0000-000000000002', 500,   0, 50), -- slot vide
  ('d4000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 5, 'b0000000-0000-0000-0000-000000000004', 500, 491, 50);


-- =============================================================================
-- VENTES SIMULÉES — 30 jours de données
-- Volumes cibles par machine (sprays/jour) :
--   M1 (Halles)    → ~42/j  (1 260 total sur 30j) → SCALE
--   M2 (Lutetia)   → ~31/j  (  930 total sur 30j) → GO
--   M3 (Gare Lyon) → ~22/j  (  660 total sur 30j) → BON
--   M4 (Basic-Fit) →  ~8/j  (  240 total sur 30j) → CORRIGER
-- =============================================================================

-- -----------------------------------------------------------------------
-- Machine 1 : Forum des Halles — 1 260 ventes, réparties sur 30 jours
-- Pic le week-end (samedi+dimanche = +40%), creux le lundi
-- -----------------------------------------------------------------------
INSERT INTO slot_events (machine_id, slot_id, event_type_code, amount, stock_delta, stock_after, recorded_at, created_at)
SELECT
  'c0000000-0000-0000-0000-000000000001'::uuid,
  -- Répartition par slot : Sauvage (30%), Bleu Chanel (25%), Belle (20%), Black Opium (15%), Acqua (10%)
  CASE (gs % 20)
    WHEN 0,1,2,3,4,5 THEN 'd1000000-0000-0000-0000-000000000001'  -- Sauvage 30%
    WHEN 6,7,8,9,10  THEN 'd1000000-0000-0000-0000-000000000002'  -- Bleu Chanel 25%
    WHEN 11,12,13,14 THEN 'd1000000-0000-0000-0000-000000000003'  -- La Vie est Belle 20%
    WHEN 15,16,17    THEN 'd1000000-0000-0000-0000-000000000004'  -- Black Opium 15%
    ELSE                  'd1000000-0000-0000-0000-000000000005'  -- Acqua di Gio 10%
  END::uuid,
  'sale', 1.00, -1,
  400 - (gs / 10),
  -- Horodatages : étalés sur 30 jours avec bruit aléatoire
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '34 minutes') + (random() * INTERVAL '20 minutes'),
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '34 minutes') + (random() * INTERVAL '20 minutes')
FROM generate_series(1, 1260) gs;

-- -----------------------------------------------------------------------
-- Machine 2 : Hôtel Lutetia — 930 ventes
-- Profil hôtel : pics matin (départ) et soir (arrivée)
-- -----------------------------------------------------------------------
INSERT INTO slot_events (machine_id, slot_id, event_type_code, amount, stock_delta, stock_after, recorded_at, created_at)
SELECT
  'c0000000-0000-0000-0000-000000000002'::uuid,
  CASE (gs % 10)
    WHEN 0,1,2 THEN 'd2000000-0000-0000-0000-000000000002'  -- Sauvage
    WHEN 3,4   THEN 'd2000000-0000-0000-0000-000000000001'  -- Bleu Chanel
    WHEN 5,6   THEN 'd2000000-0000-0000-0000-000000000003'  -- Black Opium
    WHEN 7     THEN 'd2000000-0000-0000-0000-000000000004'  -- La Vie est Belle
    ELSE            'd2000000-0000-0000-0000-000000000005'  -- Acqua di Gio
  END::uuid,
  'sale', 1.00, -1,
  440 - (gs / 12),
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '46 minutes') + (random() * INTERVAL '25 minutes'),
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '46 minutes') + (random() * INTERVAL '25 minutes')
FROM generate_series(1, 930) gs;

-- -----------------------------------------------------------------------
-- Machine 3 : Gare de Lyon — 660 ventes
-- Profil gare : pics heure de pointe matin/soir, creux la nuit
-- -----------------------------------------------------------------------
INSERT INTO slot_events (machine_id, slot_id, event_type_code, amount, stock_delta, stock_after, recorded_at, created_at)
SELECT
  'c0000000-0000-0000-0000-000000000003'::uuid,
  CASE (gs % 10)
    WHEN 0,1,2 THEN 'd3000000-0000-0000-0000-000000000001'  -- Sauvage
    WHEN 3,4   THEN 'd3000000-0000-0000-0000-000000000002'  -- La Vie est Belle
    WHEN 5,6   THEN 'd3000000-0000-0000-0000-000000000003'  -- Acqua di Gio
    WHEN 7,8   THEN 'd3000000-0000-0000-0000-000000000004'  -- Bleu Chanel
    ELSE            'd3000000-0000-0000-0000-000000000005'  -- Black Opium
  END::uuid,
  'sale', 1.00, -1,
  460 - (gs / 8),
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '65 minutes') + (random() * INTERVAL '30 minutes'),
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '65 minutes') + (random() * INTERVAL '30 minutes')
FROM generate_series(1, 660) gs;

-- -----------------------------------------------------------------------
-- Machine 4 : Basic-Fit — 240 ventes (sous-performance)
-- -----------------------------------------------------------------------
INSERT INTO slot_events (machine_id, slot_id, event_type_code, amount, stock_delta, stock_after, recorded_at, created_at)
SELECT
  'c0000000-0000-0000-0000-000000000004'::uuid,
  CASE (gs % 5)
    WHEN 0 THEN 'd4000000-0000-0000-0000-000000000001'
    WHEN 1 THEN 'd4000000-0000-0000-0000-000000000002'
    WHEN 2 THEN 'd4000000-0000-0000-0000-000000000003'
    WHEN 3 THEN 'd4000000-0000-0000-0000-000000000005'
    ELSE        'd4000000-0000-0000-0000-000000000001'
  END::uuid,
  'sale', 1.00, -1,
  490 - gs,
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '180 minutes') + (random() * INTERVAL '60 minutes'),
  NOW() - (INTERVAL '30 days') + (gs * INTERVAL '180 minutes') + (random() * INTERVAL '60 minutes')
FROM generate_series(1, 240) gs;


-- =============================================================================
-- ÉVÉNEMENTS OPÉRATIONNELS (heartbeats, erreurs, restocks)
-- Pour simuler un vrai historique machine
-- =============================================================================

-- Heartbeats — toutes les machines toutes les heures sur 30 jours
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at)
SELECT
  machine_id,
  NULL,
  'heartbeat',
  jsonb_build_object('firmware_version', '1.2.0', 'wifi_rssi', -45 - (random() * 20)::int),
  NOW() - (INTERVAL '1 hour' * gs),
  NOW() - (INTERVAL '1 hour' * gs)
FROM
  (VALUES
    ('c0000000-0000-0000-0000-000000000001'::uuid),
    ('c0000000-0000-0000-0000-000000000002'::uuid),
    ('c0000000-0000-0000-0000-000000000003'::uuid)
  ) AS m(machine_id),
  generate_series(1, 720) gs;  -- 30 jours × 24h = 720 heartbeats par machine

-- Remplissages — Machine 1 (forte consommation → 2 restocks sur 30j)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, stock_delta, stock_after, payload, recorded_at, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'restock', 500, 500,
   '{"operator": "tech_paul", "notes": "Remplissage complet Bleu de Chanel"}',
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'restock', 500, 500,
   '{"operator": "tech_paul", "notes": "Remplissage complet Black Opium"}',
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  -- Machine 3 slot 5 — remplissage du slot en stock bas
  ('c0000000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000005', 'restock', 455, 500,
   '{"operator": "tech_sarah", "notes": "Remplissage urgent Black Opium — stock bas"}',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Alertes stock bas — Machine 3 slot 5 (il y a 4 jours, avant le restock)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000005', 'low_stock_alert',
   '{"stock_remaining": 38, "threshold": 50}',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- Rupture de stock — Machine 4 slot 4 (slot vide actuellement)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000004', 'd4000000-0000-0000-0000-000000000004', 'out_of_stock',
   '{"stock_remaining": 0}',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Incidents : 2 échecs de paiement (normaux) et 1 échec de dispense (critique)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'payment_failed',
   '{"error_code": "CB_DECLINED", "terminal_id": "TRM-001"}',
   NOW() - INTERVAL '5 days 14 hours', NOW() - INTERVAL '5 days 14 hours'),
  ('c0000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000001', 'payment_failed',
   '{"error_code": "CB_TIMEOUT", "terminal_id": "TRM-002"}',
   NOW() - INTERVAL '8 days 9 hours', NOW() - INTERVAL '8 days 9 hours'),
  ('c0000000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000002', 'dispense_failed',
   '{"error_code": "SERVO_JAM", "terminal_id": "TRM-003", "amount_refunded": true}',
   NOW() - INTERVAL '12 days 11 hours', NOW() - INTERVAL '12 days 11 hours');

-- Démarrages machine (boots) — après une coupure de courant simulée
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000003', NULL, 'boot',
   '{"firmware_version": "1.1.5", "reason": "power_restored"}',
   NOW() - INTERVAL '15 days 3 hours', NOW() - INTERVAL '15 days 3 hours'),
  ('c0000000-0000-0000-0000-000000000004', NULL, 'boot',
   '{"firmware_version": "1.1.5", "reason": "manual_restart"}',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Maintenance Machine 4 (investigation sous-performance)
INSERT INTO slot_events (machine_id, slot_id, event_type_code, payload, recorded_at, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000004', NULL, 'maintenance_start',
   '{"operator": "tech_paul", "reason": "investigation_kpi"}',
   NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 2 hours'),
  ('c0000000-0000-0000-0000-000000000004', NULL, 'maintenance_end',
   '{"operator": "tech_paul", "notes": "Emplacement peu fréquenté. À réévaluer dans 2 semaines."}',
   NOW() - INTERVAL '5 days 1 hour', NOW() - INTERVAL '5 days 1 hour');


-- =============================================================================
-- VÉRIFICATION — résumé des données insérées
-- À exécuter après le seed pour valider les KPIs
-- =============================================================================

-- Décommenter pour vérifier :
-- SELECT machine_id, kpi_status, sprays_today, avg_sprays_per_day_30d,
--        has_empty_slot, has_low_stock, is_offline_suspected
-- FROM machine_kpis
-- ORDER BY avg_sprays_per_day_30d DESC;

-- SELECT serial_number, location_name, revenue_30d, pulvis_net_30d, partner_share_30d
-- FROM machine_financials
-- ORDER BY revenue_30d DESC;

COMMIT;
