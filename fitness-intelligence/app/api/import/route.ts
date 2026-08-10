import { NextRequest, NextResponse } from "next/server";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { parseManualInput, parseCsvClubs, type ManualImportInput } from "@/lib/connectors/manual-import";
import { upsertClubCandidate } from "@/lib/pipeline/store";
import { runScrapeJob } from "@/lib/pipeline/jobLog";

async function resolveBrandId(brandName?: string): Promise<string | null> {
  if (!brandName) return null;
  const supabase = getFitnessIntelClient();
  const slug = brandName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { data: existing } = await supabase.from("brands").select("id").eq("slug", slug).maybeSingle();
  if (existing) return existing.id;
  const { data: inserted } = await supabase
    .from("brands")
    .insert({ name: brandName, slug, business_model: "unknown", confidence_level: "unknown" })
    .select("id")
    .single();
  return inserted?.id ?? null;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Fichier CSV manquant" }, { status: 400 });

      const content = await file.text();
      const result = await runScrapeJob("discover", "manual-import", { file: file.name }, async () => {
        const candidates = parseCsvClubs(content);
        let itemsNew = 0;
        let itemsUpdated = 0;
        for (const candidate of candidates) {
          const brandId = await resolveBrandId(candidate.brandSlug);
          const { isNew } = await upsertClubCandidate(candidate, brandId);
          if (isNew) itemsNew++;
          else itemsUpdated++;
        }
        return { counters: { itemsFound: candidates.length, itemsNew, itemsUpdated, duplicatesFound: itemsUpdated } };
      });
      return NextResponse.json(result);
    }

    const body = (await request.json()) as ManualImportInput;
    const result = await runScrapeJob("discover", "manual-import", body as any, async () => {
      const brandId = await resolveBrandId(body.brandName);
      const candidate = parseManualInput(body);
      const { isNew } = await upsertClubCandidate(candidate, brandId);
      return { counters: { itemsFound: 1, itemsNew: isNew ? 1 : 0, itemsUpdated: isNew ? 0 : 1, duplicatesFound: 0 } };
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
