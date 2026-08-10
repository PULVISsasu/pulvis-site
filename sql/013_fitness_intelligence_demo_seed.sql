-- =============================================================================
-- PULVIS Fitness Intelligence — Jeu de données de démonstration
-- Migration : 013_fitness_intelligence_demo_seed.sql
-- Environnement de TEST UNIQUEMENT (cf. sql/README.md). Toutes les lignes
-- sont marquées is_demo_data = TRUE pour rester identifiables et purgeables
-- (DELETE ... WHERE is_demo_data) sans toucher aux vraies données collectées
-- par le pipeline.
--
-- Objectif : permettre de visualiser tous les écrans (Dashboard, Carte,
-- Clubs, Enseignes, Groupes, Dirigeants, Prospection) sans attendre un
-- premier run réel du pipeline (le réseau sortant du sandbox de build ne
-- peut pas atteindre les APIs publiques — voir docs/fitness-intelligence-architecture.md §1).
-- =============================================================================

DO $$
DECLARE
  brand_fp UUID; brand_bf UUID; brand_kc UUID;
  le_fp_paris UUID; le_fp_creteil UUID; le_bf_national UUID; le_kc_local UUID;
  club_fp_bastille UUID; club_fp_creteil UUID; club_fp_vitry UUID; club_bf_nation UUID; club_kc_boulogne UUID; club_fp_montreuil UUID;
  person_dupont UUID; person_martin UUID; person_petit UUID;
  group_dupont UUID;
  src_manual UUID;
