import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";

// roles.target_id est une cible polymorphe (brand|group|legal_entity|club) —
// PostgREST ne peut pas l'auto-résoudre en embed (pas de FK réelle). On
// résout donc les libellés manuellement, par lot, par target_type.
async function resolveTargetNames(
  supabase: ReturnType<typeof getFitnessIntelClient>,
  roles: { target_type: string; target_id: string }[]
) {
  const brandIds = new Set<string>();
  const groupIds = new Set<string>();
  const legalEntityIds = new Set<string>();
  const clubIds = new Set<string>();
  for (const r of roles) {
    if (r.target_type === "brand") brandIds.add(r.target_id);
    else if (r.target_type === "group") groupIds.add(r.target_id);
    else if (r.target_type === "legal_entity") legalEntityIds.add(r.target_id);
    else if (r.target_type === "club") clubIds.add(r.target_id);
  }

  const [brands, groups, legalEntities, clubs] = await Promise.all([
    brandIds.size ? supabase.from("brands").select("id, name").in("id", [...brandIds]) : Promise.resolve({ data: [] }),
    groupIds.size ? supabase.from("groups").select("id, name").in("id", [...groupIds]) : Promise.resolve({ data: [] }),
    legalEntityIds.size
      ? supabase.from("legal_entities").select("id, raison_sociale").in("id", [...legalEntityIds])
      : Promise.resolve({ data: [] }),
    clubIds.size ? supabase.from("clubs").select("id, name, city").in("id", [...clubIds]) : Promise.resolve({ data: [] }),
  ]);

  const nameMap = new Map<string, string>();
  for (const b of brands.data ?? []) nameMap.set(`brand:${b.id}`, b.name);
  for (const g of groups.data ?? []) nameMap.set(`group:${g.id}`, g.name);
  for (const le of legalEntities.data ?? []) nameMap.set(`legal_entity:${le.id}`, le.raison_sociale);
  for (const c of clubs.data ?? []) nameMap.set(`club:${c.id}`, `${c.name}${c.city ? ` (${c.city})` : ""}`);

  return (targetType: string, targetId: string) => nameMap.get(`${targetType}:${targetId}`) ?? "—";
}

export async function listPeople() {
  const supabase = getFitnessIntelClient();
  const { data: people } = await supabase.from("people").select("*").order("full_name");
  if (!people) return [];

  const { data: roles } = await supabase
    .from("roles")
    .select("person_id, target_type, target_id, function_title")
    .eq("is_current", true);

  const resolveName = await resolveTargetNames(supabase, roles ?? []);

  const rolesByPerson = new Map<string, typeof roles>();
  for (const r of roles ?? []) {
    if (!rolesByPerson.has(r.person_id)) rolesByPerson.set(r.person_id, []);
    rolesByPerson.get(r.person_id)!.push(r);
  }

  const { data: groupMembers } = await supabase.from("group_members").select("group_id, club_id");
  const { data: groupRoles } = await supabase.from("roles").select("person_id, target_id").eq("target_type", "group");
  const clubsByGroup = new Map<string, number>();
  for (const gm of groupMembers ?? []) {
    clubsByGroup.set(gm.group_id, (clubsByGroup.get(gm.group_id) ?? 0) + 1);
  }
  const clubsControlledByPerson = new Map<string, number>();
  for (const gr of groupRoles ?? []) {
    const count = clubsByGroup.get(gr.target_id) ?? 0;
    clubsControlledByPerson.set(gr.person_id, (clubsControlledByPerson.get(gr.person_id) ?? 0) + count);
  }

  return people.map((p) => {
    const personRoles = rolesByPerson.get(p.id) ?? [];
    return {
      id: p.id,
      full_name: p.full_name,
      function: personRoles[0]?.function_title ?? p.current_function ?? "—",
      brands: [...new Set(personRoles.filter((r) => r.target_type === "brand").map((r) => resolveName("brand", r.target_id)))],
      clubs_controlled: clubsControlledByPerson.get(p.id) ?? 0,
      linkedin_url: p.linkedin_url,
      email: p.email,
      confidence_level: p.confidence_level,
    };
  });
}

export async function getPersonDetail(id: string) {
  const supabase = getFitnessIntelClient();
  const { data: person } = await supabase.from("people").select("*").eq("id", id).maybeSingle();
  if (!person) return null;

  const { data: roles } = await supabase.from("roles").select("*").eq("person_id", id);
  const resolveName = await resolveTargetNames(supabase, roles ?? []);
  const rolesWithNames = (roles ?? []).map((r) => ({ ...r, target_name: resolveName(r.target_type, r.target_id) }));

  const { data: ownership } = await supabase.from("ownership_relations").select("*").eq("from_type", "person").eq("from_id", id);

  return { person, roles: rolesWithNames, ownership: ownership ?? [] };
}
