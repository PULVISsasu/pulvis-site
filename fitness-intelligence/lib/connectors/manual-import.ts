import "server-only";
import type { RawClubCandidate } from "./types";

/**
 * Connecteur d'import manuel — saisie utilisateur (URL club, nom
 * d'établissement, SIREN/SIRET, enseigne, CSV). Ne fait aucune requête
 * réseau lui-même : normalise l'entrée en RawClubCandidate(s), que le
 * pipeline (NORMALIZE → MATCH → ENRICH…) traite ensuite comme n'importe
 * quelle autre source.
 */

export interface ManualImportInput {
  clubName?: string;
  brandName?: string;
  url?: string;
  siren?: string;
  siret?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  department?: string;
}

export function parseManualInput(input: ManualImportInput): RawClubCandidate {
  return {
    name: input.clubName || input.url || input.siret || input.siren || "Import manuel",
    brandSlug: input.brandName?.toLowerCase().replace(/\s+/g, "-"),
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    department: input.department,
    clubPageUrl: input.url,
    siret: input.siret,
    siren: input.siren,
  };
}

const CSV_COLUMN_ALIASES: Record<string, keyof ManualImportInput> = {
  club: "clubName",
  nom: "clubName",
  name: "clubName",
  enseigne: "brandName",
  brand: "brandName",
  url: "url",
  site: "url",
  siren: "siren",
  siret: "siret",
  adresse: "address",
  address: "address",
  ville: "city",
  city: "city",
  code_postal: "postalCode",
  codepostal: "postalCode",
  departement: "department",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/["']/g, "");
}

/** Parseur CSV minimal (pas de dépendance externe) — gère les champs entre guillemets avec virgules échappées. */
export function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const [headerLine, ...dataLines] = lines;
  if (!headerLine) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  };

  const headers = parseLine(headerLine).map(normalizeHeader);
  return dataLines.map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

export function parseCsvClubs(content: string): RawClubCandidate[] {
  const rows = parseCsv(content);
  return rows.map((row) => {
    const input: ManualImportInput = {};
    for (const [header, value] of Object.entries(row)) {
      const key = CSV_COLUMN_ALIASES[header];
      if (key && value) (input as any)[key] = value;
    }
    return parseManualInput(input);
  });
}
