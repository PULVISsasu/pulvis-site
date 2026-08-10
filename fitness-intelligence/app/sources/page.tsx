import { PageHeader } from "@/components/ui/PageHeader";
import { listSources, listStaleRecords } from "@/lib/data/sources";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  official_api: "API officielle",
  open_data: "Open data",
  brand_website: "Site enseigne",
  manual_import: "Import manuel",
  web_search: "Recherche web",
  other: "Autre",
};

export default async function SourcesPage() {
  const [sources, stale] = await Promise.all([listSources(), listStaleRecords()]);

  return (
    <div>
      <PageHeader
        title="Sources"
        description="Registre des sources exploitées et de leurs contraintes d'usage — voir docs/fitness-intelligence-architecture.md."
      />

      <div className="card mb-6 overflow-x-auto">
        <table className="table-shell">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Authentification</th>
              <th>Rate limit</th>
              <th>Statut</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s: any) => (
              <tr key={s.id}>
                <td className="font-medium text-slate-900">
                  {s.base_url ? (
                    <a href={s.base_url} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                      {s.name} ↗
                    </a>
                  ) : (
                    s.name
                  )}
                </td>
                <td>{KIND_LABEL[s.kind] ?? s.kind}</td>
                <td>{s.requires_auth ? "Oui" : "Non"}</td>
                <td>{s.rate_limit_per_min ? `${s.rate_limit_per_min}/min` : "—"}</td>
                <td>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="max-w-xs text-xs text-slate-500">{s.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Données jamais vérifiées ({stale.length})
        </h2>
        <p className="mb-3 text-xs text-slate-400">
          Champs collectés automatiquement mais jamais confirmés par une seconde source ou une revue manuelle.
        </p>
        {stale.length === 0 ? (
          <p className="text-sm text-slate-400">Rien à signaler.</p>
        ) : (
          <table className="table-shell">
            <thead>
              <tr>
                <th>Cible</th>
                <th>Champ</th>
                <th>Source</th>
                <th>Collecté le</th>
              </tr>
            </thead>
            <tbody>
              {stale.map((r) => (
                <tr key={r.id}>
                  <td>{r.target_type}</td>
                  <td>{r.field_name}</td>
                  <td>{r.source_name ?? "—"}</td>
                  <td className="text-xs text-slate-500">{new Date(r.collected_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
