/**
 * PostgREST expose une relation embarquée contrainte par un UNIQUE (donc
 * logiquement 1-1) tantôt en objet, tantôt en tableau à un élément selon le
 * contexte de la requête — cette aide normalise les deux cas.
 */
export function oneOf<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}
