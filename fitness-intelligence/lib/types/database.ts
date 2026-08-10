// Types TypeScript correspondant au schéma fitness_intel (sql/010_fitness_intelligence_schema.sql).
// Maintenus à la main pour rester lisibles ; en cas de dérive, comparer avec
// `mcp__Supabase__generate_typescript_types` (ne couvre que les schémas exposés).

export type ConfidenceLevel = "verified" | "probable" | "estimated" | "unknown";
export type EntityKind = "brand" | "group" | "legal_entity" | "club" | "establishment" | "person";
export type BusinessModel = "succursale" | "franchise" | "mixte" | "unknown";
export type ClubStatus = "open" | "closed" | "unknown";
export type ClubTier = "premium" | "standard" | "unknown";
export type CrmStage =
  | "a_analyser"
  | "a_qualifier"
  | "prioritaire"
  | "a_contacter"
  | "contacte"
  | "relance"
  | "rendez_vous"
  | "negociation"
  | "accord"
  | "refus"
  | "installation_prevue"
  | "client_actif";

export const CRM_STAGES: { value: CrmStage; label: string }[] = [
  { value: "a_analyser", label: "À analyser" },
  { value: "a_qualifier", label: "À qualifier" },
  { value: "prioritaire", label: "Prioritaire" },
  { value: "a_contacter", label: "À contacter" },
  { value: "contacte", label: "Contacté" },
  { value: "relance", label: "Relance" },
  { value: "rendez_vous", label: "Rendez-vous" },
  { value: "negociation", label: "Négociation" },
  { value: "accord", label: "Accord" },
  { value: "refus", label: "Refus" },
  { value: "installation_prevue", label: "Installation prévue" },
  { value: "client_actif", label: "Client / partenaire actif" },
];

export const FUNCTION_CATEGORIES = [
  "ceo",
  "president",
  "founder",
  "co_founder",
  "directeur_general",
  "directeur_reseau",
  "directeur_developpement",
  "directeur_franchise",
  "directeur_expansion",
  "responsable_partenariats",
  "directeur_commercial",
  "directeur_marketing",
  "franchise",
  "multi_franchise",
  "gerant_club",
  "directeur_club",
  "responsable_club",
  "other",
] as const;
export type FunctionCategory = (typeof FUNCTION_CATEGORIES)[number];

export const IDF_DEPARTMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"] as const;

