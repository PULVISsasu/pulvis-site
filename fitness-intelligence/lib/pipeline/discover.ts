import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { DISCOVER_CONNECTORS } from "@/lib/connectors";
import { upsertClubCandidate, logSourceRecord } from "./store";
import { runScrapeJob } from "./jobLog";
import type { RawClubCandidate } from "@/lib/connectors/types";

export interface DiscoverParams {
  connector: keyof typeof DISCOVER_CONNECTORS | string;
  brandName: string;
  department?: string;
  naf?: string;
}

async function resolveBrandId(brandName: string): Promise<string> {
  const supabase = getFitnessIntelClient();
  const slug = brandName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { data: existing } = await supabase.from("brands").select("id").eq("slug", slug).maybeSingle();
  if (existing) return existing.id;

  const { data: inserted, error } = await supabase
    .from("brands")
    .insert({ name: brandName, slug, business_model: "unknown", confidence_level: "unknown" })
    .select("id")
    .single();
  if (error) throw new Error(`resolveBrandId: ${error.message}`);
  return inserted.id;
}

export async function runDiscover(params: DiscoverParams) {
  const connector = DISCOVER_CONNECTORS[params.connector];
  if (!connector) throw new Error(`Connecteur DISCOVER inconnu: ${params.connector}`);

  return runScrapeJob("discover", connector.name, params as any, async () => {
    const brandId = await resolveBrandId(params.brandName);
    const result = await connector.discover({
      brandName: params.brandName,
      department: params.department,
      naf: params.naf ?? "93.13Z", // Activités des centres de culture physique (fitness/salles de sport)
    });

    let itemsNew = 0;
    let itemsUpdated = 0;
    let duplicatesFound = 0;

    for (const candidate of result.items as RawClubCandidate[]) {
      const { id, isNew } = await upsertClubCandidate(candidate, brandId);
      if (isNew) itemsNew++;
      else {
        itemsUpdated++;
        duplicatesFound++;
      }

      if (candidate.siret) {
        await logSourceRecord({
          sourceName: connector.name,
          targetType: "club",
          targetId: id,
          fieldName: "detected_siret",
          fieldValue: candidate.siret,
          method: "api_call",
          confidenceLevel: "probable",
        });
      }
    }

    return {
      counters: {
        itemsFound: result.itemsFound,
        itemsNew,
        itemsUpdated,
        duplicatesFound,
      },
      warnings: result.warnings,
    };
  });
}
