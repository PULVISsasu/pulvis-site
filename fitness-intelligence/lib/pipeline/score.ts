import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { runEnrichmentJob } from "./jobLog";
import { computePulvisOpportunityScore, computeContactabilityScore, type ClubScoringInput } from "@/lib/scoring/compute";

export async function runScore() {
  return runEnrichmentJob("score", {}, {}, async () => {
    const supabase = getFitnessIntelClient();

    const [{ data: weights }, { data: clubs }] = await Promise.all([
      supabase.from("scoring_weights").select("*"),
      supabase.from("clubs").select("*, brands(website, public_email, public_phone)"),
    ]);

    if (!weights || weights.length === 0) throw new Error("Aucune pondération configurée (fitness_intel.scoring_weights vide)");

    const pulvisWeights = weights.filter((w) => w.score_type === "pulvis_opportunity");
    const contactWeights = weights.filter((w) => w.score_type === "contactability");

    const { data: groupMembers } = await supabase.from("group_members").select("club_id, groups(club_count_estimated)");
    const groupCountByClub = new Map<string, number>();
    for (const gm of groupMembers ?? []) {
      const count = (gm as any).groups?.club_count_estimated;
      if (count) groupCountByClub.set(gm.club_id, Math.max(groupCountByClub.get(gm.club_id) ?? 0, count));
    }

    const { data: clubRoles } = await supabase.from("roles").select("target_id, person_id, function_category, people(email, phone, linkedin_url)").eq("target_type", "club").eq("is_current", true);
    const decisionMakerByClub = new Map<string, any>();
    for (const r of clubRoles ?? []) {
      if (!decisionMakerByClub.has(r.target_id)) decisionMakerByClub.set(r.target_id, r);
    }

    const { data: contactForms } = await supabase.from("contacts").select("target_id").eq("target_type", "club").eq("contact_type", "form");
    const clubsWithForm = new Set((contactForms ?? []).map((c) => c.target_id));

    let itemsProcessed = 0;
    let itemsChanged = 0;
    const computedAt = new Date().toISOString();

    for (const club of clubs ?? []) {
      itemsProcessed++;
      const decisionRole = decisionMakerByClub.get(club.id);
      const decisionMaker = decisionRole
        ? {
            email: decisionRole.people?.email ?? null,
            phone: decisionRole.people?.phone ?? null,
            linkedin_url: decisionRole.people?.linkedin_url ?? null,
            function_category: decisionRole.function_category,
          }
        : null;

      const input: ClubScoringInput = {
        club: {
          id: club.id,
          department: club.department,
          tier: club.tier,
          amenities: club.amenities,
          opening_hours: club.opening_hours,
          opened_estimated_at: club.opened_estimated_at,
          reviews_count: club.reviews_count,
          rating: club.rating,
          email: club.email,
          phone: club.phone,
          website: club.website,
          club_page_url: club.club_page_url,
          linkedin_url: club.linkedin_url,
        },
        brand: club.brands ?? null,
        groupClubCount: groupCountByClub.get(club.id) ?? null,
        decisionMaker,
        hasContactFormSource: clubsWithForm.has(club.id),
      };

      const pulvis = computePulvisOpportunityScore(pulvisWeights, input);
      const contact = computeContactabilityScore(contactWeights, input);

      const { error } = await supabase.from("opportunity_scores").upsert(
        {
          club_id: club.id,
          pulvis_score: pulvis.total,
          pulvis_breakdown: pulvis.breakdown,
          contactability_score: contact.total,
          contactability_breakdown: contact.breakdown,
          weights_version: computedAt,
          computed_at: computedAt,
        },
        { onConflict: "club_id" }
      );
      if (!error) itemsChanged++;
    }

    return { counters: { itemsProcessed, itemsChanged } };
  });
}
