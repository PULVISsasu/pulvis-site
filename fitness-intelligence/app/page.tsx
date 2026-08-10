import { PageHeader } from "@/components/ui/PageHeader";
import { StatGrid, StatTile } from "@/components/ui/StatTile";
import { ScorePill } from "@/components/ui/Badges";
import { getDashboardKpis, getTopOpportunities } from "@/lib/data/dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [kpis, opportunities] = await Promise.all([getDashboardKpis(), getTopOpportunities(10)]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de la base de prospection fitness Île-de-France."
      />

      <StatGrid>
        <StatTile label="Salles détectées" value={kpis.clubs_detectes} />
        <StatTile label="Salles enrichies" value={kpis.clubs_enrichis} />
        <StatTile label="Salles IDF" value={kpis.clubs_idf} />
        <StatTile label="Avec société identifiée" value={kpis.clubs_avec_societe} />
        <StatTile label="Groupes de franchisés" value={kpis.groupes_franchises} />
        <StatTile label="Dirigeants identifiés" value={kpis.dirigeants_identifies} />
        <StatTile label="Emails trouvés" value={kpis.emails_trouves} />
        <StatTile label="Téléphones trouvés" value={kpis.telephones_trouves} />
        <StatTile label="Contacts LinkedIn" value={kpis.contacts_linkedin} />
        <StatTile label="Prospects prioritaires" value={kpis.prospects_prioritaires} hint="Score PULVIS ≥ 80" />
        <StatTile label="Prospects contactés" value={kpis.prospects_contactes} />
        <StatTile label="Rendez-vous" value={kpis.rendez_vous} />
        <StatTile label="Accords" value={kpis.accords} />
      </StatGrid>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Top Opportunities</h2>
          <Link href="/prospection" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Voir la prospection →
          </Link>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          Les meilleurs prospects — un seul accord avec un multi-franchisé peut ouvrir plusieurs installations.
        </p>
        <div className="card overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th>#</th>
                <th>Club</th>
                <th>Enseigne</th>
                <th>Ville</th>
                <th>Décideur</th>
                <th>Clubs contrôlés</th>
                <th>Score PULVIS</th>
                <th>Contactabilité</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                    Aucun score calculé pour le moment — lancez le pipeline depuis la page Scraping.
                  </td>
                </tr>
              ) : (
                opportunities.map((o, i) => (
                  <tr key={o.club_id}>
                    <td className="text-slate-400">{i + 1}</td>
                    <td>
                      <Link href={`/clubs/${o.club_id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {o.club_name}
                      </Link>
                    </td>
                    <td>{o.brand_name ?? "—"}</td>
                    <td>{o.city ?? "—"}</td>
                    <td>{o.decision_maker ?? <span className="text-slate-400">Non identifié</span>}</td>
                    <td>{o.clubs_controlled ?? "—"}</td>
                    <td>
                      <ScorePill value={o.pulvis_score} />
                    </td>
                    <td>
                      <ScorePill value={o.contactability_score} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
