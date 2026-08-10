import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import type { ScrapeJob, EnrichmentJob, MergeCandidate } from "@/lib/types/database";

export async function listScrapeJobs(limit = 30): Promise<ScrapeJob[]> {
  const supabase = getFitnessIntelClient();
  const { data } = await supabase.from("scrape_jobs").select("*").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function listEnrichmentJobs(limit = 30): Promise<EnrichmentJob[]> {
  const supabase = getFitnessIntelClient();
  const { data } = await supabase.from("enrichment_jobs").select("*").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function listPendingMergeCandidates(limit = 50): Promise<(MergeCandidate & { club_a_name: string; club_b_name: string })[]> {
  const supabase = getFitnessIntelClient();
  const { data } = await supabase
    .from("merge_candidates")
    .select("*")
    .eq("entity_type", "club")
    .eq("status", "pending")
    .order("similarity_score", { ascending: false })
    .limit(limit);
  if (!data || data.length === 0) return [];

  // entity_id_a/entity_id_b sont polymorphes (pas de FK réelle vers clubs) —
  // résolution manuelle des noms, comme dans lib/data/people.ts.
  const clubIds = [...new Set(data.flatMap((d) => [d.entity_id_a, d.entity_id_b]))];
  const { data: clubs } = await supabase.from("clubs").select("id, name").in("id", clubIds);
  const nameById = new Map((clubs ?? []).map((c) => [c.id, c.name]));

  return data.map((d) => ({
    ...d,
    club_a_name: nameById.get(d.entity_id_a) ?? d.entity_id_a,
    club_b_name: nameById.get(d.entity_id_b) ?? d.entity_id_b,
  }));
}
