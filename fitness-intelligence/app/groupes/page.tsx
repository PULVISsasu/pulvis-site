import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { listGroups } from "@/lib/data/groups";

export const dynamic = "force-dynamic";

export default async function GroupesPage() {
  const groups = await listGroups();

  return (
    <div>
      <PageHeader
        title="Groupes / multi-franchisés"
        description="Un accord avec un multi-franchisé peut ouvrir plusieurs installations d'un coup — page prioritaire."
      />
      <div className="card overflow-x-auto">
        <table className="table-shell">
          <thead>
            <tr>
              <th>Groupe</th>
              <th>Dirigeant</th>
              <th>Enseigne(s)</th>
              <th>Clubs</th>
              <th>Email</th>
              <th>Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  Aucun groupe détecté — la détection franchise/multi-franchisé se fait à l'étape RESOLVE/DETECT_OWNERSHIP du pipeline.
                </td>
              </tr>
            ) : (
              groups.map((g) => (
                <tr key={g.id}>
                  <td>
                    <Link href={`/groupes/${g.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      {g.name}
                    </Link>
                  </td>
                  <td>{g.dirigeant ?? "—"}</td>
                  <td>{g.enseignes.join(", ") || "—"}</td>
                  <td className="font-semibold">{g.clubs_count}</td>
                  <td>{g.email ?? "—"}</td>
                  <td>{g.phone ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
