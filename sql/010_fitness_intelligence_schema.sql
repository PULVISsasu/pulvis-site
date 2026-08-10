-- =============================================================================
-- PULVIS Fitness Intelligence — Schéma SQL
-- Migration    : 010_fitness_intelligence_schema.sql
-- Schéma dédié : fitness_intel (isolé du schéma public opérationnel Pulvis)
-- Base         : Supabase / PostgreSQL 15+
--
-- Contexte : prospection B2B des salles de sport/fitness en Île-de-France
-- (enseignes, clubs, sociétés exploitantes, dirigeants, groupes de
-- franchisés) pour identifier les décideurs à contacter pour l'installation
-- de stations Pulvis. Voir docs/fitness-intelligence-architecture.md.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS fitness_intel;

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- similarité de texte (dédup noms)
CREATE EXTENSION IF NOT EXISTS unaccent;   -- normalisation noms/adresses

-- Toutes les références sont explicitement qualifiées par `fitness_intel.` dans
-- ce fichier : pas besoin de modifier le search_path (les extensions restent
-- résolues via le search_path par défaut du projet, quel qu'il soit).

-- ---------------------------------------------------------------------------
-- UTILITAIRE : trigger générique updated_at (schéma dédié)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fitness_intel.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Types de confiance / niveau de vérification, réutilisés sur toutes les
-- données déduites ou collectées automatiquement.
CREATE TYPE fitness_intel.confidence_level AS ENUM ('verified', 'probable', 'estimated', 'unknown');

-- Cible polymorphe utilisée par roles / contacts / websites / source_records / notes / activities.
CREATE TYPE fitness_intel.entity_kind AS ENUM ('brand', 'group', 'legal_entity', 'club', 'establishment', 'person');


-- =============================================================================
-- NIVEAU 0 — SOURCES & TRAÇABILITÉ
-- =============================================================================

CREATE TABLE fitness_intel.sources (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL UNIQUE,
  kind                TEXT NOT NULL CHECK (kind IN ('official_api', 'open_data', 'brand_website', 'manual_import', 'web_search', 'other')),
  base_url            TEXT,
  terms_url           TEXT,
  requires_auth       BOOLEAN NOT NULL DEFAULT FALSE,
  rate_limit_per_min  INTEGER,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fitness_intel.sources IS 'Registre des sources de données (APIs officielles, sites enseignes, imports manuels…) avec leurs contraintes d''usage.';

-- Historique de collecte de chaque donnée individuelle : quelle source, quand, avec quelle confiance.
CREATE TABLE fitness_intel.source_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           UUID REFERENCES fitness_intel.sources(id) ON DELETE SET NULL,
  target_type         fitness_intel.entity_kind NOT NULL,
  target_id           UUID NOT NULL,
  field_name          TEXT NOT NULL,
  field_value         TEXT,
  url                 TEXT,
  method              TEXT,                          -- ex. 'api_call', 'html_parse', 'manual_entry'
  confidence_level    fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  collected_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at         TIMESTAMPTZ,
  stale_after         INTERVAL NOT NULL DEFAULT INTERVAL '90 days',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_source_records_target ON fitness_intel.source_records (target_type, target_id);
CREATE INDEX idx_source_records_stale ON fitness_intel.source_records (collected_at) WHERE verified_at IS NULL;

COMMENT ON TABLE fitness_intel.source_records IS 'Provenance champ par champ : source, URL, date de collecte, dernière vérification, niveau de confiance. Jamais d''écrasement silencieux.';


-- =============================================================================
-- NIVEAU 1 — ENSEIGNES (brands)
-- =============================================================================

CREATE TABLE fitness_intel.brands (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  slug                      TEXT NOT NULL UNIQUE,
  website                   TEXT,
  corporate_site            TEXT,
  linkedin_url              TEXT,
  estimated_club_count      INTEGER,
  idf_presence              BOOLEAN NOT NULL DEFAULT TRUE,
  business_model            TEXT NOT NULL DEFAULT 'unknown'
                              CHECK (business_model IN ('succursale', 'franchise', 'mixte', 'unknown')),
  parent_company_legal_entity_id UUID,  -- FK ajoutée après création de legal_entities
  hq_address                TEXT,
  hq_city                   TEXT,
  hq_postal_code            TEXT,
  public_email              TEXT,
  public_phone              TEXT,
  confidence_level          fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  is_demo_data              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.brands
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

COMMENT ON TABLE fitness_intel.brands IS 'Niveau 1 : enseigne (Fitness Park, Basic-Fit, Keepcool…). Direction/franchise/partenariats via fitness_intel.roles (target_type=brand).';


-- =============================================================================
-- NIVEAU 2 — GROUPES / RÉSEAUX DE FRANCHISÉS (multi-club operators)
-- =============================================================================

CREATE TABLE fitness_intel.groups (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  raison_sociale      TEXT,
  siren               TEXT,
  club_count_estimated INTEGER,
  website             TEXT,
  linkedin_url        TEXT,
  public_email        TEXT,
  public_phone        TEXT,
  geographic_zone     TEXT,
  confidence_level    fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  is_demo_data        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.groups
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

COMMENT ON TABLE fitness_intel.groups IS 'Niveau 2 : groupe/entrepreneur multi-franchisé exploitant plusieurs clubs (potentiellement sur plusieurs enseignes).';

-- Enseignes exploitées par un groupe (many-to-many)
CREATE TABLE fitness_intel.group_brands (
  group_id            UUID NOT NULL REFERENCES fitness_intel.groups(id) ON DELETE CASCADE,
  brand_id            UUID NOT NULL REFERENCES fitness_intel.brands(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, brand_id)
);

-- Clubs contrôlés par un groupe
CREATE TABLE fitness_intel.group_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id            UUID NOT NULL REFERENCES fitness_intel.groups(id) ON DELETE CASCADE,
  club_id             UUID NOT NULL,  -- FK ajoutée après création de clubs
  confidence_level    fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  evidence            TEXT,
  added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, club_id)
);


-- =============================================================================
-- DONNÉES JURIDIQUES — legal_entities (sociétés exploitantes / holdings)
-- =============================================================================

CREATE TABLE fitness_intel.legal_entities (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siren                   TEXT NOT NULL UNIQUE CHECK (siren ~ '^[0-9]{9}$'),
  raison_sociale          TEXT NOT NULL,
  nom_commercial          TEXT,
  forme_juridique         TEXT,
  date_creation           DATE,
  code_naf                TEXT,
  activite_libelle        TEXT,
  capital_social          NUMERIC(14,2),
  effectif_tranche        TEXT,               -- code tranche INSEE (ex. '11' = 10 à 19 salariés)
  adresse_siege           TEXT,
  code_postal_siege       TEXT,
  ville_siege             TEXT,
  statut                  TEXT NOT NULL DEFAULT 'unknown' CHECK (statut IN ('actif', 'radie', 'unknown')),
  tva_intracommunautaire  TEXT,
  chiffre_affaires        NUMERIC(14,2),
  chiffre_affaires_annee  INTEGER,
  resultat_net            NUMERIC(14,2),
  holding_id              UUID REFERENCES fitness_intel.legal_entities(id),  -- société mère éventuelle
  confidence_level        fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  is_demo_data            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_legal_entities_siren ON fitness_intel.legal_entities (siren);
CREATE INDEX idx_legal_entities_name_trgm ON fitness_intel.legal_entities USING gin (raison_sociale gin_trgm_ops);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.legal_entities
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

COMMENT ON TABLE fitness_intel.legal_entities IS 'Société (SIREN) qui exploite un ou plusieurs clubs, ou holding. Source primaire : Recherche d''Entreprises / Sirene / BODACC.';

ALTER TABLE fitness_intel.brands
  ADD CONSTRAINT fk_brands_parent_company
  FOREIGN KEY (parent_company_legal_entity_id) REFERENCES fitness_intel.legal_entities(id);

-- Historique append-only : changement de dirigeant/adresse/statut d'une société.
CREATE TABLE fitness_intel.legal_entity_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_entity_id     UUID NOT NULL REFERENCES fitness_intel.legal_entities(id) ON DELETE CASCADE,
  field_name          TEXT NOT NULL,
  old_value           TEXT,
  new_value           TEXT,
  changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION fitness_intel.track_legal_entity_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.statut IS DISTINCT FROM NEW.statut THEN
      INSERT INTO fitness_intel.legal_entity_history (legal_entity_id, field_name, old_value, new_value)
      VALUES (NEW.id, 'statut', OLD.statut, NEW.statut);
    END IF;
    IF OLD.adresse_siege IS DISTINCT FROM NEW.adresse_siege THEN
      INSERT INTO fitness_intel.legal_entity_history (legal_entity_id, field_name, old_value, new_value)
      VALUES (NEW.id, 'adresse_siege', OLD.adresse_siege, NEW.adresse_siege);
    END IF;
    IF OLD.raison_sociale IS DISTINCT FROM NEW.raison_sociale THEN
      INSERT INTO fitness_intel.legal_entity_history (legal_entity_id, field_name, old_value, new_value)
      VALUES (NEW.id, 'raison_sociale', OLD.raison_sociale, NEW.raison_sociale);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_history BEFORE UPDATE ON fitness_intel.legal_entities
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.track_legal_entity_history();


-- =============================================================================
-- CLUBS — couche commerciale/physique (ce que voit le grand public)
-- =============================================================================

CREATE TABLE fitness_intel.clubs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id              UUID REFERENCES fitness_intel.brands(id),
  name                  TEXT NOT NULL,
  club_type             TEXT NOT NULL DEFAULT 'salle_fitness'
                          CHECK (club_type IN ('salle_fitness', 'crossfit', 'studio', 'club_premium', 'independant', 'autre')),
  address               TEXT,
  postal_code           TEXT,
  city                  TEXT,
  department            TEXT,          -- '75', '77', '78', '91', '92', '93', '94', '95'
  region                TEXT NOT NULL DEFAULT 'Île-de-France',
  latitude              NUMERIC(9,6),
  longitude             NUMERIC(9,6),
  phone                 TEXT,
  email                 TEXT,
  website               TEXT,
  club_page_url         TEXT,
  linkedin_url          TEXT,
  social_links          JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {instagram, facebook, ...}
  opening_hours         JSONB,
  surface_m2            NUMERIC(8,1),
  amenities             JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {vestiaires, douches, parking, ...}
  estimated_attendance  TEXT,          -- estimation qualitative (faible/moyenne/forte) — jamais présentée comme un fait
  reviews_count         INTEGER,
  rating                NUMERIC(2,1),
  opened_estimated_at   DATE,
  status                TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('open', 'closed', 'unknown')),
  tier                  TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('premium', 'standard', 'unknown')),
  gender_focus          TEXT DEFAULT 'mixte' CHECK (gender_focus IN ('mixte', 'femmes', 'hommes', 'unknown')),
  matched_establishment_id UUID,   -- FK ajoutée après établissements (résultat de l'étape MATCH)
  confidence_level      fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  is_demo_data          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubs_brand ON fitness_intel.clubs (brand_id);
CREATE INDEX idx_clubs_department ON fitness_intel.clubs (department);
CREATE INDEX idx_clubs_status ON fitness_intel.clubs (status);
CREATE INDEX idx_clubs_geo ON fitness_intel.clubs (latitude, longitude);
CREATE INDEX idx_clubs_name_trgm ON fitness_intel.clubs USING gin (name gin_trgm_ops);
CREATE INDEX idx_clubs_address_trgm ON fitness_intel.clubs USING gin (address gin_trgm_ops);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.clubs
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

COMMENT ON TABLE fitness_intel.clubs IS 'Club physique (issu de DISCOVER, avant ou après rattachement légal). Rattaché à un établissement INSEE via matched_establishment_id une fois l''étape MATCH exécutée.';

ALTER TABLE fitness_intel.group_members
  ADD CONSTRAINT fk_group_members_club FOREIGN KEY (club_id) REFERENCES fitness_intel.clubs(id) ON DELETE CASCADE;


-- =============================================================================
-- ÉTABLISSEMENTS — couche légale INSEE (SIRET)
-- =============================================================================

CREATE TABLE fitness_intel.establishments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siret               TEXT NOT NULL UNIQUE CHECK (siret ~ '^[0-9]{14}$'),
  legal_entity_id     UUID NOT NULL REFERENCES fitness_intel.legal_entities(id) ON DELETE CASCADE,
  club_id             UUID REFERENCES fitness_intel.clubs(id),
  adresse             TEXT,
  code_postal         TEXT,
  ville               TEXT,
  departement         TEXT,
  is_siege            BOOLEAN NOT NULL DEFAULT FALSE,
  statut              TEXT NOT NULL DEFAULT 'unknown' CHECK (statut IN ('actif', 'ferme', 'unknown')),
  date_creation        DATE,
  confidence_level    fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  is_demo_data        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_establishments_siret ON fitness_intel.establishments (siret);
CREATE INDEX idx_establishments_legal_entity ON fitness_intel.establishments (legal_entity_id);
CREATE INDEX idx_establishments_club ON fitness_intel.establishments (club_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.establishments
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

ALTER TABLE fitness_intel.clubs
  ADD CONSTRAINT fk_clubs_matched_establishment
  FOREIGN KEY (matched_establishment_id) REFERENCES fitness_intel.establishments(id);

COMMENT ON TABLE fitness_intel.establishments IS 'Établissement INSEE (SIRET) — source de vérité légale d''un club, rattaché à sa société exploitante (legal_entities).';


-- =============================================================================
-- PERSONNES & RÔLES (dirigeants, décideurs)
-- =============================================================================

CREATE TABLE fitness_intel.people (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT,
  last_name           TEXT,
  full_name           TEXT GENERATED ALWAYS AS (TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) STORED,
  current_function    TEXT,
  current_company     TEXT,
  linkedin_url        TEXT,
  email                TEXT,
  phone                TEXT,
  professional_location TEXT,
  notes                TEXT,
  confidence_level    fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  is_demo_data        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_people_name_trgm ON fitness_intel.people USING gin (full_name gin_trgm_ops);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.people
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

COMMENT ON TABLE fitness_intel.people IS 'Personnes physiques identifiées comme décideurs (dirigeants, franchisés, responsables réseau). Données professionnelles publiques uniquement.';

CREATE TABLE fitness_intel.roles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id           UUID NOT NULL REFERENCES fitness_intel.people(id) ON DELETE CASCADE,
  target_type         fitness_intel.entity_kind NOT NULL CHECK (target_type IN ('brand', 'group', 'legal_entity', 'club')),
  target_id           UUID NOT NULL,
  function_title      TEXT NOT NULL,
  function_category   TEXT NOT NULL DEFAULT 'other' CHECK (function_category IN (
                        'ceo', 'president', 'founder', 'co_founder', 'directeur_general',
                        'directeur_reseau', 'directeur_developpement', 'directeur_franchise',
                        'directeur_expansion', 'responsable_partenariats', 'directeur_commercial',
                        'directeur_marketing', 'franchise', 'multi_franchise', 'gerant_club',
                        'directeur_club', 'responsable_club', 'other'
                      )),
  is_current          BOOLEAN NOT NULL DEFAULT TRUE,
  started_at           DATE,
  ended_at             DATE,
  confidence_level    fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_person ON fitness_intel.roles (person_id);
CREATE INDEX idx_roles_target ON fitness_intel.roles (target_type, target_id);
CREATE INDEX idx_roles_category ON fitness_intel.roles (function_category) WHERE is_current;

COMMENT ON TABLE fitness_intel.roles IS 'Rôle d''une personne vis-à-vis d''une enseigne/groupe/société/club — cible polymorphe (target_type/target_id).';


-- =============================================================================
-- OWNERSHIP GRAPH — Personne → Holding → Société exploitante → Établissement → Enseigne
-- =============================================================================

CREATE TABLE fitness_intel.ownership_relations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type           fitness_intel.entity_kind NOT NULL CHECK (from_type IN ('person', 'legal_entity')),
  from_id             UUID NOT NULL,
  to_type             fitness_intel.entity_kind NOT NULL CHECK (to_type IN ('legal_entity', 'club', 'group', 'brand')),
  to_id               UUID NOT NULL,
  relation_type       TEXT NOT NULL CHECK (relation_type IN (
                        'dirigeant', 'actionnaire', 'holding_of', 'franchise_of', 'succursale_of', 'exploite'
                      )),
  confidence_score    INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  evidence            TEXT[] NOT NULL DEFAULT '{}',
  source_record_ids   UUID[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ownership_from ON fitness_intel.ownership_relations (from_type, from_id);
CREATE INDEX idx_ownership_to ON fitness_intel.ownership_relations (to_type, to_id);

COMMENT ON TABLE fitness_intel.ownership_relations IS 'Arêtes du graphe de contrôle : personne/société → société/club/groupe/enseigne, avec score de confiance et justification (jamais présenté comme certain sous 100%).';


-- =============================================================================
-- CONTACTS & SITES WEB (cibles polymorphes)
-- =============================================================================

CREATE TABLE fitness_intel.contacts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type         fitness_intel.entity_kind NOT NULL,
  target_id           UUID NOT NULL,
  contact_type        TEXT NOT NULL CHECK (contact_type IN ('email', 'phone', 'form', 'address', 'other')),
  value               TEXT NOT NULL,
  is_public           BOOLEAN NOT NULL DEFAULT TRUE,
  confidence_level    fitness_intel.confidence_level NOT NULL DEFAULT 'unknown',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_target ON fitness_intel.contacts (target_type, target_id);

CREATE TABLE fitness_intel.websites (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type         fitness_intel.entity_kind NOT NULL,
  target_id           UUID NOT NULL,
  url                 TEXT NOT NULL,
  kind                TEXT NOT NULL DEFAULT 'other' CHECK (kind IN ('corporate', 'club_page', 'franchise_page', 'social', 'other')),
  last_crawled_at     TIMESTAMPTZ,
  robots_txt_allowed  BOOLEAN,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_websites_target ON fitness_intel.websites (target_type, target_id);


-- =============================================================================
-- PIPELINE — JOBS
-- =============================================================================

CREATE TABLE fitness_intel.scrape_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type            TEXT NOT NULL CHECK (job_type IN ('discover', 'normalize', 'match')),
  connector           TEXT NOT NULL,
  params              JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error', 'partial')),
  items_found         INTEGER NOT NULL DEFAULT 0,
  items_new           INTEGER NOT NULL DEFAULT 0,
  items_updated       INTEGER NOT NULL DEFAULT 0,
  duplicates_found    INTEGER NOT NULL DEFAULT 0,
  error_message       TEXT,
  triggered_by        TEXT NOT NULL DEFAULT 'system',
  started_at          TIMESTAMPTZ,
  finished_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scrape_jobs_status ON fitness_intel.scrape_jobs (status, created_at DESC);

COMMENT ON TABLE fitness_intel.scrape_jobs IS 'Jobs des étapes de collecte (DISCOVER/NORMALIZE/MATCH), par connecteur.';

CREATE TABLE fitness_intel.enrichment_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type            TEXT NOT NULL CHECK (job_type IN ('enrich', 'resolve_entities', 'detect_ownership', 'identify_decision_makers', 'score')),
  target_type         fitness_intel.entity_kind,
  target_id           UUID,
  params              JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error', 'partial')),
  items_processed     INTEGER NOT NULL DEFAULT 0,
  items_changed       INTEGER NOT NULL DEFAULT 0,
  error_message       TEXT,
  triggered_by        TEXT NOT NULL DEFAULT 'system',
  started_at          TIMESTAMPTZ,
  finished_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enrichment_jobs_status ON fitness_intel.enrichment_jobs (status, created_at DESC);

COMMENT ON TABLE fitness_intel.enrichment_jobs IS 'Jobs des étapes d''enrichissement (ENRICH/RESOLVE_ENTITIES/DETECT_OWNERSHIP/IDENTIFY_DECISION_MAKERS/SCORE).';


-- =============================================================================
-- ENTITY RESOLUTION — suggestions de fusion
-- =============================================================================

CREATE TABLE fitness_intel.merge_candidates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type         fitness_intel.entity_kind NOT NULL DEFAULT 'club',
  entity_id_a         UUID NOT NULL,
  entity_id_b         UUID NOT NULL,
  similarity_score    NUMERIC(5,2) NOT NULL CHECK (similarity_score BETWEEN 0 AND 100),
  matched_fields      JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {siret: true, address: 0.92, phone: true, ...}
  confidence_tier     TEXT NOT NULL CHECK (confidence_tier IN ('high', 'medium', 'low')),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'auto_merged', 'confirmed', 'rejected')),
  reviewed_by         TEXT,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entity_type, entity_id_a, entity_id_b)
);

CREATE INDEX idx_merge_candidates_status ON fitness_intel.merge_candidates (status);

COMMENT ON TABLE fitness_intel.merge_candidates IS 'Résultats de l''entity resolution : fusion auto (haute confiance), suggestion (moyenne), validation manuelle (faible).';


-- =============================================================================
-- SCORING
-- =============================================================================

CREATE TABLE fitness_intel.scoring_weights (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_type          TEXT NOT NULL CHECK (score_type IN ('pulvis_opportunity', 'contactability')),
  criterion_key       TEXT NOT NULL,
  label               TEXT NOT NULL,
  weight              NUMERIC(6,2) NOT NULL,
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (score_type, criterion_key)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.scoring_weights
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

COMMENT ON TABLE fitness_intel.scoring_weights IS 'Pondérations configurables des scores (éditables depuis Paramètres).';

CREATE TABLE fitness_intel.opportunity_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id               UUID NOT NULL REFERENCES fitness_intel.clubs(id) ON DELETE CASCADE,
  pulvis_score          INTEGER NOT NULL CHECK (pulvis_score BETWEEN 0 AND 100),
  pulvis_breakdown      JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{criterion, points, reason}]
  contactability_score  INTEGER NOT NULL CHECK (contactability_score BETWEEN 0 AND 100),
  contactability_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  weights_version       TIMESTAMPTZ,
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_id)
);

