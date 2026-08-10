import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { runScrapeJob } from "./jobLog";
import { departmentFromPostalCode } from "./store";

function titleCaseIfShouting(name: string): string {
  const letters = name.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  const upperRatio = letters.length ? (letters.replace(/[^A-ZÀ-Þ]/g, "").length / letters.length) : 0;
  if (upperRatio < 0.8) return name; // déjà correctement casé
  return name
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return "+33" + digits.slice(1);
  }
  return digits;
}

/**
 * NORMALIZE — nettoyage post-DISCOVER : casse des noms, format téléphone,
 * dérivation du département depuis le code postal quand manquant. Ne fait
 * aucun appel réseau (contrairement à discover/match/enrich), donc job
 * rapide et rejouable à tout moment.
 */
export async function runNormalize(limit = 200) {
  return runScrapeJob("normalize", "internal", { limit }, async () => {
    const supabase = getFitnessIntelClient();
    const { data: clubs } = await supabase
      .from("clubs")
      .select("id, name, phone, postal_code, department")
      .or("department.is.null,phone.not.is.null")
      .limit(limit);

    let itemsUpdated = 0;
    for (const club of clubs ?? []) {
      const updates: Record<string, unknown> = {};

      const normalizedName = titleCaseIfShouting(club.name);
      if (normalizedName !== club.name) updates.name = normalizedName;

      if (!club.department && club.postal_code) {
        const dept = departmentFromPostalCode(club.postal_code);
        if (dept) updates.department = dept;
      }

      if (club.phone) {
        const normalizedPhone = normalizePhone(club.phone);
        if (normalizedPhone !== club.phone) updates.phone = normalizedPhone;
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from("clubs").update(updates).eq("id", club.id);
        itemsUpdated++;
      }
    }

    return { counters: { itemsFound: clubs?.length ?? 0, itemsUpdated, itemsNew: 0, duplicatesFound: 0 } };
  });
}
