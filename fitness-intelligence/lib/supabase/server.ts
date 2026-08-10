import "server-only";
import { createClient } from "@supabase/supabase-js";

type FitnessIntelClient = ReturnType<typeof createClient<any, "fitness_intel">>;

/**
 * Client Supabase serveur — clé service_role, jamais exposée au navigateur.
 * Toutes les pages (Server Components) et routes API de l'app passent par
 * ce client. Ciblage du schéma dédié `fitness_intel` (voir
 * docs/fitness-intelligence-architecture.md).
 *
 * Prérequis projet Supabase : le schéma `fitness_intel` doit être ajouté aux
 * "Exposed schemas" dans Settings → API → Data API (sinon PostgREST renvoie
 * 404/406 sur ce schéma). Ce réglage n'est pas pilotable en SQL, il doit être
 * fait une fois depuis le dashboard Supabase.
 */
let cached: FitnessIntelClient | null = null;

export function getFitnessIntelClient(): FitnessIntelClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants — voir .env.example"
    );
  }

  cached = createClient<any, "fitness_intel">(url, serviceRoleKey, {
    db: { schema: "fitness_intel" },
    auth: { persistSession: false },
  });
  return cached;
}
