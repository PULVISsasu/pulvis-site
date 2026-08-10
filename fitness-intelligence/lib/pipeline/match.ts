import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { LEGAL_CONNECTORS } from "@/lib/connectors";
import { upsertLegalEntity } from "./store";
import { runScrapeJob } from "./jobLog";

/**
 * MATCH — relie chaque club à sa société exploitante (SIREN) et son
 * établissement (SIRET). Deux voies : (1) SIRET détecté à l'étape DISCOVER
 * et stocké en source_record, résolu directement ; (2) recherche par
 * nom+adresse via le connecteur légal en fallback.
 */
export async function runMatch(limit = 100) {
  return runScrapeJob("match", "recherche-entreprises", { limit }, async () => {
    const supabase = getFitnessIntelClient();
    const { data: clubs } = await supabase
      .from("clubs")
      .select("id, name, address, city")
      .is("matched_establishment_id", null)
      .limit(limit);

    let itemsUpdated = 0;
    let itemsNew = 0;
    const warnings: string[] = [];
    const legalConnector = LEGAL_CONNECTORS["recherche-entreprises"];
    if (!legalConnector) throw new Error("Connecteur légal recherche-entreprises introuvable");

    for (const club of clubs ?? []) {
      try {
        const { data: siretRecord } = await supabase
          .from("source_records")
          .select("field_value")
          .eq("target_type", "club")
          .eq("target_id", club.id)
          .eq("field_name", "detected_siret")
          .order("collected_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let legalEntity = null;
        let siret: string | null = siretRecord?.field_value ?? null;

        if (siret) {
          const siren = siret.slice(0, 9);
          legalEntity = await legalConnector.lookupBySiren(siren);
        } else if (club.name) {
          const results = await legalConnector.searchByName(club.name);
          legalEntity = results.items[0] ?? null;
          warnings.push(...results.warnings);
        }

        if (!legalEntity) continue;

        const legalEntityId = await upsertLegalEntity(legalEntity, legalConnector.name);
        itemsNew++;

        const targetSiret = siret ?? legalEntity.etablissements?.find((e) => e.isSiege)?.siret;
        if (!targetSiret) continue;

        const { data: establishment } = await supabase.from("establishments").select("id").eq("siret", targetSiret).maybeSingle();
        if (!establishment) continue;

        await supabase.from("clubs").update({ matched_establishment_id: establishment.id, confidence_level: "verified" }).eq("id", club.id);
        await supabase.from("establishments").update({ club_id: club.id }).eq("id", establishment.id);
        itemsUpdated++;
      } catch (err) {
        warnings.push(`Club ${club.id}: ${(err as Error).message}`);
      }
    }

    return {
      counters: { itemsFound: clubs?.length ?? 0, itemsNew, itemsUpdated, duplicatesFound: 0 },
      warnings,
    };
  });
}
