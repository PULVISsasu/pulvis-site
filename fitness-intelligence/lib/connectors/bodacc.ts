import "server-only";
import { fetchJson } from "@/lib/http/fetchJson";
import { rateLimit, minIntervalFromPerMinute } from "@/lib/http/rateLimit";

/**
 * Connecteur BODACC (Bulletin officiel des annonces civiles et
 * commerciales) — open data, sans clé. Utilisé à l'étape ENRICH pour
 * détecter les procédures collectives / radiations récentes d'une société
 * (signal négatif pour la prospection : ne pas prioriser un prospect en
 * procédure de liquidation).
 */

const BASE_URL = "https://bodacc-datadila.opendatasoft.com/api/records/1.0/search/";
const SOURCE_NAME = "bodacc";
const MIN_INTERVAL_MS = minIntervalFromPerMinute(60);

export interface BodaccRecord {
  numeroAnnonce: string;
  dateParution: string;
  familleAvis: string; // ex. "Procédure collective", "Vente et cession"
  commercant: string;
}

interface ApiRecord {
  fields: {
    numeroannonce?: string;
    dateparution?: string;
    familleavis_lib?: string;
    commercant?: string;
  };
}

interface ApiResponse {
  nhits: number;
  records: ApiRecord[];
}

export async function lookupBodaccBySiren(siren: string): Promise<BodaccRecord[]> {
  await rateLimit(SOURCE_NAME, MIN_INTERVAL_MS);
  const qs = new URLSearchParams({
    dataset: "annonces-commerciales",
    q: `registre:${siren}`,
    rows: "20",
    sort: "-dateparution",
  });

  try {
    const res = await fetchJson<ApiResponse>(`${BASE_URL}?${qs.toString()}`, { retries: 2 });
    return res.records.map((r) => ({
      numeroAnnonce: r.fields.numeroannonce ?? "",
      dateParution: r.fields.dateparution ?? "",
      familleAvis: r.fields.familleavis_lib ?? "unknown",
      commercant: r.fields.commercant ?? "",
    }));
  } catch {
    return [];
  }
}

export function hasActiveInsolvencyProceeding(records: BodaccRecord[]): boolean {
  return records.some((r) => /procédure collective|liquidation|redressement/i.test(r.familleAvis));
}
