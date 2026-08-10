import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { lookupBodaccBySiren, hasActiveInsolvencyProceeding } from "@/lib/connectors/bodacc";
import { runEnrichmentJob } from "./jobLog";

/**
 * ENRICH — signaux complémentaires par société déjà résolue (étape MATCH) :
 * procédures collectives BODACC (signal négatif pour la prospection). Ne
 * modifie jamais une donnée vérifiée ailleurs — ajoute une note + un
 * source_record, laisse l'utilisateur/le scoring en tenir compte.
 */
export async function runEnrich(limit = 100) {
  return runEnrichmentJob("enrich", {}, { limit }, async () => {
    const supabase = getFitnessIntelClient();
    const { data: entities } = await supabase.from("legal_entities").select("id, siren, raison_sociale").eq("statut", "actif").limit(limit);

    let itemsProcessed = 0;
    let itemsChanged = 0;

    for (const entity of entities ?? []) {
      itemsProcessed++;
      const records = await lookupBodaccBySiren(entity.siren);
      if (records.length === 0) continue;

      if (hasActiveInsolvencyProceeding(records)) {
        const { data: establishments } = await supabase.from("establishments").select("club_id").eq("legal_entity_id", entity.id).not("club_id", "is", null);
        for (const e of establishments ?? []) {
          if (!e.club_id) continue;
          await supabase.from("notes").insert({
            target_type: "club",
            target_id: e.club_id,
            body: `⚠️ Procédure collective détectée pour ${entity.raison_sociale} (BODACC) — à vérifier avant tout engagement commercial.`,
            author: "pipeline:enrich",
          });
          itemsChanged++;
        }
      }
    }

    return { counters: { itemsProcessed, itemsChanged } };
  });
}