export interface Brand {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  corporate_site: string | null;
  linkedin_url: string | null;
  estimated_club_count: number | null;
  idf_presence: boolean;
  business_model: BusinessModel;
  parent_company_legal_entity_id: string | null;
  hq_address: string | null;
  hq_city: string | null;
  hq_postal_code: string | null;
  public_email: string | null;
  public_phone: string | null;
  confidence_level: ConfidenceLevel;
  is_demo_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  raison_sociale: string | null;
  siren: string | null;
  club_count_estimated: number | null;
  website: string | null;
  linkedin_url: string | null;
  public_email: string | null;
  public_phone: string | null;
  geographic_zone: string | null;
  confidence_level: ConfidenceLevel;
  is_demo_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalEntity {
  id: string;
  siren: string;
  raison_sociale: string;
  nom_commercial: string | null;
  forme_juridique: string | null;
  date_creation: string | null;
  code_naf: string | null;
  activite_libelle: string | null;
  capital_social: number | null;
  effectif_tranche: string | null;
  adresse_siege: string | null;
  code_postal_siege: string | null;
  ville_siege: string | null;
  statut: "actif" | "radie" | "unknown";
  tva_intracommunautaire: string | null;
  chiffre_affaires: number | null;
  chiffre_affaires_annee: number | null;
  resultat_net: number | null;
  holding_id: string | null;
  confidence_level: ConfidenceLevel;
  is_demo_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface Establishment {
  id: string;
  siret: string;
  legal_entity_id: string;
  club_id: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  departement: string | null;
  is_siege: boolean;
  statut: "actif" | "ferme" | "unknown";
  date_creation: string | null;
  confidence_level: ConfidenceLevel;
  is_demo_data: boolean;
}

export interface Club {
  id: string;
  brand_id: string | null;
  name: string;
  club_type: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  department: string | null;
  region: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  club_page_url: string | null;
  linkedin_url: string | null;
  social_links: Record<string, string>;
  opening_hours: Record<string, string> | null;
  surface_m2: number | null;
  amenities: Record<string, boolean>;
  estimated_attendance: string | null;
  reviews_count: number | null;
  rating: number | null;
  opened_estimated_at: string | null;
  status: ClubStatus;
  tier: ClubTier;
  gender_focus: string | null;
  matched_establishment_id: string | null;
  confidence_level: ConfidenceLevel;
  is_demo_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  current_function: string | null;
  current_company: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
  professional_location: string | null;
  notes: string | null;
  confidence_level: ConfidenceLevel;
  is_demo_data: boolean;
}

export interface Role {
  id: string;
  person_id: string;
  target_type: EntityKind;
  target_id: string;
  function_title: string;
  function_category: FunctionCategory;
  is_current: boolean;
  started_at: string | null;
  ended_at: string | null;
  confidence_level: ConfidenceLevel;
}

export interface OwnershipRelation {
  id: string;
  from_type: "person" | "legal_entity";
  from_id: string;
  to_type: "legal_entity" | "club" | "group" | "brand";
  to_id: string;
  relation_type: "dirigeant" | "actionnaire" | "holding_of" | "franchise_of" | "succursale_of" | "exploite";
  confidence_score: number;
  evidence: string[];
  source_record_ids: string[];
  created_at: string;
}

export interface ScoreBreakdownItem {
  criterion: string;
  label: string;
  points: number;
  max_points: number;
  reason: string;
}

export interface OpportunityScore {
  id: string;
  club_id: string;
  pulvis_score: number;
  pulvis_breakdown: ScoreBreakdownItem[];
  contactability_score: number;
  contactability_breakdown: ScoreBreakdownItem[];
  computed_at: string;
}

export interface CrmStatusRow {
  id: string;
  club_id: string;
  stage: CrmStage;
  owner: string | null;
  next_action: string | null;
  next_action_date: string | null;
  last_contact_at: string | null;
  updated_at: string;
}

export interface ScrapeJob {
  id: string;
  job_type: "discover" | "normalize" | "match";
  connector: string;
  params: Record<string, unknown>;
  status: "pending" | "running" | "success" | "error" | "partial";
  items_found: number;
  items_new: number;
  items_updated: number;
  duplicates_found: number;
  error_message: string | null;
  triggered_by: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface EnrichmentJob {
  id: string;
  job_type: "enrich" | "resolve_entities" | "detect_ownership" | "identify_decision_makers" | "score";
  target_type: EntityKind | null;
  target_id: string | null;
  params: Record<string, unknown>;
  status: "pending" | "running" | "success" | "error" | "partial";
  items_processed: number;
  items_changed: number;
  error_message: string | null;
  triggered_by: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface MergeCandidate {
  id: string;
  entity_type: EntityKind;
  entity_id_a: string;
  entity_id_b: string;
  similarity_score: number;
  matched_fields: Record<string, unknown>;
  confidence_tier: "high" | "medium" | "low";
  status: "pending" | "auto_merged" | "confirmed" | "rejected";
  created_at: string;
}

export interface ScoringWeight {
  id: string;
  score_type: "pulvis_opportunity" | "contactability";
  criterion_key: string;
  label: string;
  weight: number;
  description: string | null;
  is_active: boolean;
}

export interface DashboardKpis {
  clubs_detectes: number;
  clubs_enrichis: number;
  clubs_idf: number;
  clubs_avec_societe: number;
  enseignes_franchise: number;
  succursales_estimees: number;
  groupes_franchises: number;
  dirigeants_identifies: number;
  emails_trouves: number;
  telephones_trouves: number;
  contacts_linkedin: number;
  prospects_prioritaires: number;
  prospects_contactes: number;
  rendez_vous: number;
  accords: number;
}
