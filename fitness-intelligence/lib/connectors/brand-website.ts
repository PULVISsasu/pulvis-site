import "server-only";
import { fetchJson } from "@/lib/http/fetchJson";
import type { ConnectorResult, DiscoverConnector, RawClubCandidate } from "./types";

/**
 * Connecteur "site enseigne" — chaque enseigne a une structure de page
 * différente (liste de clubs, carte interactive, page franchise...), donc
 * pas de scraping HTML générique automatique ici : ce fichier définit
 * l'interface commune + un exemple pour une enseigne qui expose un
 * sitemap.xml listant ses pages clubs (schéma fréquent). Pour ajouter une
 * enseigne, créer une config dans BRAND_SITE_CONFIGS avec son propre
 * sélecteur d'extraction, en respectant robots.txt.
 */

export interface BrandSiteConfig {
  brandSlug: string;
  sitemapUrl?: string;
  clubPageUrlPattern?: RegExp; // pour filtrer les URLs du sitemap qui sont des pages club
  robotsTxtUrl?: string;
}

export const BRAND_SITE_CONFIGS: BrandSiteConfig[] = [
  // Exemple à compléter enseigne par enseigne. Laissé vide intentionnellement :
  // chaque ajout doit être validé (robots.txt vérifié, structure de page
  // confirmée) avant d'être activé en production.
];

async function checkRobotsTxt(baseUrl: string, path: string): Promise<boolean> {
  try {
    const robotsUrl = new URL("/robots.txt", baseUrl).toString();
    const res = await fetch(robotsUrl);
    if (!res.ok) return true; // pas de robots.txt = pas d'interdiction explicite
    const text = await res.text();
    // Vérification simpliste : recherche d'un Disallow qui couvre le path.
    const disallowLines = text
      .split("\n")
      .filter((l) => l.trim().toLowerCase().startsWith("disallow:"))
      .map((l) => l.split(":")[1]?.trim());
    return !disallowLines.some((rule) => rule && path.startsWith(rule));
  } catch {
    return true;
  }
}

async function extractSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl);
  if (!res.ok) return [];
  const xml = await res.text();
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((m) => m[1] ?? "").filter(Boolean);
}

export function createBrandWebsiteConnector(config: BrandSiteConfig): DiscoverConnector {
  return {
    name: `brand-website:${config.brandSlug}`,

    async discover(): Promise<ConnectorResult<RawClubCandidate>> {
      const warnings: string[] = [];
      if (!config.sitemapUrl) {
        return {
          items: [],
          itemsFound: 0,
          sourceName: this.name,
          fetchedUrls: [],
          warnings: [`Aucune config de scraping pour ${config.brandSlug} — à ajouter dans lib/connectors/brand-website.ts`],
        };
      }

      const allowed = await checkRobotsTxt(config.sitemapUrl, new URL(config.sitemapUrl).pathname);
      if (!allowed) {
        return {
          items: [],
          itemsFound: 0,
          sourceName: this.name,
          fetchedUrls: [],
          warnings: [`robots.txt interdit l'accès à ${config.sitemapUrl} — connecteur désactivé pour cette enseigne.`],
        };
      }

      try {
        const urls = await extractSitemapUrls(config.sitemapUrl);
        const clubUrls = config.clubPageUrlPattern ? urls.filter((u) => config.clubPageUrlPattern!.test(u)) : urls;

        // Ce connecteur ne fait que lister les pages clubs candidates —
        // l'extraction du nom/adresse par page nécessite un sélecteur DOM
        // propre à chaque enseigne (non générique, volontairement laissé en
        // TODO pour éviter un parsing HTML fragile et non maintenu).
        const items: RawClubCandidate[] = clubUrls.map((url) => ({
          name: `À extraire — ${url}`,
          brandSlug: config.brandSlug,
          clubPageUrl: url,
        }));

        return { items, itemsFound: items.length, sourceName: this.name, fetchedUrls: [config.sitemapUrl], warnings };
      } catch (err) {
        warnings.push(`Échec sitemap: ${(err as Error).message}`);
        return { items: [], itemsFound: 0, sourceName: this.name, fetchedUrls: [config.sitemapUrl], warnings };
      }
    },
  };
}
