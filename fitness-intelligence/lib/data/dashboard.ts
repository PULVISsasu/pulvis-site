import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import type { DashboardKpis } from "@/lib/types/database";

const EMPTY_KPIS: DashboardKpis = {
  clubs_detectes: 0,
  clubs_enrichis: 0,
  clubs_idf: 0,
  clubs_avec_societe: 0,
  enseignes_franchise: 0,
  succursales_estimees: 0,
  groupes_franchises: 0,
  dirigeants_identifies: 0,
  emails_trouves: 0,
  telephones_trouves: 0,
  contacts_linkedin: 0,
  prospects_prioritaires: 0,
  prospects_contactes: 0,
  rendez_vous: 0,
  accords: 0,
};

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const supabase = getFitnessIntelClient();
  const { data, error } = await supabase.from("v_dashboard_kpis").select("*").maybeSingle();
  if (error || !data) return EMPTY_KPIS;
  return data as DashboardKpis;
}

export interface TopOpportunityRow {
  club_id: string;
  club_name: string;
  brand_name: string | null;
  city: string | null;
  pulvis_score: number;
  contactability_score: number;
  decision_maker: string | null;
  decision_maker_email: string | null;
  decision_maker_linkedin: string | null;
  clubs_controlled: number | null;
}

/**
 * Vue stratégique "Top Opportunities" (§33 du brief) : les meilleurs scores,
 * enrichis du décideur associé le cas échéant et du nombre de clubs qu'il
 * contrôle (via ownership_relations / group_members).
 */
export async function getTopOpportunities(limit = 20): Promise<TopOpportunityRow[]> {
  const supabase = getFitnessIntelClient();
  const { data: scores, error } = await supabase
    .from("opportunity_scores")
    .select("club_id, pulvis_score, contactability_score, clubs(name, city, brand_id, brands(name))")
    .order("pulvis_score", { ascending: false })
    .limit(limit);

  if (error || !scores) return [];

  const clubIds = scores.map((s: any) => s.club_id);
  const { data: roles } = await supabase
    .from("roles")
    .select("person_id, target_type, target_id, function_title, is_current, people(full_name, email, linkedin_url)")
    .in("target_id", clubIds)
    .eq("target_type", "club")
    .eq("is_current", true);

  const { data: groupMembers } = await supabase
    .from("group_members")
    .select("club_id, group_id, groups(club_count_estimated)")
    .in("club_id", clubIds);

  const roleByClub = new Map<string, any>();
  for (const r of roles ?? []) {
    if (!roleByClub.has(r.target_id)) roleByClub.set(r.target_id, r);
  }
  const groupByClub = new Map<string, any>();
  for (const g of groupMembers ?? []) {
    groupByClub.set(g.club_id, g);
  }

  return scores.map((s: any) => {
    const role = roleByClub.get(s.club_id);
    const group = groupByClub.get(s.club_id);
    return {
      club_id: s.club_id,
      club_name: s.clubs?.name ?? "—",
      brand_name: s.clubs?.brands?.name ?? null,
      city: s.clubs?.city ?? null,
      pulvis_score: s.pulvis_score,
      contactability_score: s.contactability_score,
      decision_maker: role?.people?.full_name ?? null,
      decision_maker_email: role?.people?.email ?? null,
      decision_maker_linkedin: role?.people?.linkedin_url ?? null,
      clubs_controlled: group?.groups?.club_count_estimated ?? null,
    };
  });
}
