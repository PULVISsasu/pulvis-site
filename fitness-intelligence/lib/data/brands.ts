import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { oneOf } from "@/lib/utils";

export interface BrandListItem {
  id: string;
  name: string;
  slug: string;
  business_model: string;
  clubs_idf: number;
  franchise_count: number;
  succursale_count: number;
  groups_identified: number;
  decision_makers: number;
  avg_pulvis_score: number | null;
}

export async function listBrands(): Promise<BrandListItem[]> {
  const supabase = getFitnessIntelClient();
  const { data: brands } = await supabase.from("brands").select("*").order("name");
  if (!brands) return [];

  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, brand_id, opportunity_scores(pulvis_score)");

  const { data: roles } = await supabase.from("roles").select("target_id").eq("target_type", "brand").eq("is_current", true);
  const { data: groupBrands } = await supabase.from("group_brands").select("brand_id, group_id");

  const rolesByBrand = new Map<string, number>();
  for (const r of roles ?? []) rolesByBrand.set(r.target_id, (rolesByBrand.get(r.target_id) ?? 0) + 1);

  const groupsByBrand = new Map<string, Set<string>>();
  for (const gb of groupBrands ?? []) {
    if (!groupsByBrand.has(gb.brand_id)) groupsByBrand.set(gb.brand_id, new Set());
    groupsByBrand.get(gb.brand_id)!.add(gb.group_id);
  }

  return brands.map((b) => {
    const brandClubs = (clubs ?? []).filter((c: any) => c.brand_id === b.id);
    const scores = brandClubs
      .map((c: any) => oneOf<any>(c.opportunity_scores)?.pulvis_score)
      .filter((s: any) => typeof s === "number");
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      business_model: b.business_model,
      clubs_idf: brandClubs.length,
      franchise_count: b.business_model === "franchise" || b.business_model === "mixte" ? brandClubs.length : 0,
      succursale_count: b.business_model === "succursale" ? brandClubs.length : 0,
      groups_identified: groupsByBrand.get(b.id)?.size ?? 0,
      decision_makers: rolesByBrand.get(b.id) ?? 0,
      avg_pulvis_score: scores.length ? Math.round(scores.reduce((a: number, s: number) => a + s, 0) / scores.length) : null,
    };
  });
}

export async function getBrandDetail(id: string) {
  const supabase = getFitnessIntelClient();
  const { data: brand } = await supabase.from("brands").select("*, legal_entities:parent_company_legal_entity_id(*)").eq("id", id).maybeSingle();
  if (!brand) return null;

  const [{ data: clubs }, { data: roles }, { data: groupBrands }] = await Promise.all([
    supabase.from("clubs").select("id, name, city, department, status, tier, opportunity_scores(pulvis_score)").eq("brand_id", id),
    supabase.from("roles").select("*, people(*)").eq("target_type", "brand").eq("target_id", id).eq("is_current", true),
    supabase.from("group_brands").select("groups(*)").eq("brand_id", id),
  ]);

  return {
    brand,
    clubs: clubs ?? [],
    roles: roles ?? [],
    groups: (groupBrands ?? []).map((g: any) => g.groups).filter(Boolean),
  };
}
