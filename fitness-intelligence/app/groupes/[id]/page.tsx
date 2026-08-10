import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfidenceBadge } from "@/components/ui/Badges";
import { getGroupDetail } from "@/lib/data/groups";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const detail = await getGroupDetail(params.id);
  if (!detail) notFound();
  const { group, members, roles } = detail;

  return (
    <div>
      <PageHeader title={group.name} description={group.raison_sociale ?? undefined} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Clubs contrôlés ({members.length})
            </h2>
            <ul className="divide-y divide-slate-100">
              {members.map((m: any) => (
                <li key={m.id} className="flex items-center justify-between py-2">
                  <Link href={`/clubs/${m.club_id}`} className="text-slate-900 hover:text-brand-600">
                    {m.clubs?.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{m.clubs?.city}</span>
                    <ConfidenceBadge level={m.confidence_level} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Dirigeants du groupe</h2>
            {roles.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun dirigeant identifié.</p>
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
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Coordonnées</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">SIREN</dt>
                <dd>{group.siren ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Email</dt>
                <dd>{group.public_email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Téléphone</dt>
                <dd>{group.public_phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">LinkedIn</dt>
                <dd>{group.linkedin_url ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Zone</dt>
                <dd>{group.geographic_zone ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
