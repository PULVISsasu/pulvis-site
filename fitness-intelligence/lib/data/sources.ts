import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";

export async function listSources() {
  const supabase = getFitnessIntelClient();
  const { data } = await supabase.from("sources").select("*").order("name");
  return data ?? [];
}

export interface StaleRecord {
  id: string;
  target_type: string;
  field_name: string;
  collected_at: string;
  source_name: string | null;
}

export async function listStaleRecords(limit = 50): Promise<StaleRecord[]> {
  const supabase = getFitnessIntelClient();
  // Enregistrements jamais re-vérifiés et dont stale_after est dépassé.
  const { data } = await supabase
    .from("source_records")
    .select("id, target_type, field_name, collected_at, sources(name)")
    .is("verified_at", null)
    .order("collected_at", { ascending: true })
    .limit(limit);

  return (data ?? []).map((r: any) => ({
    id: r.id,
    target_type: r.target_type,
    field_name: r.field_name,
    collected_at: r.collected_at,
    source_name: r.sources?.name ?? null,
  }));
}
