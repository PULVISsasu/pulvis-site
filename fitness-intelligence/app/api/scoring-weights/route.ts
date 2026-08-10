import { NextRequest, NextResponse } from "next/server";
import { getFitnessIntelClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, weight, is_active } = body as { id: string; weight?: number; is_active?: boolean };
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const supabase = getFitnessIntelClient();
  const update: Record<string, unknown> = {};
  if (typeof weight === "number") update.weight = weight;
  if (typeof is_active === "boolean") update.is_active = is_active;

  const { error } = await supabase.from("scoring_weights").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