CREATE INDEX idx_opportunity_scores_pulvis ON fitness_intel.opportunity_scores (pulvis_score DESC);

COMMENT ON TABLE fitness_intel.opportunity_scores IS 'Dernier score calculé par club (PULVIS Opportunity Score + Contactability Score), avec justification détaillée.';


-- =============================================================================
-- PIPELINE COMMERCIAL (CRM)
-- =============================================================================

CREATE TABLE fitness_intel.crm_status (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id             UUID NOT NULL UNIQUE REFERENCES fitness_intel.clubs(id) ON DELETE CASCADE,
  stage               TEXT NOT NULL DEFAULT 'a_analyser' CHECK (stage IN (
                        'a_analyser', 'a_qualifier', 'prioritaire', 'a_contacter', 'contacte',
                        'relance', 'rendez_vous', 'negociation', 'accord', 'refus',
                        'installation_prevue', 'client_actif'
                      )),
  owner               TEXT,
  next_action         TEXT,
  next_action_date    DATE,
  last_contact_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_status_stage ON fitness_intel.crm_status (stage);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fitness_intel.crm_status
  FOR EACH ROW EXECUTE FUNCTION fitness_intel.trigger_set_updated_at();

CREATE TABLE fitness_intel.activities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id             UUID NOT NULL REFERENCES fitness_intel.clubs(id) ON DELETE CASCADE,
  activity_type       TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'status_change', 'system')),
  body                TEXT,
  actor               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_club ON fitness_intel.activities (club_id, created_at DESC);

