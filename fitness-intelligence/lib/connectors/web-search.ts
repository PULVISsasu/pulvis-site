import "server-only";

/**
 * Connecteur de recherche web — n'implémente PAS de scraping de moteur de
 * recherche (interdit par leurs CGU). Se contente d'appeler une API de
 * recherche autorisée si l'utilisateur en configure une (Bing Web Search,
 * SerpAPI, Brave Search API…). Désactivé par défaut.
 */

const SOURCE_NAME = "web-search";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

function isConfigured(): boolean {
  return Boolean(process.env.WEB_SEARCH_API_KEY && process.env.WEB_SEARCH_PROVIDER);
}

export async function webSearch(query: string): Promise<{ results: WebSearchResult[]; warnings: string[] }> {
  if (!isConfigured()) {
    return {
      results: [],
      warnings: [
        `${SOURCE_NAME}: WEB_SEARCH_API_KEY/WEB_SEARCH_PROVIDER non configurés — connecteur inactif (aucun scraping de moteur de recherche n'est implémenté).`,
      ],
    };
  }

  // TODO: brancher le provider choisi (ex. Bing Web Search API) une fois une
  // clé fournie. Volontairement non implémenté par défaut.
  return { results: [], warnings: [`Provider ${process.env.WEB_SEARCH_PROVIDER} non implémenté — voir TODO dans lib/connectors/web-search.ts`] };
}
