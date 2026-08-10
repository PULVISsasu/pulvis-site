import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import type { ScoringWeight } from "@/lib/types/database";

export async function listScoringWeights(): Promise<ScoringWeight[]> {
  const supabase = getFitnessIntelClient();
  const { data } = await supabase.from("scoring_weights").select("*").order("score_type").order("weight", { ascending: false });
  return data ?? [];
}
