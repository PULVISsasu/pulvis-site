import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { runEnrichmentJob } from "./jobLog";

/**
 * RESOLVE ENTITIES — entity resolution des clubs (déduplication). Utilise
 * fitness_intel.find_club_duplicates (similarité trigram + recoupement
 * adresse/téléphone) puis classe chaque paire :
 *  - haute confiance (même téléphone OU même SIRET via établissement
 *    partagé) → fusion automatique
 *  - confiance moyenne (nom très proche + même département) → suggestion
 *    (merge_candidates, status=pending)
 *  - confiance faible → suggestion aussi, mais tier=low, laissée à la
 *    validation manuelle explicite (jamais fusionnée automatiquement)
 */
export async function runResolveEntities() {
  return runEnrichmentJob("resolve_entities", {}, {}, async () => {
    const supabase = getFitnessIntelClient();
    const { data: pairs, error } = await supabase.rpc("find_club_duplicates", { similarity_threshold: 0.45, max_pairs: 300 });
    if (error) throw new Error(`find_club_duplicates: ${error.message}`);

    let itemsProcessed = 0;
    let itemsChanged = 0;

    for (const pair of pairs ?? []) {
      itemsProcessed++;

      // SIRET partagé = même établissement légal = même club, quasi certain.
      const { data: estabA } = await supabase.from("establishments").select("siret").eq("club_id", pair.club_id_a).maybeSingle();
      const { data: estabB } = await supabase.from("establishments").select("siret").eq("club_id", pair.club_id_b).maybeSingle();
      const sameSiret = Boolean(estabA?.siret && estabB?.siret && estabA.siret === estabB.siret);

      let tier: "high" | "medium" | "low";
      let similarityScore: number;

      if (sameSiret || (pair.same_phone && pair.name_similarity >= 0.6)) {
        tier = "high";
        similarityScore = Math.round(Math.max(pair.name_similarity, 0.9) * 100);
      } else if (pair.name_similarity >= 0.65 && (pair.same_postal_code || pair.address_similarity >= 0.5)) {
        tier = "medium";
        similarityScore = Math.round(pair.name_similarity * 100);
      } else {
        tier = "low";
        similarityScore = Math.round(pair.name_similarity * 100);
      }

      const matchedFields = {
        siret: sameSiret,
        phone: pair.same_phone,
        postal_code: pair.same_postal_code,
        name_similarity: pair.name_similarity,
        address_similarity: pair.address_similarity,
      };

      const status = tier === "high" ? "auto_merged" : "pending";

      const { error: insertError } = await supabase.from("merge_candidates").insert({
        entity_type: "club",
        entity_id_a: pair.club_id_a,
        entity_id_b: pair.club_id_b,
        similarity_score: similarityScore,
        matched_fields: matchedFields,
        confidence_tier: tier,
        status,
      });
      if (insertError) continue; // doublon déjà enregistré (contrainte UNIQUE), on passe au suivant

      itemsChanged++;

      if (tier === "high") {
        await mergeClubs(pair.club_id_a, pair.club_id_b);
      }
    }

    return { counters: { itemsProcessed, itemsChanged } };
  });
}

/**
 * Fusion haute confiance : conserve le club A (le plus ancien / premier
 * créé), reporte les liens du club B dessus, marque B comme fermé plutôt
 * que de le supprimer (traçabilité).
 */
export async function mergeClubs(keepId: string, dropId: string) {
  const supabase = getFitnessIntelClient();

  await supabase.from("group_members").update({ club_id: keepId }).eq("club_id", dropId);
  await supabase.from("activities").update({ club_id: keepId }).eq("club_id", dropId);
  await supabase.from("notes").update({ target_id: keepId }).eq("target_type", "club").eq("target_id", dropId);

  const { data: dropEstablishment } = await supabase.from("establishments").select("id").eq("club_id", dropId).maybeSingle();
  const { data: keepClub } = await supabase.from("clubs").select("matched_establishment_id").eq("id", keepId).maybeSingle();
  if (dropEstablishment && !keepClub?.matched_establishment_id) {
    await supabase.from("establishments").update({ club_id: keepId }).eq("id", dropEstablishment.id);
    await supabase.from("clubs").update({ matched_establishment_id: dropEstablishment.id }).eq("id", keepId);
  }

  await supabase
    .from("clubs")
    .update({ status: "closed", confidence_level: "verified" })
    .eq("id", dropId);

  await supabase.from("activities").insert({
    club_id: keepId,
    activity_type: "system",
    body: `Fusionné automatiquement avec le doublon ${dropId} (entity resolution, haute confiance).`,
    actor: "pipeline:resolve_entities",
  });
}
