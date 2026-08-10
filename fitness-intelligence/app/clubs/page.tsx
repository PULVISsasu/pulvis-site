import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfidenceBadge, BusinessModelBadge, DemoBadge, ScorePill } from "@/components/ui/Badges";
import { listClubs } from "@/lib/data/clubs";
import { IDF_DEPARTMENTS } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { search?: string; department?: string; status?: string };
}) {
  const clubs = await listClubs({
    search: searchParams.search,
    department: searchParams.department,
    status: searchParams.status,
  });

  const exportQs = new URLSearchParams(searchParams as Record<string, string>).toString();

  return (
    <div>
      <PageHeader
        title="Clubs"
        description={`${clubs.length} club(s) — recherche, filtres, export.`}
        actions={
          <a href={`/api/export/clubs?${exportQs}`} className="btn-secondary">
            Export CSV
          </a>
        }
      />

      <form className="card mb-4 flex flex-wrap items-center gap-3 p-3" method="GET">
        <input
          type="text"
          name="search"
          defaultValue={searchParams.search}
          placeholder="Rechercher un club…"
          className="input max-w-xs"
        />
        <select name="department" defaultValue={searchParams.department ?? ""} className="input max-w-[10rem]">
          <option value="">Tous départements</option>
          {IDF_DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={searchParams.status ?? ""} className="input max-w-[10rem]">
          <option value="">Tous statuts</option>
          <option value="open">Ouvert</option>
          <option value="closed">Fermé</option>
          <option value="unknown">Inconnu</option>
        </select>
        <button type="submit" className="btn-primary">
          Filtrer
        </button>
        {(searchParams.search || searchParams.department || searchParams.status) && (
          <Link href="/clubs" className="text-sm text-slate-500 hover:text-slate-700">
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="card overflow-x-auto">
        <table className="table-shell">
          <thead>
            <tr>
              <th>Club</th>
              <th>Enseigne</th>
              <th>Ville</th>
              <th>Dép.</th>
              <th>Société</th>
              <th>SIRET</th>
              <th>Franchise ?</th>
              <th>Statut</th>
              <th>Confiance</th>
              <th>Score PULVIS</th>
              <th>Contact.</th>
              <th>Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {clubs.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-sm text-slate-400">
                  Aucun club ne correspond à ces filtres.
                </td>
              </tr>
            ) : (
              clubs.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/clubs/${c.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      {c.name}
                    </Link>
                    {c.is_demo_data && <span className="ml-2"><DemoBadge /></span>}
                  </td>
                  <td>{c.brand_name ?? "—"}</td>
                  <td>{c.city ?? "—"}</td>
                  <td>{c.department ?? "—"}</td>
                  <td className="max-w-[14rem] truncate">{c.legal_entity_name ?? "—"}</td>
                  <td className="font-mono text-xs">{c.siret ?? "—"}</td>
                  <td>{c.business_model ? <BusinessModelBadge model={c.business_model} /> : "—"}</td>
                  <td>{c.status === "open" ? "Ouvert" : c.status === "closed" ? "Fermé" : "Inconnu"}</td>
                  <td>
                    <ConfidenceBadge level={c.confidence_level as any} />
                  </td>
                  <td>{c.pulvis_score !== null ? <ScorePill value={c.pulvis_score} /> : "—"}</td>
                  <td>{c.contactability_score !== null ? <ScorePill value={c.contactability_score} /> : "—"}</td>
                  <td className="text-xs text-slate-500">{c.crm_stage ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
