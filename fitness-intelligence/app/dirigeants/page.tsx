import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfidenceBadge } from "@/components/ui/Badges";
import { listPeople } from "@/lib/data/people";

export const dynamic = "force-dynamic";

export default async function DirigeantsPage() {
  const people = await listPeople();

  return (
    <div>
      <PageHeader
        title="Dirigeants"
        description="Décideurs identifiés — CEO, présidents, franchisés, directeurs réseau/développement/franchise/partenariats."
      />
      <div className="card overflow-x-auto">
        <table className="table-shell">
          <thead>
            <tr>
              <th>Personne</th>
              <th>Fonction</th>
              <th>Enseigne(s)</th>
              <th>Clubs contrôlés</th>
              <th>LinkedIn</th>
              <th>Email</th>
              <th>Confiance</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                  Aucun décideur identifié pour le moment.
                </td>
              </tr>
            ) : (
              people.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dirigeants/${p.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      {p.full_name}
                    </Link>
                  </td>
                  <td>{p.function}</td>
                  <td>{p.brands.join(", ") || "—"}</td>
                  <td className="font-semibold">{p.clubs_controlled || "—"}</td>
                  <td>
                    {p.linkedin_url ? (
                      <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-600">
                        Profil ↗
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{p.email ?? "—"}</td>
                  <td>
                    <ConfidenceBadge level={p.confidence_level as any} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
