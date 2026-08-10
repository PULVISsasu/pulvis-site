import "server-only";

/**
 * Format standardisé retourné par tous les connecteurs — quelle que soit la
 * source (API officielle, site enseigne, import manuel). Le pipeline ne
 * connaît que ce format ; jamais couplé au format natif d'une source tierce.
 */

export interface RawClubCandidate {
  name: string;
  brandSlug?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  department?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  clubPageUrl?: string;
  siret?: string; // si la source le fournit directement (ex. Recherche d'Entreprises)
  siren?: string;
}

export interface RawLegalEntity {
  siren: string;
  raisonSociale: string;
  nomCommercial?: string;
  formeJuridique?: string;
  dateCreation?: string;
  codeNaf?: string;
  activiteLibelle?: string;
  capitalSocial?: number;
  effectifTranche?: string;
  adresseSiege?: string;
  codePostalSiege?: string;
  villeSiege?: string;
  statut: "actif" | "radie" | "unknown";
  dirigeants?: RawDirigeant[];
  etablissements?: RawEtablissement[];
}

export interface RawDirigeant {
  fullName: string;
  functionTitle: string;
}

export interface RawEtablissement {
  siret: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  departement?: string;
  isSiege: boolean;
  statut: "actif" | "ferme" | "unknown";
  dateCreation?: string;
}

export interface ConnectorResult<T> {
  items: T[];
  itemsFound: number;
  sourceName: string;
  fetchedUrls: string[];
  warnings: string[];
}

export interface DiscoverConnector {
  name: string;
  discover(params: { brandName?: string; naf?: string; department?: string; query?: string }): Promise<ConnectorResult<RawClubCandidate>>;
}

export interface LegalConnector {
  name: string;
  lookupBySiren(siren: string): Promise<RawLegalEntity | null>;
  searchByName(name: string, department?: string): Promise<ConnectorResult<RawLegalEntity>>;
}
