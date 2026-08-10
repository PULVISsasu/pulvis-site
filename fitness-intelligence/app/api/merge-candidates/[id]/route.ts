import { NextRequest, NextResponse } from "next/server";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { mergeClubs } from "@/lib/pipeline/resolveEntities";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { action } = (await request.json()) as { action: "confirm" | "reject" };
  if (!["confirm", "reject"].includes(action)) return NextResponse.json({ error: "action invalide" }, { status: 400 });

  const supabase = getFitnessIntelClient();
  const { data: candidate } = await supabase.from("merge_candidates").select("*").eq("id", params.id).maybeSingle();
  if (!candidate) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  if (action === "confirm" && candidate.entity_type === "club") {
    // Conserve le club créé en premier (id trié par défaut à la génération —
    // à défaut d'un vrai created_at ici, on garde entity_id_a par convention
    // de la RPC find_club_duplicates qui ordonne a.id < b.id).
    await mergeClubs(candidate.entity_id_a, candidate.entity_id_b);
  }

  const { error } = await supabase
    .from("merge_candidates")
    .update({ status: action === "confirm" ? "confirmed" : "rejected", reviewed_at: new Date().toISOString(), reviewed_by: "dashboard" })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
