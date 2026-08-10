import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";

type ScrapeJobType = "discover" | "normalize" | "match";
type EnrichmentJobType = "enrich" | "resolve_entities" | "detect_ownership" | "identify_decision_makers" | "score";

export interface JobCounters {
  itemsFound?: number;
  itemsNew?: number;
  itemsUpdated?: number;
  duplicatesFound?: number;
  itemsProcessed?: number;
  itemsChanged?: number;
}

async function startJob(table: "scrape_jobs" | "enrichment_jobs", row: Record<string, unknown>) {
  const supabase = getFitnessIntelClient();
  const { data, error } = await supabase
    .from(table)
    .insert({ ...row, status: "running", started_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error) throw new Error(`Impossible de créer le job ${table}: ${error.message}`);
  return data.id as string;
}

async function finishJob(table: "scrape_jobs" | "enrichment_jobs", id: string, status: "success" | "error" | "partial", counters: JobCounters, errorMessage?: string) {
  const supabase = getFitnessIntelClient();
  await supabase
    .from(table)
    .update({
      status,
      finished_at: new Date().toISOString(),
      error_message: errorMessage ?? null,
      items_found: counters.itemsFound,
      items_new: counters.itemsNew,
      items_updated: counters.itemsUpdated,
      duplicates_found: counters.duplicatesFound,
      items_processed: counters.itemsProcessed,
      items_changed: counters.itemsChanged,
    })
    .eq("id", id);
}

export async function runScrapeJob<T extends JobCounters>(
  jobType: ScrapeJobType,
  connector: string,
  params: Record<string, unknown>,
  fn: () => Promise<{ counters: T; warnings?: string[] }>
): Promise<{ jobId: string; counters: T; warnings: string[] }> {
  const jobId = await startJob("scrape_jobs", { job_type: jobType, connector, params });
  try {
    const { counters, warnings = [] } = await fn();
    await finishJob("scrape_jobs", jobId, warnings.length ? "partial" : "success", counters, warnings.join(" | ") || undefined);
    return { jobId, counters, warnings };
  } catch (err) {
    await finishJob("scrape_jobs", jobId, "error", {} as T, (err as Error).message);
    throw err;
  }
}

export async function runEnrichmentJob<T extends JobCounters>(
  jobType: EnrichmentJobType,
  target: { targetType?: string; targetId?: string },
  params: Record<string, unknown>,
  fn: () => Promise<{ counters: T; warnings?: string[] }>
): Promise<{ jobId: string; counters: T; warnings: string[] }> {
  const jobId = await startJob("enrichment_jobs", { job_type: jobType, target_type: target.targetType ?? null, target_id: target.targetId ?? null, params });
  try {
    const { counters, warnings = [] } = await fn();
    await finishJob("enrichment_jobs", jobId, warnings.length ? "partial" : "success", counters, warnings.join(" | ") || undefined);
    return { jobId, counters, warnings };
  } catch (err) {
    await finishJob("enrichment_jobs", jobId, "error", {} as T, (err as Error).message);
    throw err;
  }
}
