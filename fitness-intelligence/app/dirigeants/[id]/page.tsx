import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfidenceBadge } from "@/components/ui/Badges";
import { getPersonDetail } from "@/lib/data/people";

export const dynamic = "force-dynamic";

const TARGET_TYPE_LABEL: Record<string, string> = {
  brand: "Enseigne",
  group: "Groupe",
  legal_entity: "Société",
  club: "Club",
};

export default async function PersonDetailPage({ params }: { params: { id: string } }) {
  const detail = await getPersonDetail(params.id);
  if (!detail) notFound();
  const { person, roles, ownership } = detail;

  return (
    <div>
      <PageHeader title={person.full_name} description={person.current_function ?? undefined} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Qui contrôle quoi ?
            </h2>
            {roles.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun rôle enregistré.</p>
            ) : (
              <ul className="space-y-2">
                {roles.map((r: any) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <div>
                      <span className="text-xs font-medium uppercase text-slate-400">
                        {TARGET_TYPE_LABEL[r.target_type] ?? r.target_type}
                      </span>
                      <p className="text-sm font-medium text-slate-900">{r.target_name}</p>
                      <p className="text-xs text-slate-500">{r.function_title}</p>
                    </div>
                    <ConfidenceBadge level={r.confidence_level} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {ownership.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Graphe de contrôle (relations déduites)
              </h2>
              <ul className="space-y-2 text-sm">
                {ownership.map((o: any) => (
                  <li key={o.id} className="flex items-center justify-between">
                    <span>
                      {o.relation_type} → {o.to_type} <span className="font-mono text-xs text-slate-400">{o.to_id}</span>
                    </span>
                    <span className="text-xs text-slate-500">{o.confidence_score}% confiance</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Coordonnées</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Email</dt>
                <dd>{person.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Téléphone</dt>
                <dd>{person.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">LinkedIn</dt>
                <dd>
                  {person.linkedin_url ? (
                    <a href={person.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-600">
                      Profil ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Localisation</dt>
                <dd>{person.professional_location ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Confiance</dt>
                <dd>
                  <ConfidenceBadge level={person.confidence_level} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
