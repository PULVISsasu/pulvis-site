import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { oneOf } from "@/lib/utils";
import type { CrmStage } from "@/lib/types/database";

export interface ProspectionCard {
  club_id: string;
  club_name: string;
  brand_name: string | null;
  city: string | null;
  stage: CrmStage;
  owner: string | null;
  next_action: string | null;
  next_action_date: string | null;
  pulvis_score: number | null;
}

export async function listProspectionBoard(): Promise<ProspectionCard[]> {
  const supabase = getFitnessIntelClient();
  const { data } = await supabase
    .from("crm_status")
    .select("club_id, stage, owner, next_action, next_action_date, clubs(name, city, brand_id, brands(name), opportunity_scores(pulvis_score))")
    .order("next_action_date", { ascending: true, nullsFirst: false });

  if (!data) return [];

  return data.map((row: any) => {
    const club = row.clubs;
    const score = oneOf<any>(club?.opportunity_scores);
    return {
      club_id: row.club_id,
      club_name: club?.name ?? "—",
      brand_name: club?.brands?.name ?? null,
      city: club?.city ?? null,
      stage: row.stage,
      owner: row.owner,
      next_action: row.next_action,
      next_action_date: row.next_action_date,
      pulvis_score: score?.pulvis_score ?? null,
    };
  });
}
