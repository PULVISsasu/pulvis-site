import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfidenceBadge, BusinessModelBadge, ScorePill } from "@/components/ui/Badges";
import { getClubDetail } from "@/lib/data/clubs";
import { CRM_STAGES } from "@/lib/types/database";
import { CrmStageForm } from "./CrmStageForm";

export const dynamic = "force-dynamic";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const detail = await getClubDetail(params.id);
  if (!detail) notFound();

  const { club, roles, legalEntityRoles, groups, score, crm, activities, sourceRecords, notes } = detail;
  const establishment = club.establishments;
  const legalEntity = establishment?.legal_entities;

  return (
    <div>
      <PageHeader
        title={club.name}
        description={[club.brands?.name, club.city].filter(Boolean).join(" · ")}
        actions={club.club_page_url ? (
          <a href={club.club_page_url} target="_blank" rel="noreferrer" className="btn-secondary">
            Voir la page club ↗
          </a>
        ) : undefined}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <ConfidenceBadge level={club.confidence_level} />
        {club.brands?.business_model && <BusinessModelBadge model={club.brands.business_model} />}
        {score && (
          <>
            <ScorePill value={score.pulvis_score} label="PULVIS" />
            <ScorePill value={score.contactability_score} label="Contact" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Vue générale">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Adresse" value={club.address} />
              <Field label="Ville" value={club.city} />
              <Field label="Département" value={club.department} />
              <Field label="Téléphone" value={club.phone} />
              <Field label="Email" value={club.email} />
              <Field label="Site web" value={club.website} />
              <Field label="Type" value={club.club_type} />
              <Field label="Tier" value={club.tier} />
              <Field label="Statut" value={club.status} />
              <Field label="Surface (m²)" value={club.surface_m2} />
              <Field label="Avis" value={club.reviews_count ? `${club.reviews_count} (${club.rating ?? "?"}★)` : null} />
              <Field label="Fréquentation estimée" value={club.estimated_attendance} />
            </dl>
          </Section>

          <Section title="Société exploitante">
            {legalEntity ? (
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="Raison sociale" value={legalEntity.raison_sociale} />
                <Field label="SIREN" value={legalEntity.siren} />
                <Field label="SIRET (établissement)" value={establishment.siret} />
                <Field label="Forme juridique" value={legalEntity.forme_juridique} />
                <Field label="Code NAF" value={legalEntity.code_naf} />
                <Field label="Statut" value={legalEntity.statut} />
                <Field label="Capital social" value={legalEntity.capital_social ? `${legalEntity.capital_social} €` : null} />
                <Field label="Effectif" value={legalEntity.effectif_tranche} />
                <Field label="Adresse siège" value={legalEntity.adresse_siege} />
                <Field label="CA connu" value={legalEntity.chiffre_affaires ? `${legalEntity.chiffre_affaires} € (${legalEntity.chiffre_affaires_annee})` : null} />
              </dl>
            ) : (
              <p className="text-sm text-slate-400">
                Aucune société rattachée — l'étape MATCH du pipeline n'a pas encore résolu de SIRET pour ce club.
              </p>
            )}
          </Section>

          <Section title="Dirigeants">
            {[...roles, ...legalEntityRoles].length === 0 ? (
              <p className="text-sm text-slate-400">Aucun décideur identifié pour le moment.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {[...roles, ...legalEntityRoles].map((r: any) => (
                  <li key={r.id} className="flex items-center justify-between py-2">
                    <div>
                      <Link href={`/dirigeants/${r.person_id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {r.people?.full_name}
                      </Link>
                      <p className="text-xs text-slate-500">{r.function_title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {r.people?.email && <span>{r.people.email}</span>}
                      {r.people?.linkedin_url && (
                        <a href={r.people.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-600">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Groupe / franchise">
            {groups.length === 0 ? (
              <p className="text-sm text-slate-400">Pas de groupe multi-clubs détecté pour ce club.</p>
            ) : (
              <ul className="space-y-2">
                {groups.map((g: any) => (
                  <li key={g.id}>
                    <Link href={`/groupes/${g.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      {g.name}
                    </Link>
                    <span className="ml-2 text-xs text-slate-500">
                      {g.club_count_estimated ?? "?"} club(s) estimé(s)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Sources">
            {sourceRecords.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune traçabilité enregistrée.</p>
            ) : (
              <table className="table-shell">
                <thead>
                  <tr>
                    <th>Champ</th>
                    <th>Valeur</th>
                    <th>Source</th>
                    <th>Confiance</th>
                    <th>Collecté le</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceRecords.map((sr: any) => (
                    <tr key={sr.id}>
                      <td>{sr.field_name}</td>
                      <td className="max-w-[16rem] truncate">{sr.field_value}</td>
                      <td>{sr.sources?.name ?? "—"}</td>
                      <td>
                        <ConfidenceBadge level={sr.confidence_level} />
                      </td>
                      <td className="text-xs text-slate-500">{new Date(sr.collected_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Historique">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune activité enregistrée.</p>
            ) : (
              <ul className="space-y-3">
                {activities.map((a: any) => (
                  <li key={a.id} className="text-sm">
                    <span className="text-xs text-slate-400">
                      {new Date(a.created_at).toLocaleString("fr-FR")}
                    </span>{" "}
                    — <span className="font-medium">{a.activity_type}</span> {a.body ? `: ${a.body}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Prospection">
            <CrmStageForm clubId={club.id} currentStage={crm?.stage ?? "a_analyser"} nextAction={crm?.next_action ?? ""} />
          </Section>

          <Section title="Notes">
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune note.</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((n: any) => (
                  <li key={n.id} className="text-sm text-slate-700">
                    {n.body}
                    <span className="ml-2 text-xs text-slate-400">{n.author}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {score && (
            <Section title="Détail des scores">
              <p className="mb-2 text-xs font-semibold text-slate-500">PULVIS Opportunity Score</p>
              <ul className="mb-4 space-y-1">
                {score.pulvis_breakdown.map((b: any, i: number) => (
                  <li key={i} className="flex justify-between text-xs">
                    <span className="text-slate-600">{b.label}</span>
                    <span className={b.points >= 0 ? "text-emerald-600" : "text-red-500"}>
                      {b.points >= 0 ? "+" : ""}
                      {b.points}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mb-2 text-xs font-semibold text-slate-500">Contactability Score</p>
              <ul className="space-y-1">
                {score.contactability_breakdown.map((b: any, i: number) => (
                  <li key={i} className="flex justify-between text-xs">
                    <span className="text-slate-600">{b.label}</span>
                    <span className={b.points >= 0 ? "text-emerald-600" : "text-red-500"}>
                      {b.points >= 0 ? "+" : ""}
                      {b.points}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
