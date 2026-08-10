import { NextRequest, NextResponse } from "next/server";
import { getFitnessIntelClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { clubId: string } }) {
  const body = await request.json();
  const supabase = getFitnessIntelClient();

  const { error } = await supabase
    .from("crm_status")
    .upsert(
      {
        club_id: params.clubId,
        stage: body.stage,
        next_action: body.next_action || null,
        owner: body.owner ?? undefined,
      },
      { onConflict: "club_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activities").insert({
    club_id: params.clubId,
    activity_type: "status_change",
    body: `Étape pipeline → ${body.stage}`,
    actor: "dashboard",
  });

  return NextResponse.json({ ok: true });
}