BEGIN
  SELECT id INTO src_manual FROM fitness_intel.sources WHERE name = 'manual-import';

  -- --- Enseignes ---
  INSERT INTO fitness_intel.brands (name, slug, website, business_model, idf_presence, estimated_club_count, confidence_level, is_demo_data)
  VALUES ('Fitness Park', 'fitness-park', 'https://www.fitnesspark.fr', 'franchise', TRUE, 260, 'estimated', TRUE)
  RETURNING id INTO brand_fp;

  INSERT INTO fitness_intel.brands (name, slug, website, business_model, idf_presence, estimated_club_count, confidence_level, is_demo_data)
  VALUES ('Basic-Fit', 'basic-fit', 'https://www.basic-fit.com', 'succursale', TRUE, 900, 'estimated', TRUE)
  RETURNING id INTO brand_bf;

  INSERT INTO fitness_intel.brands (name, slug, website, business_model, idf_presence, estimated_club_count, confidence_level, is_demo_data)
  VALUES ('Keepcool', 'keepcool', 'https://www.keepcool.fr', 'mixte', TRUE, 90, 'estimated', TRUE)
  RETURNING id INTO brand_kc;

  -- --- Sociétés exploitantes (SIREN factices au format valide 9 chiffres) ---
  INSERT INTO fitness_intel.legal_entities (siren, raison_sociale, forme_juridique, code_naf, statut, adresse_siege, ville_siege, confidence_level, is_demo_data)
  VALUES ('111222333', 'SAS DUPONT FITNESS PARIS', 'SAS', '93.13Z', 'actif', '12 rue de la Roquette', 'Paris', 'estimated', TRUE)
  RETURNING id INTO le_fp_paris;

  INSERT INTO fitness_intel.legal_entities (siren, raison_sociale, forme_juridique, code_naf, statut, adresse_siege, ville_siege, confidence_level, is_demo_data)
  VALUES ('222333444', 'SAS DUPONT FITNESS CRETEIL', 'SAS', '93.13Z', 'actif', '4 avenue du Général de Gaulle', 'Créteil', 'estimated', TRUE)
  RETURNING id INTO le_fp_creteil;

  INSERT INTO fitness_intel.legal_entities (siren, raison_sociale, forme_juridique, code_naf, statut, adresse_siege, ville_siege, confidence_level, is_demo_data)
  VALUES ('333444555', 'BASIC-FIT FRANCE SAS', 'SAS', '93.13Z', 'actif', '10 rue de Londres', 'Paris', 'estimated', TRUE)
  RETURNING id INTO le_bf_national;

  INSERT INTO fitness_intel.legal_entities (siren, raison_sociale, forme_juridique, code_naf, statut, adresse_siege, ville_siege, confidence_level, is_demo_data)
  VALUES ('444555666', 'SARL KEEPCOOL BOULOGNE', 'SARL', '93.13Z', 'actif', '22 rue de Paris', 'Boulogne-Billancourt', 'estimated', TRUE)
  RETURNING id INTO le_kc_local;

  UPDATE fitness_intel.brands SET parent_company_legal_entity_id = le_bf_national WHERE id = brand_bf;

  -- --- Clubs ---
  INSERT INTO fitness_intel.clubs (brand_id, name, address, postal_code, city, department, latitude, longitude, phone, tier, status, amenities, reviews_count, rating, opened_estimated_at, confidence_level, is_demo_data)
  VALUES (brand_fp, 'Fitness Park Paris Bastille', '10 rue de la Roquette', '75011', 'Paris', '75', 48.8532, 2.3721, '+33142000001', 'standard', 'open', '{"vestiaires": true, "douches": true}', 340, 4.3, '2019-03-01', 'estimated', TRUE)
  RETURNING id INTO club_fp_bastille;

  INSERT INTO fitness_intel.clubs (brand_id, name, address, postal_code, city, department, latitude, longitude, phone, tier, status, amenities, reviews_count, rating, opened_estimated_at, confidence_level, is_demo_data)
  VALUES (brand_fp, 'Fitness Park Créteil', '4 avenue du Général de Gaulle', '94000', 'Créteil', '94', 48.7900, 2.4550, '+33142000002', 'standard', 'open', '{"vestiaires": true, "douches": true}', 210, 4.1, '2020-09-01', 'estimated', TRUE)
  RETURNING id INTO club_fp_creteil;

  INSERT INTO fitness_intel.clubs (brand_id, name, address, postal_code, city, department, latitude, longitude, phone, tier, status, amenities, reviews_count, rating, opened_estimated_at, confidence_level, is_demo_data)
  VALUES (brand_fp, 'Fitness Park Vitry-sur-Seine', '8 avenue Paul Vaillant-Couturier', '94400', 'Vitry-sur-Seine', '94', 48.7876, 2.3930, '+33142000003', 'standard', 'open', '{"vestiaires": true, "douches": true}', 95, 3.9, '2024-01-15', 'estimated', TRUE)
  RETURNING id INTO club_fp_vitry;

  INSERT INTO fitness_intel.clubs (brand_id, name, address, postal_code, city, department, latitude, longitude, phone, tier, status, amenities, reviews_count, rating, confidence_level, is_demo_data)
  VALUES (brand_fp, 'Fitness Park Montreuil', '15 rue de Paris', '93100', 'Montreuil', '93', 48.8637, 2.4432, '+33142000004', 'standard', 'open', '{"vestiaires": true, "douches": false}', 60, 3.7, 'estimated', TRUE)
  RETURNING id INTO club_fp_montreuil;

  INSERT INTO fitness_intel.clubs (brand_id, name, address, postal_code, city, department, latitude, longitude, phone, tier, status, amenities, reviews_count, rating, confidence_level, is_demo_data)
  VALUES (brand_bf, 'Basic-Fit Paris Nation', '2 place de la Nation', '75012', 'Paris', '75', 48.8484, 2.3958, '+33142000005', 'standard', 'open', '{"vestiaires": true, "douches": true}', 520, 4.0, 'estimated', TRUE)
  RETURNING id INTO club_bf_nation;

  INSERT INTO fitness_intel.clubs (brand_id, name, address, postal_code, city, department, latitude, longitude, phone, tier, status, amenities, reviews_count, rating, confidence_level, is_demo_data)
  VALUES (brand_kc, 'Keepcool Boulogne', '22 rue de Paris', '92100', 'Boulogne-Billancourt', '92', 48.8352, 2.2454, '+33142000006', 'premium', 'open', '{"vestiaires": true, "douches": true}', 140, 4.6, 'estimated', TRUE)
  RETURNING id INTO club_kc_boulogne;

  -- --- Établissements (SIRET = SIREN + 5 chiffres, factice) ---
  INSERT INTO fitness_intel.establishments (siret, legal_entity_id, club_id, adresse, code_postal, ville, departement, is_siege, statut, confidence_level, is_demo_data)
  VALUES ('11122233300019', le_fp_paris, club_fp_bastille, '10 rue de la Roquette', '75011', 'Paris', '75', TRUE, 'actif', 'estimated', TRUE);

  INSERT INTO fitness_intel.establishments (siret, legal_entity_id, club_id, adresse, code_postal, ville, departement, is_siege, statut, confidence_level, is_demo_data)
  VALUES ('22233344400015', le_fp_creteil, club_fp_creteil, '4 avenue du Général de Gaulle', '94000', 'Créteil', '94', TRUE, 'actif', 'estimated', TRUE);

  INSERT INTO fitness_intel.establishments (siret, legal_entity_id, club_id, adresse, code_postal, ville, departement, is_siege, statut, confidence_level, is_demo_data)
  VALUES ('22233344400023', le_fp_creteil, club_fp_vitry, '8 avenue Paul Vaillant-Couturier', '94400', 'Vitry-sur-Seine', '94', FALSE, 'actif', 'estimated', TRUE);

  INSERT INTO fitness_intel.establishments (siret, legal_entity_id, club_id, adresse, code_postal, ville, departement, is_siege, statut, confidence_level, is_demo_data)
  VALUES ('22233344400031', le_fp_creteil, club_fp_montreuil, '15 rue de Paris', '93100', 'Montreuil', '93', FALSE, 'actif', 'estimated', TRUE);

  UPDATE fitness_intel.clubs SET matched_establishment_id = (SELECT id FROM fitness_intel.establishments WHERE siret = '11122233300019'), confidence_level = 'verified' WHERE id = club_fp_bastille;
  UPDATE fitness_intel.clubs SET matched_establishment_id = (SELECT id FROM fitness_intel.establishments WHERE siret = '22233344400015'), confidence_level = 'verified' WHERE id = club_fp_creteil;
  UPDATE fitness_intel.clubs SET matched_establishment_id = (SELECT id FROM fitness_intel.establishments WHERE siret = '22233344400023'), confidence_level = 'verified' WHERE id = club_fp_vitry;
  UPDATE fitness_intel.clubs SET matched_establishment_id = (SELECT id FROM fitness_intel.establishments WHERE siret = '22233344400031'), confidence_level = 'verified' WHERE id = club_fp_montreuil;

  -- --- Dirigeants ---
  INSERT INTO fitness_intel.people (first_name, last_name, current_function, email, phone, linkedin_url, confidence_level, is_demo_data)
  VALUES ('Jean', 'Dupont', 'Président', 'jean.dupont@dupont-fitness.example', '+33601020304', 'https://www.linkedin.com/in/exemple-jean-dupont', 'estimated', TRUE)
  RETURNING id INTO person_dupont;

  INSERT INTO fitness_intel.people (first_name, last_name, current_function, email, linkedin_url, confidence_level, is_demo_data)
  VALUES ('Sophie', 'Martin', 'Directrice régionale', 'sophie.martin@basic-fit.example', 'https://www.linkedin.com/in/exemple-sophie-martin', 'estimated', TRUE)
  RETURNING id INTO person_martin;

  INSERT INTO fitness_intel.people (first_name, last_name, current_function, email, confidence_level, is_demo_data)
  VALUES ('Karim', 'Petit', 'Gérant', 'karim.petit@keepcool-boulogne.example', 'estimated', TRUE)
  RETURNING id INTO person_petit;

  INSERT INTO fitness_intel.roles (person_id, target_type, target_id, function_title, function_category, confidence_level)
  VALUES
    (person_dupont, 'legal_entity', le_fp_paris, 'Président', 'president', 'estimated'),
    (person_dupont, 'legal_entity', le_fp_creteil, 'Président', 'president', 'estimated'),
    (person_martin, 'legal_entity', le_bf_national, 'Directrice régionale', 'directeur_reseau', 'estimated'),
    (person_petit, 'legal_entity', le_kc_local, 'Gérant', 'gerant_club', 'estimated');

  -- --- Groupe multi-franchisé (Jean Dupont exploite 4 clubs Fitness Park) ---
  INSERT INTO fitness_intel.groups (name, raison_sociale, club_count_estimated, geographic_zone, confidence_level, is_demo_data)
  VALUES ('Jean Dupont (multi-clubs)', 'Groupe Dupont Fitness', 4, 'Île-de-France', 'probable', TRUE)
  RETURNING id INTO group_dupont;

  INSERT INTO fitness_intel.group_brands (group_id, brand_id) VALUES (group_dupont, brand_fp);

  INSERT INTO fitness_intel.group_members (group_id, club_id, confidence_level, evidence)
  VALUES
    (group_dupont, club_fp_bastille, 'probable', 'Même dirigeant (Jean Dupont) identifié sur les sociétés exploitantes'),
    (group_dupont, club_fp_creteil, 'probable', 'Même dirigeant (Jean Dupont) identifié sur les sociétés exploitantes'),
    (group_dupont, club_fp_vitry, 'probable', 'Établissement secondaire de la société exploitant Fitness Park Créteil'),
    (group_dupont, club_fp_montreuil, 'probable', 'Établissement secondaire de la société exploitant Fitness Park Créteil');

  INSERT INTO fitness_intel.roles (person_id, target_type, target_id, function_title, function_category, confidence_level)
  VALUES (person_dupont, 'group', group_dupont, 'Multi-franchisé', 'multi_franchise', 'probable');

  -- --- Détection franchise / succursale ---
  INSERT INTO fitness_intel.ownership_relations (from_type, from_id, to_type, to_id, relation_type, confidence_score, evidence)
  VALUES
    ('legal_entity', le_fp_paris, 'brand', brand_fp, 'franchise_of', 75, ARRAY['Enseigne Fitness Park', 'Société juridiquement distincte du nom de l''enseigne']),
    ('legal_entity', le_fp_creteil, 'brand', brand_fp, 'franchise_of', 75, ARRAY['Enseigne Fitness Park', 'Même dirigeant que Fitness Park Paris Bastille (Jean Dupont)']),
    ('legal_entity', le_bf_national, 'brand', brand_bf, 'succursale_of', 95, ARRAY['Société identique à la maison mère déclarée de l''enseigne']),
    ('legal_entity', le_kc_local, 'brand', brand_kc, 'franchise_of', 60, ARRAY['Enseigne Keepcool', 'Société locale (SARL) distincte du réseau national']);

  -- --- Pipeline commercial ---
  INSERT INTO fitness_intel.crm_status (club_id, stage, owner, next_action, next_action_date)
  VALUES
    (club_fp_bastille, 'rendez_vous', 'Léa (Sales)', 'RDV visite technique', CURRENT_DATE + INTERVAL '5 days'),
    (club_fp_creteil, 'a_contacter', 'Léa (Sales)', 'Premier email de prise de contact', CURRENT_DATE + INTERVAL '2 days'),
    (club_fp_vitry, 'a_qualifier', NULL, NULL, NULL),
    (club_fp_montreuil, 'a_analyser', NULL, NULL, NULL),
    (club_bf_nation, 'a_analyser', NULL, NULL, NULL),
    (club_kc_boulogne, 'negociation', 'Léa (Sales)', 'Relancer sur les conditions financières', CURRENT_DATE + INTERVAL '1 day');

  INSERT INTO fitness_intel.activities (club_id, activity_type, body, actor)
  VALUES
    (club_fp_bastille, 'call', 'Premier appel positif, RDV fixé sur site.', 'Léa (Sales)'),
    (club_kc_boulogne, 'meeting', 'Visite technique effectuée, en attente de retour du gérant.', 'Léa (Sales)');

  -- --- Traçabilité (exemple) ---
  INSERT INTO fitness_intel.source_records (source_id, target_type, target_id, field_name, field_value, method, confidence_level, verified_at)
  VALUES (src_manual, 'club', club_fp_bastille, 'name', 'Fitness Park Paris Bastille', 'manual_entry', 'verified', NOW());

  -- --- Scores ---
  INSERT INTO fitness_intel.opportunity_scores (club_id, pulvis_score, pulvis_breakdown, contactability_score, contactability_breakdown)
  VALUES
    (club_fp_bastille, 78,
      '[{"criterion":"multi_club_owner","label":"Multi-franchisé / groupe","points":20,"max_points":20,"reason":"Détenteur de 4 clubs identifié"},{"criterion":"decision_maker_identified","label":"Décideur identifié","points":10,"max_points":10,"reason":"Décideur rattaché"},{"criterion":"paris_petite_couronne","label":"Paris / petite couronne","points":10,"max_points":10,"reason":"Département 75"}]'::jsonb,
      70,
      '[{"criterion":"decision_maker_identified","label":"Dirigeant identifié","points":25,"max_points":25,"reason":"Décideur identifié"},{"criterion":"email_available","label":"Email professionnel","points":20,"max_points":20,"reason":"Email disponible"}]'::jsonb),
    (club_fp_creteil, 72,
      '[{"criterion":"multi_club_owner","label":"Multi-franchisé / groupe","points":20,"max_points":20,"reason":"Détenteur de 4 clubs identifié"},{"criterion":"decision_maker_identified","label":"Décideur identifié","points":10,"max_points":10,"reason":"Décideur rattaché"}]'::jsonb,
      65,
      '[{"criterion":"decision_maker_identified","label":"Dirigeant identifié","points":25,"max_points":25,"reason":"Décideur identifié"}]'::jsonb),
    (club_kc_boulogne, 68,
      '[{"criterion":"premium_tier","label":"Club premium","points":5,"max_points":5,"reason":"Club premium"},{"criterion":"high_attendance","label":"Forte fréquentation estimée","points":15,"max_points":15,"reason":"140 avis, 4.6★"}]'::jsonb,
      55,
      '[{"criterion":"decision_maker_identified","label":"Dirigeant identifié","points":25,"max_points":25,"reason":"Décideur identifié"}]'::jsonb),
    (club_fp_vitry, 45,
      '[{"criterion":"recent_opening","label":"Ouverture récente","points":5,"max_points":5,"reason":"Ouverture récente (< 2 ans)"}]'::jsonb,
      30, '[]'::jsonb),
    (club_fp_montreuil, 38, '[]'::jsonb, 20, '[]'::jsonb),
    (club_bf_nation, 55,
      '[{"criterion":"high_attendance","label":"Forte fréquentation estimée","points":15,"max_points":15,"reason":"520 avis, 4.0★"}]'::jsonb,
      25, '[]'::jsonb);

END $$;
