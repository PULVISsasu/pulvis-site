import "server-only";

export interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/**
 * fetch() avec timeout, retry/backoff et gestion d'erreur explicite. Utilisé
 * par tous les connecteurs HTTP direct (voir lib/connectors/*). Ne masque
 * jamais une erreur réseau : elle remonte pour que le job appelant la
 * consigne dans scrape_jobs.error_message.
 */
export async function fetchJson<T = unknown>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { timeoutMs = 15_000, retries = 2, ...init } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);

      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
      }
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new NonRetryableHttpError(`HTTP ${res.status} ${res.statusText} — ${url} — ${body.slice(0, 300)}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      if (err instanceof NonRetryableHttpError || attempt === retries) break;
      const backoffMs = 500 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError;
}

export class NonRetryableHttpError extends Error {}
