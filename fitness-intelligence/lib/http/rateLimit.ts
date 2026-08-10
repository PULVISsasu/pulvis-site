import "server-only";

/**
 * Limiteur de débit en mémoire, par clé (nom du connecteur). Suffisant pour
 * un déploiement mono-instance ; à remplacer par un rate limiter partagé
 * (Redis…) si l'app tourne en multi-instance.
 */
const lastCallAt = new Map<string, number>();

export async function rateLimit(key: string, minIntervalMs: number): Promise<void> {
  const last = lastCallAt.get(key) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < minIntervalMs) {
    await new Promise((resolve) => setTimeout(resolve, minIntervalMs - elapsed));
  }
  lastCallAt.set(key, Date.now());
}

export function minIntervalFromPerMinute(ratePerMin: number): number {
  return Math.ceil(60_000 / Math.max(1, ratePerMin));
}
