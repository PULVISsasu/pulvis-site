import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";

export async function listGroups() {
  const supabase = getFitnessIntelClient();
  const { data: groups } = await supabase.from("groups").select("*, group_brands(brands(name)), group_members(club_id)").order("club_count_estimated", { ascending: false });
  if (!groups) return [];

  const { data: roles } = await supabase.from("roles").select("*, people(*)").eq("target_type", "group");
  const rolesByGroup = new Map<string, any[]>();
  for (const r of roles ?? []) {
    if (!rolesByGroup.has(r.target_id)) rolesByGroup.set(r.target_id, []);
    rolesByGroup.get(r.target_id)!.push(r);
  }

  return groups.map((g: any) => {
    const dirigeant = rolesByGroup.get(g.id)?.[0];
    return {
      id: g.id,
      name: g.name,
      dirigeant: dirigeant?.people?.full_name ?? null,
      enseignes: (g.group_brands ?? []).map((gb: any) => gb.brands?.name).filter(Boolean),
      clubs_count: g.group_members?.length ?? g.club_count_estimated ?? 0,
      email: g.public_email ?? dirigeant?.people?.email ?? null,
      phone: g.public_phone ?? dirigeant?.people?.phone ?? null,
    };
  });
}

export async function getGroupDetail(id: string) {
  const supabase = getFitnessIntelClient();
  const { data: group } = await supabase.from("groups").select("*, group_brands(brands(*))").eq("id", id).maybeSingle();
  if (!group) return null;

  const [{ data: members }, { data: roles }] = await Promise.all([
    supabase.from("group_members").select("*, clubs(*)").eq("group_id", id),
    supabase.from("roles").select("*, people(*)").eq("target_type", "group").eq("target_id", id),
  ]);

  return { group, members: members ?? [], roles: roles ?? [] };
}
