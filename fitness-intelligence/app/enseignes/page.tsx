import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { BusinessModelBadge, ScorePill } from "@/components/ui/Badges";
import { listBrands } from "@/lib/data/brands";

export const dynamic = "force-dynamic";

export default async function EnseignesPage() {
  const brands = await listBrands();

  return (
    <div>
      <PageHeader title="Enseignes" description="Fitness Park, Basic-Fit, Keepcool, GIGAFIT, On Air, L'Orange Bleue, Neoness…" />
      <div className="card overflow-x-auto">
        <table className="table-shell">
          <thead>
            <tr>
              <th>Enseigne</th>
              <th>Clubs IDF</th>
              <th>Modèle</th>
              <th>Groupes identifiés</th>
              <th>Décideurs</th>
              <th>Score moyen</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  Aucune enseigne enregistrée — importez-en une depuis Scraping → Import manuel.
                </td>
              </tr>
            ) : (
              brands.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/enseignes/${b.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      {b.name}
                    </Link>
                  </td>
                  <td>{b.clubs_idf}</td>
                  <td>
                    <BusinessModelBadge model={b.business_model} />
                  </td>
                  <td>{b.groups_identified}</td>
                  <td>{b.decision_makers}</td>
                  <td>{b.avg_pulvis_score !== null ? <ScorePill value={b.avg_pulvis_score} /> : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
