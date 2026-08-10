import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { BusinessModelBadge, ScorePill } from "@/components/ui/Badges";
import { getBrandDetail } from "@/lib/data/brands";
import { oneOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BrandDetailPage({ params }: { params: { id: string } }) {
  const detail = await getBrandDetail(params.id);
  if (!detail) notFound();
  const { brand, clubs, roles, groups } = detail;

  return (
    <div>
      <PageHeader
        title={brand.name}
        description={brand.website ?? undefined}
        actions={<BusinessModelBadge model={brand.business_model} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Clubs ({clubs.length})</h2>
            <table className="table-shell">
              <thead>
                <tr>
                  <th>Club</th>
                  <th>Ville</th>
                  <th>Statut</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((c: any) => {
                  const score = oneOf<any>(c.opportunity_scores);
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/clubs/${c.id}`} className="text-slate-900 hover:text-brand-600">
                          {c.name}
                        </Link>
                      </td>
                      <td>{c.city ?? "—"}</td>
                      <td>{c.status}</td>
                      <td>{score?.pulvis_score ? <ScorePill value={score.pulvis_score} /> : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Groupes de franchisés</h2>
            {groups.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun groupe multi-club détecté sur cette enseigne.</p>
            ) : (
              <ul className="space-y-1">
                {groups.map((g: any) => (
                  <li key={g.id}>
                    <Link href={`/groupes/${g.id}`} className="text-slate-900 hover:text-brand-600">
                      {g.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Direction</h2>
            {roles.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun contact corporate identifié.</p>
            ) : (
              <ul className="space-y-3">
                {roles.map((r: any) => (
                  <li key={r.id}>
                    <Link href={`/dirigeants/${r.person_id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      {r.people?.full_name}
                    </Link>
                    <p className="text-xs text-slate-500">{r.function_title}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Structure</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Site corporate</dt>
                <dd>{brand.corporate_site ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">LinkedIn</dt>
                <dd>{brand.linkedin_url ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Siège</dt>
                <dd>{[brand.hq_address, brand.hq_postal_code, brand.hq_city].filter(Boolean).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Maison mère</dt>
                <dd>{brand.legal_entities?.raison_sociale ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
