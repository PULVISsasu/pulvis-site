import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScorePill } from "@/components/ui/Badges";
import { listProspectionBoard } from "@/lib/data/prospection";
import { CRM_STAGES } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function ProspectionPage() {
  const cards = await listProspectionBoard();
  const byStage = new Map(CRM_STAGES.map((s) => [s.value, cards.filter((c) => c.stage === s.value)]));

  return (
    <div>
      <PageHeader
        title="Prospection"
        description="Pipeline commercial — de l'analyse initiale à l'installation."
      />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {CRM_STAGES.map((stage) => {
          const stageCards = byStage.get(stage.value) ?? [];
          return (
            <div key={stage.value} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stage.label}</h3>
                <span className="text-xs text-slate-400">{stageCards.length}</span>
              </div>
              <div className="space-y-2">
                {stageCards.length === 0 ? (
                  <div className="card border-dashed p-4 text-center text-xs text-slate-300">Vide</div>
                ) : (
                  stageCards.map((c) => (
                    <Link key={c.club_id} href={`/clubs/${c.club_id}`} className="card block p-3 hover:border-brand-300">
                      <p className="text-sm font-medium text-slate-900">{c.club_name}</p>
                      <p className="text-xs text-slate-500">
                        {[c.brand_name, c.city].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        {c.pulvis_score !== null ? <ScorePill value={c.pulvis_score} /> : <span />}
                        {c.next_action_date && (
                          <span className="text-xs text-slate-400">
                            {new Date(c.next_action_date).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                      {c.next_action && <p className="mt-1 text-xs text-slate-500">{c.next_action}</p>}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
