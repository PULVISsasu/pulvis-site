-- =============================================================================
-- PULVIS Fitness Intelligence — Fonctions RPC
-- Migration : 012_fitness_intelligence_functions.sql
-- Entity resolution : détection de doublons de clubs par similarité de nom
-- (pg_trgm) + recoupement adresse/téléphone, exposée en RPC pour être
-- appelée depuis lib/pipeline/resolveEntities.ts sans charger tous les
-- clubs côté application (O(n²) resterait trop coûteux en JS au-delà de
-- quelques centaines de lignes).
-- =============================================================================

CREATE OR REPLACE FUNCTION fitness_intel.find_club_duplicates(
  similarity_threshold FLOAT DEFAULT 0.45,
  max_pairs INTEGER DEFAULT 200
)
RETURNS TABLE (
  club_id_a UUID,
  club_id_b UUID,
  name_similarity FLOAT,
  same_phone BOOLEAN,
  same_postal_code BOOLEAN,
  address_similarity FLOAT
) AS $$
  SELECT
    a.id AS club_id_a,
    b.id AS club_id_b,
    similarity(a.name, b.name) AS name_similarity,
    (a.phone IS NOT NULL AND a.phone = b.phone) AS same_phone,
    (a.postal_code IS NOT NULL AND a.postal_code = b.postal_code) AS same_postal_code,
    COALESCE(similarity(a.address, b.address), 0) AS address_similarity
  FROM fitness_intel.clubs a
  JOIN fitness_intel.clubs b ON a.id < b.id
  WHERE similarity(a.name, b.name) >= similarity_threshold
    AND (a.department = b.department OR a.department IS NULL OR b.department IS NULL)
    AND NOT EXISTS (
      SELECT 1 FROM fitness_intel.merge_candidates mc
      WHERE mc.entity_type = 'club'
        AND ((mc.entity_id_a = a.id AND mc.entity_id_b = b.id) OR (mc.entity_id_a = b.id AND mc.entity_id_b = a.id))
    )
  ORDER BY similarity(a.name, b.name) DESC
  LIMIT max_pairs;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION fitness_intel.find_club_duplicates IS 'Paires de clubs candidates à la fusion (entity resolution), non encore évaluées dans merge_candidates.';

GRANT EXECUTE ON FUNCTION fitness_intel.find_club_duplicates TO authenticated;
