import "server-only";
import type { ScoreBreakdownItem, ScoringWeight } from "@/lib/types/database";

export interface ClubScoringInput {
  club: {
    id: string;
    department: string | null;
    tier: string;
    amenities: Record<string, boolean> | null;
    opening_hours: Record<string, unknown> | null;
    opened_estimated_at: string | null;
    reviews_count: number | null;
    rating: number | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    club_page_url: string | null;
    linkedin_url: string | null;
  };
  brand: { website: string | null; public_email: string | null; public_phone: string | null } | null;
  groupClubCount: number | null;
  decisionMaker: { email: string | null; phone: string | null; linkedin_url: string | null; function_category: string } | null;
  hasContactFormSource: boolean;
}

const RELEVANT_FUNCTIONS = new Set([
  "ceo",
  "president",
  "founder",
  "co_founder",
  "directeur_general",
  "directeur_reseau",
  "directeur_developpement",
  "directeur_franchise",
  "directeur_expansion",
  "responsable_partenariats",
  "franchise",
  "multi_franchise",
  "gerant_club",
]);

const PARIS_PETITE_COURONNE = new Set(["75", "92", "93", "94"]);

function hasExtendedHours(openingHours: Record<string, unknown> | null): boolean {
  if (!openingHours) return false;
  const hours = [...JSON.stringify(openingHours).matchAll(/(\d{1,2}):\d{2}/g)].map((m) => Number(m[1]));
  if (hours.length < 2) return false;
  return Math.max(...hours) - Math.min(...hours) >= 15;
}

function isRecentOpening(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  return date >= twoYearsAgo;
}

function computeScore(
  weights: ScoringWeight[],
  criteria: Record<string, { pass: boolean; reason: string; partialFactor?: number }>
): { total: number; breakdown: ScoreBreakdownItem[] } {
  const breakdown: ScoreBreakdownItem[] = [];
  let total = 0;

  for (const w of weights) {
    if (!w.is_active) continue;
    const c = criteria[w.criterion_key];
    if (!c) continue;
    const points = c.pass ? Math.round(w.weight * (c.partialFactor ?? 1)) : 0;
    total += points;
    breakdown.push({ criterion: w.criterion_key, label: w.label, points, max_points: w.weight, reason: c.reason });
  }

  return { total: Math.min(100, Math.round(total)), breakdown };
}

export function computePulvisOpportunityScore(
  weights: ScoringWeight[],
  input: ClubScoringInput
): { total: number; breakdown: ScoreBreakdownItem[] } {
  const { club, groupClubCount, decisionMaker } = input;
  const attendanceSignal = (club.reviews_count ?? 0) >= 100 && (club.rating ?? 0) >= 4;

  const clubCountBeyondFirst = Math.max(0, (groupClubCount ?? 1) - 1);

  return computeScore(weights, {
    multi_club_owner: {
      pass: (groupClubCount ?? 0) >= 2,
      reason: (groupClubCount ?? 0) >= 2 ? `Détenteur de ${groupClubCount} clubs identifié` : "Aucun groupe multi-clubs détecté",
    },
    club_count_bonus: {
      pass: clubCountBeyondFirst > 0,
      partialFactor: Math.min(1, clubCountBeyondFirst / 5),
      reason: clubCountBeyondFirst > 0 ? `${clubCountBeyondFirst} club(s) supplémentaire(s) détenu(s)` : "Un seul club détenu",
    },
    decision_maker_identified: {
      pass: Boolean(decisionMaker),
      reason: decisionMaker ? "Décideur rattaché à ce club/société" : "Aucun décideur rattaché",
    },
    email_available: {
      pass: Boolean(decisionMaker?.email || club.email),
      reason: decisionMaker?.email || club.email ? "Email professionnel disponible" : "Aucun email connu",
    },
    paris_petite_couronne: {
      pass: Boolean(club.department && PARIS_PETITE_COURONNE.has(club.department)),
      reason: club.department ? `Département ${club.department}` : "Département inconnu",
    },
    high_attendance: {
      pass: attendanceSignal,
      reason: attendanceSignal
        ? `Signal de forte fréquentation (${club.reviews_count} avis, ${club.rating}★)`
        : "Pas de signal de forte fréquentation disponible",
    },
    amenities: {
      pass: Boolean(club.amenities?.vestiaires && club.amenities?.douches),
      reason: club.amenities?.vestiaires && club.amenities?.douches ? "Vestiaires et douches renseignés" : "Équipements non confirmés",
    },
    premium_tier: { pass: club.tier === "premium", reason: club.tier === "premium" ? "Club premium" : "Club standard" },
    recent_opening: {
      pass: isRecentOpening(club.opened_estimated_at),
      reason: isRecentOpening(club.opened_estimated_at) ? "Ouverture récente (< 2 ans)" : "Ouverture non récente ou inconnue",
    },
    extended_hours: {
      pass: hasExtendedHours(club.opening_hours),
      reason: hasExtendedHours(club.opening_hours) ? "Amplitude horaire élevée (≥15h/jour détecté)" : "Amplitude horaire non confirmée",
    },
  });
}

export function computeContactabilityScore(
  weights: ScoringWeight[],
  input: ClubScoringInput
): { total: number; breakdown: ScoreBreakdownItem[] } {
  const { club, brand, decisionMaker, hasContactFormSource } = input;
  const functionRelevant = Boolean(decisionMaker && RELEVANT_FUNCTIONS.has(decisionMaker.function_category));

  return computeScore(weights, {
    decision_maker_identified: {
      pass: Boolean(decisionMaker),
      reason: decisionMaker ? "Décideur identifié" : "Aucun décideur identifié",
    },
    function_relevant: {
      pass: functionRelevant,
      reason: functionRelevant ? "Fonction pertinente pour la décision" : "Fonction non confirmée ou non pertinente",
    },
    email_available: {
      pass: Boolean(decisionMaker?.email || club.email),
      reason: decisionMaker?.email || club.email ? "Email disponible" : "Aucun email",
    },
    phone_available: {
      pass: Boolean(decisionMaker?.phone || club.phone),
      reason: decisionMaker?.phone || club.phone ? "Téléphone disponible" : "Aucun téléphone",
    },
    linkedin_available: {
      pass: Boolean(decisionMaker?.linkedin_url || club.linkedin_url),
      reason: decisionMaker?.linkedin_url || club.linkedin_url ? "Profil LinkedIn disponible" : "Aucun LinkedIn",
    },
    website_available: {
      pass: Boolean(club.website || brand?.website),
      reason: club.website || brand?.website ? "Site web disponible" : "Aucun site web",
    },
    contact_form_available: {
      pass: hasContactFormSource,
      reason: hasContactFormSource ? "Formulaire/contact identifié" : "Aucun formulaire identifié",
    },
    hq_contact_available: {
      pass: Boolean(brand?.public_email || brand?.public_phone),
      reason: brand?.public_email || brand?.public_phone ? "Contact siège enseigne disponible" : "Aucun contact siège",
    },
  });
}
