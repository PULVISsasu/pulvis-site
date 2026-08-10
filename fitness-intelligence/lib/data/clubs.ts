import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { oneOf } from "@/lib/utils";

export interface ClubListItem {
  id: string;
  name: string;
  city: string | null;
  department: string | null;
  address: string | null;
  status: string;
  tier: string;
  brand_id: string | null;
  brand_name: string | null;
  business_model: string | null;
  siret: string | null;
  legal_entity_name: string | null;
  crm_stage: string | null;
  pulvis_score: number | null;
  contactability_score: number | null;
  confidence_level: string;
  is_demo_data: boolean;
  updated_at: string;
}

export interface ClubFilters {
  search?: string;
  department?: string;
  brandId?: string;
  status?: string;
  minScore?: number;
}

export async function listClubs(filters: ClubFilters = {}): Promise<ClubListItem[]> {
  const supabase = getFitnessIntelClient();
  let query = supabase
    .from("clubs")
    .select(
      `id, name, city, department, address, status, tier, brand_id, confidence_level, is_demo_data, updated_at,
       brands(name, business_model),
       establishments:matched_establishment_id(siret, legal_entities(raison_sociale)),
       crm_status(stage),
       opportunity_scores(pulvis_score, contactability_score)`
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  if (filters.department) query = query.eq("department", filters.department);
  if (filters.brandId) query = query.eq("brand_id", filters.brandId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error || !data) return [];

  let rows: ClubListItem[] = data.map((c: any) => {
    const crm = oneOf<any>(c.crm_status);
    const score = oneOf<any>(c.opportunity_scores);
    return {
      id: c.id,
      name: c.name,
      city: c.city,
      department: c.department,
      address: c.address,
      status: c.status,
      tier: c.tier,
      brand_id: c.brand_id,
      brand_name: c.brands?.name ?? null,
      business_model: c.brands?.business_model ?? null,
      siret: c.establishments?.siret ?? null,
      legal_entity_name: c.establishments?.legal_entities?.raison_sociale ?? null,
      crm_stage: crm?.stage ?? null,
      pulvis_score: score?.pulvis_score ?? null,
      contactability_score: score?.contactability_score ?? null,
      confidence_level: c.confidence_level,
      is_demo_data: c.is_demo_data,
      updated_at: c.updated_at,
    };
  });

  if (filters.minScore) {
    rows = rows.filter((r) => (r.pulvis_score ?? 0) >= filters.minScore!);
  }

  return rows;
}

export async function getClubDetail(id: string) {
  const supabase = getFitnessIntelClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("*, brands(*), establishments:matched_establishment_id(*, legal_entities(*))")
    .eq("id", id)
    .maybeSingle();
  if (!club) return null;

  const [{ data: roles }, { data: groupMembers }, { data: score }, { data: crm }, { data: activities }, { data: sourceRecords }, { data: notes }] =
    await Promise.all([
      supabase
        .from("roles")
        .select("*, people(*)")
        .eq("target_type", "club")
        .eq("target_id", id),
      supabase
        .from("group_members")
        .select("*, groups(*)")
        .eq("club_id", id),
      supabase.from("opportunity_scores").select("*").eq("club_id", id).maybeSingle(),
      supabase.from("crm_status").select("*").eq("club_id", id).maybeSingle(),
      supabase.from("activities").select("*").eq("club_id", id).order("created_at", { ascending: false }).limit(50),
      supabase.from("source_records").select("*, sources(name)").eq("target_type", "club").eq("target_id", id).order("collected_at", { ascending: false }).limit(100),
      supabase.from("notes").select("*").eq("target_type", "club").eq("target_id", id).order("created_at", { ascending: false }),
    ]);

  let legalEntityRoles: any[] = [];
  if (club.establishments?.legal_entities?.id) {
    const { data } = await supabase
      .from("roles")
      .select("*, people(*)")
      .eq("target_type", "legal_entity")
      .eq("target_id", club.establishments.legal_entities.id);
    legalEntityRoles = data ?? [];
  }

  return {
    club,
    roles: roles ?? [],
    legalEntityRoles,
    groups: (groupMembers ?? []).map((g: any) => g.groups).filter(Boolean),
    score,
    crm,
    activities: activities ?? [],
    sourceRecords: sourceRecords ?? [],
    notes: notes ?? [],
  };
}
