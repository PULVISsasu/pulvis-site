import "server-only";
import type { LegalConnector, ConnectorResult, RawLegalEntity } from "./types";

/**
 * Connecteur INPI RNE (Registre National des Entreprises) — stub typé.
 * Nécessite un compte https://data.inpi.fr (INPI_API_USER/INPI_API_PASSWORD).
 * Utile pour les bénéficiaires effectifs et les actes déposés, données non
 * couvertes par recherche-entreprises. Non activé tant que les identifiants
 * ne sont pas fournis — dégrade en connecteur inactif plutôt que d'échouer.
 */

const SOURCE_NAME = "inpi-rne";

function isConfigured(): boolean {
  return Boolean(process.env.INPI_API_USER && process.env.INPI_API_PASSWORD);
}

export const inpiConnector: LegalConnector = {
  name: SOURCE_NAME,

  async lookupBySiren(): Promise<RawLegalEntity | null> {
    if (!isConfigured()) return null;
    // TODO: implémenter l'authentification INPI (POST /api/sso/login) puis
    // GET /api/companies/{siren} une fois des identifiants fournis. Non
    // implémenté pour l'instant : recherche-entreprises couvre déjà les
    // données RNE de base (dirigeants, statut).
    return null;
  },

  async searchByName(): Promise<ConnectorResult<RawLegalEntity>> {
    return {
      items: [],
      itemsFound: 0,
      sourceName: SOURCE_NAME,
      fetchedUrls: [],
      warnings: isConfigured()
        ? ["Connecteur INPI non implémenté au-delà du typage — voir TODO dans lib/connectors/inpi.ts"]
        : ["INPI_API_USER/INPI_API_PASSWORD non configurés — connecteur inactif."],
    };
  },
};
