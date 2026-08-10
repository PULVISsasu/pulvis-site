import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import type { RawClubCandidate, RawLegalEntity } from "@/lib/connectors/types";
import { IDF_DEPARTMENTS } from "@/lib/types/database";

export function departmentFromPostalCode(postalCode?: string): string | null {
  if (!postalCode || postalCode.length < 2) return null;
  const dept = postalCode.slice(0, 2);
  return (IDF_DEPARTMENTS as readonly string[]).includes(dept) ? dept : dept;
}

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAddress(address?: string): string | null {
  if (!address) return null;
  return normalizeName(address).toUpperCase();
}

export async function logSourceRecord(params: {
  sourceName: string;
  targetType: "brand" | "group" | "legal_entity" | "club" | "establishment" | "person";
  targetId: string;
  fieldName: string;
  fieldValue?: string | null;
  url?: string;
  method: string;
  confidenceLevel: "verified" | "probable" | "estimated" | "unknown";
}) {
  const supabase = getFitnessIntelClient();
  const { data: source } = await supabase.from("sources").select("id").eq("name", params.sourceName).maybeSingle();
  await supabase.from("source_records").insert({
    source_id: source?.id ?? null,
    target_type: params.targetType,
    target_id: params.targetId,
    field_name: params.fieldName,
    field_value: params.fieldValue ?? null,
    url: params.url,
    method: params.method,
    confidence_level: params.confidenceLevel,
  });
}

/** Upsert d'un club détecté (étape DISCOVER) — clé naturelle : SIRET si connu, sinon brand_id + adresse normalisée. */
export async function upsertClubCandidate(candidate: RawClubCandidate, brandId: string | null): Promise<{ id: string; isNew: boolean }> {
  const supabase = getFitnessIntelClient();
  const department = candidate.department ?? departmentFromPostalCode(candidate.postalCode);

  let existing: { id: string } | null = null;
  if (candidate.siret) {
    const { data } = await supabase.from("establishments").select("club_id").eq("siret", candidate.siret).maybeSingle();
    if (data?.club_id) existing = { id: data.club_id };
  }
  if (!existing && candidate.address && brandId) {
    const { data } = await supabase
      .from("clubs")
      .select("id")
      .eq("brand_id", brandId)
      .ilike("address", `%${normalizeAddress(candidate.address)}%`)
      .maybeSingle();
    if (data) existing = data;
  }

  const row = {
    brand_id: brandId,
    name: candidate.name,
    address: candidate.address ?? null,
    postal_code: candidate.postalCode ?? null,
    city: candidate.city ?? null,
    department,
    latitude: candidate.latitude ?? null,
    longitude: candidate.longitude ?? null,
    phone: candidate.phone ?? null,
    email: candidate.email ?? null,
    website: candidate.website ?? null,
    club_page_url: candidate.clubPageUrl ?? null,
    confidence_level: candidate.siret ? "probable" : "estimated",
  };

  if (existing) {
    await supabase.from("clubs").update(row).eq("id", existing.id);
    return { id: existing.id, isNew: false };
  }

  const { data: inserted, error } = await supabase.from("clubs").insert(row).select("id").single();
  if (error) throw new Error(`upsertClubCandidate: ${error.message}`);

  await supabase.from("crm_status").insert({ club_id: inserted.id, stage: "a_analyser" });

  return { id: inserted.id, isNew: true };
}

/** Upsert d'une société (SIREN) + ses établissements (SIRET), avec dirigeants en roles. */
export async function upsertLegalEntity(entity: RawLegalEntity, sourceName: string): Promise<string> {
  const supabase = getFitnessIntelClient();

  const { data: existing } = await supabase.from("legal_entities").select("id").eq("siren", entity.siren).maybeSingle();

  const row = {
    siren: entity.siren,
    raison_sociale: entity.raisonSociale,
    nom_commercial: entity.nomCommercial ?? null,
    forme_juridique: entity.formeJuridique ?? null,
    date_creation: entity.dateCreation ?? null,
    code_naf: entity.codeNaf ?? null,
    activite_libelle: entity.activiteLibelle ?? null,
    capital_social: entity.capitalSocial ?? null,
    effectif_tranche: entity.effectifTranche ?? null,
    adresse_siege: entity.adresseSiege ?? null,
    code_postal_siege: entity.codePostalSiege ?? null,
    ville_siege: entity.villeSiege ?? null,
    statut: entity.statut,
    confidence_level: "verified" as const,
  };

  let legalEntityId: string;
  if (existing) {
    await supabase.from("legal_entities").update(row).eq("id", existing.id);
    legalEntityId = existing.id;
  } else {
    const { data: inserted, error } = await supabase.from("legal_entities").insert(row).select("id").single();
    if (error) throw new Error(`upsertLegalEntity: ${error.message}`);
    legalEntityId = inserted.id;
  }

  await logSourceRecord({
    sourceName,
    targetType: "legal_entity",
    targetId: legalEntityId,
    fieldName: "raison_sociale",
    fieldValue: entity.raisonSociale,
    method: "api_call",
    confidenceLevel: "verified",
  });

  for (const etab of entity.etablissements ?? []) {
    const { data: existingEtab } = await supabase.from("establishments").select("id").eq("siret", etab.siret).maybeSingle();
    const etabRow = {
      legal_entity_id: legalEntityId,
      adresse: etab.adresse ?? null,
      code_postal: etab.codePostal ?? null,
      ville: etab.ville ?? null,
      departement: etab.departement ?? departmentFromPostalCode(etab.codePostal),
      is_siege: etab.isSiege,
      statut: etab.statut,
      date_creation: etab.dateCreation ?? null,
      confidence_level: "verified" as const,
    };
    if (existingEtab) {
      await supabase.from("establishments").update(etabRow).eq("id", existingEtab.id);
    } else {
      await supabase.from("establishments").insert({ siret: etab.siret, ...etabRow });
    }
  }

  for (const dirigeant of entity.dirigeants ?? []) {
    const fullName = dirigeant.fullName;
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || null;

    const { data: existingPerson } = await supabase
      .from("people")
      .select("id")
      .ilike("full_name", fullName)
      .maybeSingle();

    let personId: string;
    if (existingPerson) {
      personId = existingPerson.id;
    } else {
      const { data: insertedPerson, error } = await supabase
        .from("people")
        .insert({ first_name: firstName, last_name: lastName, confidence_level: "verified" })
        .select("id")
        .single();
      if (error) throw new Error(`upsertLegalEntity dirigeant: ${error.message}`);
      personId = insertedPerson.id;
    }

    const { data: existingRole } = await supabase
      .from("roles")
      .select("id")
      .eq("person_id", personId)
      .eq("target_type", "legal_entity")
      .eq("target_id", legalEntityId)
      .maybeSingle();

    if (!existingRole) {
      await supabase.from("roles").insert({
        person_id: personId,
        target_type: "legal_entity",
        target_id: legalEntityId,
        function_title: dirigeant.functionTitle,
        function_category: guessFunctionCategory(dirigeant.functionTitle),
        confidence_level: "verified",
      });
    }
  }

  return legalEntityId;
}

function guessFunctionCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("président")) return "president";
  if (t.includes("gérant")) return "gerant_club";
  if (t.includes("directeur général") || t.includes("dg")) return "directeur_general";
  if (t.includes("fondateur")) return "founder";
  return "other";
}
