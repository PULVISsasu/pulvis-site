import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { runEnrichmentJob } from "./jobLog";
import { normalizeName } from "./store";

/**
 * DETECT OWNERSHIP — qualifie chaque club exploité (franchise / succursale)
 * et détecte les multi-franchisés (une même personne dirigeant plusieurs
 * clubs). Toute déduction porte un confidence_score et une justification
 * (evidence[]) — jamais présentée comme un fait certain (§7 du brief).
 */
export async function runDetectOwnership() {
  return runEnrichmentJob("detect_ownership", {}, {}, async () => {
    const supabase = getFitnessIntelClient();
    let itemsProcessed = 0;
    let itemsChanged = 0;

    // --- 1) Franchise vs succursale, par société exploitante rattachée à un club ---
    const { data: clubs } = await supabase
      .from("clubs")
      .select("id, brand_id, establishments:matched_establishment_id(legal_entity_id, legal_entities(raison_sociale))")
      .not("matched_establishment_id", "is", null)
      .not("brand_id", "is", null);

    const { data: brands } = await supabase.from("brands").select("id, name, parent_company_legal_entity_id");
    const brandById = new Map((brands ?? []).map((b) => [b.id, b]));

    for (const club of clubs ?? []) {
      itemsProcessed++;
      const legalEntityId = (club as any).establishments?.legal_entity_id;
      const raisonSociale = (club as any).establishments?.legal_entities?.raison_sociale;
      const brand = club.brand_id ? brandById.get(club.brand_id) : null;
      if (!legalEntityId || !brand) continue;

      const { data: existingRelation } = await supabase
        .from("ownership_relations")
        .select("id")
        .eq("from_type", "legal_entity")
        .eq("from_id", legalEntityId)
        .eq("to_type", "brand")
        .eq("to_id", brand.id)
        .maybeSingle();
      if (existingRelation) continue;

      let relationType: "succursale_of" | "franchise_of";
      let confidence: number;
      const evidence: string[] = [];

      if (brand.parent_company_legal_entity_id && brand.parent_company_legal_entity_id === legalEntityId) {
        relationType = "succursale_of";
        confidence = 95;
        evidence.push("Société identique à la maison mère déclarée de l'enseigne");
      } else {
        relationType = "franchise_of";
        confidence = 60;
        evidence.push(`Enseigne ${brand.name}`);
        if (raisonSociale && !normalizeName(raisonSociale).toLowerCase().includes(normalizeName(brand.name).toLowerCase())) {
          confidence += 10;
          evidence.push("Société juridiquement distincte du nom de l'enseigne");
        }
      }

      await supabase.from("ownership_relations").insert({
        from_type: "legal_entity",
        from_id: legalEntityId,
        to_type: "brand",
        to_id: brand.id,
        relation_type: relationType,
        confidence_score: Math.min(confidence, 95),
        evidence,
      });
      itemsChanged++;
    }

    // --- 2) Multi-franchisés : une personne dirigeant plusieurs clubs ---
    const { data: legalRoles } = await supabase.from("roles").select("person_id, target_id").eq("target_type", "legal_entity").eq("is_current", true);
    const { data: establishments } = await supabase.from("establishments").select("legal_entity_id, club_id").not("club_id", "is", null);
    const { data: allClubs } = await supabase.from("clubs").select("id, brand_id");
    const { data: people } = await supabase.from("people").select("id, full_name");

    const clubsByLegalEntity = new Map<string, Set<string>>();
    for (const e of establishments ?? []) {
      if (!e.club_id) continue;
      if (!clubsByLegalEntity.has(e.legal_entity_id)) clubsByLegalEntity.set(e.legal_entity_id, new Set());
      clubsByLegalEntity.get(e.legal_entity_id)!.add(e.club_id);
    }

    const clubsByPerson = new Map<string, Set<string>>();
    for (const r of legalRoles ?? []) {
      const clubIds = clubsByLegalEntity.get(r.target_id);
      if (!clubIds) continue;
      if (!clubsByPerson.has(r.person_id)) clubsByPerson.set(r.person_id, new Set());
      for (const c of clubIds) clubsByPerson.get(r.person_id)!.add(c);
    }

    const brandByClub = new Map((allClubs ?? []).map((c) => [c.id, c.brand_id]));
    const personById = new Map((people ?? []).map((p) => [p.id, p]));

    for (const [personId, clubIdsSet] of clubsByPerson.entries()) {
      if (clubIdsSet.size < 2) continue;
      itemsProcessed++;
      const person = personById.get(personId);
      if (!person) continue;

      const groupName = `${person.full_name} (multi-clubs)`;
      const { data: existingGroup } = await supabase.from("groups").select("id").eq("name", groupName).maybeSingle();

      let groupId: string;
      if (existingGroup) {
        groupId = existingGroup.id;
        await supabase.from("groups").update({ club_count_estimated: clubIdsSet.size }).eq("id", groupId);
      } else {
        const { data: inserted, error } = await supabase
          .from("groups")
          .insert({ name: groupName, club_count_estimated: clubIdsSet.size, confidence_level: "probable" })
          .select("id")
          .single();
        if (error) continue;
        groupId = inserted.id;
        itemsChanged++;
      }

      for (const clubId of clubIdsSet) {
        await supabase.from("group_members").upsert(
          { group_id: groupId, club_id: clubId, confidence_level: "probable", evidence: "Même dirigeant identifié sur plusieurs clubs" },
          { onConflict: "group_id,club_id" }
        );
      }

      const brandIds = new Set([...clubIdsSet].map((c) => brandByClub.get(c)).filter(Boolean) as string[]);
      for (const brandId of brandIds) {
        await supabase.from("group_brands").upsert({ group_id: groupId, brand_id: brandId }, { onConflict: "group_id,brand_id" });
      }

      const { data: existingRole } = await supabase
        .from("roles")
        .select("id")
        .eq("person_id", personId)
        .eq("target_type", "group")
        .eq("target_id", groupId)
        .maybeSingle();
      if (!existingRole) {
        await supabase.from("roles").insert({
          person_id: personId,
          target_type: "group",
          target_id: groupId,
          function_title: "Multi-franchisé",
          function_category: "multi_franchise",
          confidence_level: "probable",
        });
      }
    }

    return { counters: { itemsProcessed, itemsChanged } };
  });
}
