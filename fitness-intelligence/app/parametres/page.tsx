import { PageHeader } from "@/components/ui/PageHeader";
import { listScoringWeights } from "@/lib/data/scoring";
import { WeightsEditor } from "./WeightsEditor";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const weights = await listScoringWeights();
  const pulvisWeights = weights.filter((w) => w.score_type === "pulvis_opportunity");
  const contactWeights = weights.filter((w) => w.score_type === "contactability");

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Pondérations des scores — modifiables ici, appliquées au prochain recalcul (Scraping → Recalculer scores)."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <WeightsEditor weights={pulvisWeights} scoreType="pulvis_opportunity" />
        </div>
        <div className="card p-5">
          <WeightsEditor weights={contactWeights} scoreType="contactability" />
        </div>
      </div>
    </div>
  );
}
