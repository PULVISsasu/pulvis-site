import "server-only";
import { rechercheEntreprisesConnector } from "./recherche-entreprises";
import { sireneConnector } from "./sirene";
import { inpiConnector } from "./inpi";
import type { DiscoverConnector, LegalConnector } from "./types";

export const DISCOVER_CONNECTORS: Record<string, DiscoverConnector> = {
  "recherche-entreprises": rechercheEntreprisesConnector,
};

export const LEGAL_CONNECTORS: Record<string, LegalConnector> = {
  "recherche-entreprises": rechercheEntreprisesConnector,
  "sirene-insee": sireneConnector,
  "inpi-rne": inpiConnector,
};

export * from "./types";
export { rechercheEntreprisesConnector, sireneConnector, inpiConnector };
export { lookupBodaccBySiren, hasActiveInsolvencyProceeding } from "./bodacc";
export { parseManualInput, parseCsvClubs, parseCsv } from "./manual-import";
export { createBrandWebsiteConnector, BRAND_SITE_CONFIGS } from "./brand-website";
export { webSearch } from "./web-search";
