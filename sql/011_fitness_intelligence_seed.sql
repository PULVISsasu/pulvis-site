-- =============================================================================
-- PULVIS Fitness Intelligence — Données de référence
-- Migration : 011_fitness_intelligence_seed.sql
-- Registre des sources + pondérations par défaut des scores. Aucune donnée
-- de démonstration ici (voir sql/012_fitness_intelligence_demo_seed.sql,
-- environnement de test uniquement).
-- =============================================================================

INSERT INTO fitness_intel.sources (name, kind, base_url, terms_url, requires_auth, rate_limit_per_min, notes) VALUES
  ('recherche-entreprises', 'official_api', 'https://recherche-entreprises.api.gouv.fr', 'https://www.api.gouv.fr/les-api/api-recherche-entreprises', FALSE, 420, 'API publique agrégeant INSEE/RNE/BODACC, sans clé.'),
  ('sirene-insee', 'official_api', 'https://api.insee.fr/api-sirene/3.11', 'https://www.sirene.fr/sirene/public/static/conditions-generales-utilisation', TRUE, 30, 'Nécessite un compte data.gouv.fr / jeton OAuth INSEE.'),
  ('bodacc', 'open_data', 'https://bodacc-datadila.opendatasoft.com/api/records/1.0/search', 'https://www.bodacc.fr/pages/mentions-legales', FALSE, 60, 'Annonces légales (créations, procédures collectives).'),
  ('inpi-rne', 'official_api', 'https://registre-national-entreprises.inpi.fr/api', 'https://data.inpi.fr/', TRUE, 60, 'Nécessite identifiants INPI (INPI_API_USER/INPI_API_PASSWORD).'),
  ('manual-import', 'manual_import', NULL, NULL, FALSE, NULL, 'Saisie manuelle : URL club, SIREN/SIRET, CSV.')
ON CONFLICT (name) DO NOTHING;

-- Pondérations par défaut — PULVIS Opportunity Score (total nominal 100)
INSERT INTO fitness_intel.scoring_weights (score_type, criterion_key, label, weight, description) VALUES
  ('pulvis_opportunity', 'multi_club_owner', 'Multi-franchisé / groupe', 20, 'Le décideur contrôle plusieurs clubs — un accord ouvre plusieurs installations.'),
  ('pulvis_opportunity', 'club_count_bonus', 'Nombre de clubs détenus (+3/club au-delà du 1er, plafonné)', 15, 'Effet de levier d''un accord unique.'),
  ('pulvis_opportunity', 'decision_maker_identified', 'Décideur identifié', 10, 'Un dirigeant/franchisé nommé est rattaché à l''établissement.'),
  ('pulvis_opportunity', 'email_available', 'Email professionnel disponible', 10, ''),
  ('pulvis_opportunity', 'paris_petite_couronne', 'Paris / petite couronne (75-92-93-94)', 10, 'Zone urbaine dense prioritaire.'),
  ('pulvis_opportunity', 'high_attendance', 'Forte fréquentation estimée', 15, 'Basé sur avis publics / signal qualitatif — jamais un fait certain.'),
  ('pulvis_opportunity', 'amenities', 'Vestiaires / douches disponibles', 5, 'Condition d''usage pour un spray de sortie de salle.'),
  ('pulvis_opportunity', 'premium_tier', 'Club premium', 5, ''),
  ('pulvis_opportunity', 'recent_opening', 'Ouverture récente (réseau en expansion)', 5, ''),
  ('pulvis_opportunity', 'extended_hours', 'Amplitude horaire élevée', 5, '')
ON CONFLICT (score_type, criterion_key) DO NOTHING;

-- Pondérations par défaut — Contactability Score (total nominal 100)
INSERT INTO fitness_intel.scoring_weights (score_type, criterion_key, label, weight, description) VALUES
  ('contactability', 'decision_maker_identified', 'Dirigeant identifié', 25, ''),
  ('contactability', 'function_relevant', 'Fonction adaptée (CEO/DG/Directeur réseau/Franchise...)', 15, ''),
  ('contactability', 'email_available', 'Email professionnel', 20, ''),
  ('contactability', 'phone_available', 'Téléphone', 15, ''),
  ('contactability', 'linkedin_available', 'LinkedIn', 10, ''),
  ('contactability', 'website_available', 'Site web', 5, ''),
  ('contactability', 'contact_form_available', 'Formulaire de contact', 5, ''),
  ('contactability', 'hq_contact_available', 'Contact siège identifié', 5, '')
ON CONFLICT (score_type, criterion_key) DO NOTHING;
