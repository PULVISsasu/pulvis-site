import "server-only";
import { fetchJson } from "@/lib/http/fetchJson";
import { rateLimit, minIntervalFromPerMinute } from "@/lib/http/rateLimit";
import type { ConnectorResult, DiscoverConnector, LegalConnector, RawClubCandidate, RawLegalEntity } from "./types";

/**
 * Connecteur "Recherche d'Entreprises" (recherche-entreprises.api.gouv.fr) —
 * API publique agrégeant INSEE Sirene, INPI RNE et BODACC. Sans clé, CGU
 * permissives pour un usage professionnel de prospection B2B.
 *
 * ⚠️ Le réseau sortant de l'environnement de build de cette session est
 * restreint (voir docs/fitness-intelligence-architecture.md §1) : ce
 * connecteur n'a pas pu être exercé en live ici. Le contrat de l'API est
 * implémenté d'après sa documentation publique — à vérifier/ajuster contre
 * https://www.data.gouv.fr/dataservices/api-recherche-dentreprises/ au
 * premier run réel (les noms de champs peuvent évoluer).
 */

const BASE_URL = "https://recherche-entreprises.api.gouv.fr/search";
const SOURCE_NAME = "recherche-entreprises";
const MIN_INTERVAL_MS = minIntervalFromPerMinute(420);

interface ApiEtablissement {
  siret: string;
  adresse?: string;
  code_postal?: string;
  libelle_commune?: string;
  departement?: string;
  latitude?: string;
  longitude?: string;
  activite_principale?: string;
  etat_administratif?: "A" | "F";
  est_siege?: boolean;
  date_creation?: string;
}

interface ApiDirigeant {
  nom?: string;
  prenoms?: string;
  qualite?: string;
  denomination?: string; // dirigeant personne morale
  type_dirigeant?: string;
}

interface ApiResult {
  siren: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  date_creation?: string;
  etat_administratif?: "A" | "F";
  nature_juridique?: string;
  activite_principale?: string;
  tranche_effectif_salarie?: string;
  siege?: ApiEtablissement;
  matching_etablissements?: ApiEtablissement[];
  dirigeants?: ApiDirigeant[];
}

interface ApiResponse {
  results: ApiResult[];
  total_results: number;
  page: number;
  total_pages: number;
}

function mapEtatToStatut(etat: string | undefined): "actif" | "radie" | "unknown" {
  if (etat === "A") return "actif";
  if (etat === "F") return "radie";
  return "unknown";
}

function mapEtatToEtablissementStatut(etat: string | undefined): "actif" | "ferme" | "unknown" {
  if (etat === "A") return "actif";
  if (etat === "F") return "ferme";
  return "unknown";
}

function mapDirigeantName(d: ApiDirigeant): string {
  if (d.denomination) return d.denomination;
  return [d.prenoms, d.nom].filter(Boolean).join(" ") || "Dirigeant inconnu";
}

function mapResultToLegalEntity(r: ApiResult): RawLegalEntity {
  return {
    siren: r.siren,
    raisonSociale: r.nom_raison_sociale ?? r.nom_complet ?? r.siren,
    formeJuridique: r.nature_juridique,
    dateCreation: r.date_creation,
    codeNaf: r.activite_principale,
    effectifTranche: r.tranche_effectif_salarie,
    adresseSiege: r.siege?.adresse,
    codePostalSiege: r.siege?.code_postal,
    villeSiege: r.siege?.libelle_commune,
    statut: mapEtatToStatut(r.etat_administratif),
    dirigeants: (r.dirigeants ?? []).map((d) => ({
      fullName: mapDirigeantName(d),
      functionTitle: d.qualite ?? "Dirigeant",
    })),
    etablissements: (r.matching_etablissements ?? (r.siege ? [r.siege] : [])).map((e) => ({
      siret: e.siret,
      adresse: e.adresse,
      codePostal: e.code_postal,
      ville: e.libelle_commune,
      departement: e.departement,
      isSiege: e.est_siege ?? e.siret === r.siege?.siret,
      statut: mapEtatToEtablissementStatut(e.etat_administratif),
      dateCreation: e.date_creation,
    })),
  };
}

function mapEtablissementToClubCandidate(r: ApiResult, e: ApiEtablissement, brandSlug?: string): RawClubCandidate {
  return {
    name: r.nom_raison_sociale ?? r.nom_complet ?? r.siren,
    brandSlug,
    address: e.adresse,
    postalCode: e.code_postal,
    city: e.libelle_commune,
    department: e.departement,
    latitude: e.latitude ? Number(e.latitude) : undefined,
    longitude: e.longitude ? Number(e.longitude) : undefined,
    siret: e.siret,
    siren: r.siren,
  };
}

async function search(params: {
  q?: string;
  naf?: string;
  department?: string;
  page?: number;
}): Promise<ApiResponse> {
  await rateLimit(SOURCE_NAME, MIN_INTERVAL_MS);

  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.naf) qs.set("activite_principale", params.naf);
  if (params.department) qs.set("departement", params.department);
  qs.set("etat_administratif", "A");
  qs.set("page", String(params.page ?? 1));
  qs.set("per_page", "25");

  return fetchJson<ApiResponse>(`${BASE_URL}?${qs.toString()}`, { retries: 3 });
}

export const rechercheEntreprisesConnector: DiscoverConnector & LegalConnector = {
  name: SOURCE_NAME,

  async discover({ brandName, naf, department, query }): Promise<ConnectorResult<RawClubCandidate>> {
    const warnings: string[] = [];
    const fetchedUrls: string[] = [];
    const items: RawClubCandidate[] = [];

    try {
      const res = await search({ q: query ?? brandName, naf, department });
      fetchedUrls.push(BASE_URL);

      for (const r of res.results) {
        const etabs = r.matching_etablissements ?? (r.siege ? [r.siege] : []);
        for (const e of etabs) {
          items.push(mapEtablissementToClubCandidate(r, e, brandName?.toLowerCase().replace(/\s+/g, "-")));
        }
      }

      return { items, itemsFound: res.total_results, sourceName: SOURCE_NAME, fetchedUrls, warnings };
    } catch (err) {
      warnings.push(`Échec de la requête discover: ${(err as Error).message}`);
      return { items: [], itemsFound: 0, sourceName: SOURCE_NAME, fetchedUrls, warnings };
    }
  },

  async lookupBySiren(siren: string): Promise<RawLegalEntity | null> {
    await rateLimit(SOURCE_NAME, MIN_INTERVAL_MS);
    try {
      const res = await fetchJson<ApiResponse>(`${BASE_URL}?q=${siren}`, { retries: 3 });
      const match = res.results.find((r) => r.siren === siren) ?? res.results[0];
      return match ? mapResultToLegalEntity(match) : null;
    } catch {
      return null;
    }
  },

  async searchByName(name: string, department?: string): Promise<ConnectorResult<RawLegalEntity>> {
    const warnings: string[] = [];
    try {
      const res = await search({ q: name, department });
      return {
        items: res.results.map(mapResultToLegalEntity),
        itemsFound: res.total_results,
        sourceName: SOURCE_NAME,
        fetchedUrls: [BASE_URL],
        warnings,
      };
    } catch (err) {
      warnings.push(`Échec de la requête searchByName: ${(err as Error).message}`);
      return { items: [], itemsFound: 0, sourceName: SOURCE_NAME, fetchedUrls: [BASE_URL], warnings };
    }
  },
};