CREATE TABLE fitness_intel.notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type         fitness_intel.entity_kind NOT NULL,
  target_id           UUID NOT NULL,
  body                TEXT NOT NULL,
  author              TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_target ON fitness_intel.notes (target_type, target_id);


-- =============================================================================
-- ROW LEVEL SECURITY
-- Lecture : utilisateurs authentifiés (dashboard interne). Écriture : uniquement
-- via service_role (routes serveur Next.js), jamais depuis le client anon.
-- =============================================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'fitness_intel'
  LOOP
    EXECUTE format('ALTER TABLE fitness_intel.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'CREATE POLICY %I ON fitness_intel.%I FOR SELECT TO authenticated USING (true);',
      t || '_select_authenticated', t
    );
  END LOOP;
END $$;


-- =============================================================================
-- VUES DE SYNTHÈSE (Dashboard KPIs)
-- =============================================================================

CREATE OR REPLACE VIEW fitness_intel.v_dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM fitness_intel.clubs) AS clubs_detectes,
  (SELECT COUNT(*) FROM fitness_intel.clubs WHERE confidence_level IN ('verified', 'probable')) AS clubs_enrichis,
  (SELECT COUNT(*) FROM fitness_intel.clubs WHERE region = 'Île-de-France') AS clubs_idf,
  (SELECT COUNT(*) FROM fitness_intel.clubs WHERE matched_establishment_id IS NOT NULL) AS clubs_avec_societe,
  (SELECT COUNT(DISTINCT brand_id) FROM fitness_intel.clubs
     JOIN fitness_intel.brands b ON b.id = clubs.brand_id WHERE b.business_model = 'franchise') AS enseignes_franchise,
  (SELECT COUNT(*) FROM fitness_intel.clubs c
     JOIN fitness_intel.establishments e ON e.id = c.matched_establishment_id
     JOIN fitness_intel.legal_entities le ON le.id = e.legal_entity_id
     WHERE NOT EXISTS (
       SELECT 1 FROM fitness_intel.ownership_relations o
       WHERE o.from_type = 'legal_entity' AND o.from_id = le.id AND o.relation_type = 'franchise_of'
     )) AS succursales_estimees,
  (SELECT COUNT(*) FROM fitness_intel.groups) AS groupes_franchises,
  (SELECT COUNT(DISTINCT person_id) FROM fitness_intel.roles WHERE is_current) AS dirigeants_identifies,
  (SELECT COUNT(*) FROM fitness_intel.people WHERE email IS NOT NULL) AS emails_trouves,
  (SELECT COUNT(*) FROM fitness_intel.people WHERE phone IS NOT NULL) AS telephones_trouves,
  (SELECT COUNT(*) FROM fitness_intel.people WHERE linkedin_url IS NOT NULL) AS contacts_linkedin,
  (SELECT COUNT(*) FROM fitness_intel.opportunity_scores WHERE pulvis_score >= 80) AS prospects_prioritaires,
  (SELECT COUNT(*) FROM fitness_intel.crm_status WHERE stage NOT IN ('a_analyser', 'a_qualifier')) AS prospects_contactes,
  (SELECT COUNT(*) FROM fitness_intel.crm_status WHERE stage = 'rendez_vous') AS rendez_vous,
  (SELECT COUNT(*) FROM fitness_intel.crm_status WHERE stage IN ('accord', 'installation_prevue', 'client_actif')) AS accords;

COMMENT ON VIEW fitness_intel.v_dashboard_kpis IS 'Agrégats calculés à la volée pour le Dashboard principal (jamais de compteur stocké en place).';

GRANT USAGE ON SCHEMA fitness_intel TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA fitness_intel TO authenticated;
GRANT SELECT ON fitness_intel.v_dashboard_kpis TO authenticated;
