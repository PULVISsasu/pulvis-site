import "server-only";
import { fetchJson } from "@/lib/http/fetchJson";
import { rateLimit, minIntervalFromPerMinute } from "@/lib/http/rateLimit";
import type { ConnectorResult, LegalConnector, RawLegalEntity } from "./types";

/**
 * Connecteur API Sirene (INSEE) — complète recherche-entreprises pour les
 * champs les plus frais (l'API Sirene est la source primaire de l'INSEE).
 * Nécessite un jeton (compte gratuit sur https://portail-api.insee.fr).
 * Dégrade proprement si SIRENE_API_KEY est absent : renvoie une liste vide
 * avec un avertissement plutôt que d'échouer le job.
 */

const BASE_URL = "https://api.insee.fr/api-sirene/3.11";
const SOURCE_NAME = "sirene-insee";
const MIN_INTERVAL_MS = minIntervalFromPerMinute(30);

interface SireneUniteLegale {
  siren: string;
  denominationUniteLegale?: string;
  categorieJuridiqueUniteLegale?: string;
  dateCreationUniteLegale?: string;
  activitePrincipaleUniteLegale?: string;
  etatAdministratifUniteLegale?: "A" | "C";
}

function isConfigured(): boolean {
  return Boolean(process.env.SIRENE_API_KEY);
}

async function apiGet<T>(path: string): Promise<T> {
  await rateLimit(SOURCE_NAME, MIN_INTERVAL_MS);
  return fetchJson<T>(`${BASE_URL}${path}`, {
    headers: { "X-INSEE-Api-Key-Integration": process.env.SIRENE_API_KEY! },
    retries: 2,
  });
}

export const sireneConnector: LegalConnector = {
  name: SOURCE_NAME,

  async lookupBySiren(siren: string): Promise<RawLegalEntity | null> {
    if (!isConfigured()) return null;
    try {
      const res = await apiGet<{ uniteLegale: SireneUniteLegale }>(`/siren/${siren}`);
      const ul = res.uniteLegale;
      return {
        siren: ul.siren,
        raisonSociale: ul.denominationUniteLegale ?? ul.siren,
        formeJuridique: ul.categorieJuridiqueUniteLegale,
        dateCreation: ul.dateCreationUniteLegale,
        codeNaf: ul.activitePrincipaleUniteLegale,
        statut: ul.etatAdministratifUniteLegale === "A" ? "actif" : ul.etatAdministratifUniteLegale === "C" ? "radie" : "unknown",
      };
    } catch {
      return null;
    }
  },

  async searchByName(name: string): Promise<ConnectorResult<RawLegalEntity>> {
    if (!isConfigured()) {
      return {
        items: [],
        itemsFound: 0,
        sourceName: SOURCE_NAME,
        fetchedUrls: [],
        warnings: ["SIRENE_API_KEY non configurée — connecteur désactivé, utiliser recherche-entreprises."],
      };
    }
    try {
      const q = encodeURIComponent(`denominationUniteLegale:"${name}"`);
      const res = await apiGet<{ unitesLegales: SireneUniteLegale[] }>(`/siren?q=${q}`);
      return {
        items: (res.unitesLegales ?? []).map((ul) => ({
          siren: ul.siren,
          raisonSociale: ul.denominationUniteLegale ?? ul.siren,
          formeJuridique: ul.categorieJuridiqueUniteLegale,
          dateCreation: ul.dateCreationUniteLegale,
          codeNaf: ul.activitePrincipaleUniteLegale,
          statut: (ul.etatAdministratifUniteLegale === "A" ? "actif" : "radie") as "actif" | "radie",
        })),
        itemsFound: (res.unitesLegales ?? []).length,
        sourceName: SOURCE_NAME,
        fetchedUrls: [BASE_URL],
        warnings: [],
      };
    } catch (err) {
      return {
        items: [],
        itemsFound: 0,
        sourceName: SOURCE_NAME,
        fetchedUrls: [BASE_URL],
        warnings: [`Échec Sirene: ${(err as Error).message}`],
      };
    }
  },
};
