import { NextRequest, NextResponse } from "next/server";
import { runPipelineStage } from "@/lib/pipeline/orchestrator";

export async function POST(request: NextRequest, { params }: { params: { stage: string } }) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // corps vide accepté pour les étapes sans paramètres (normalize, match, score…)
  }

  try {
    const result = await runPipelineStage(params.stage, body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
