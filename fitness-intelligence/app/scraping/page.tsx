import { PageHeader } from "@/components/ui/PageHeader";
import { listScrapeJobs, listEnrichmentJobs, listPendingMergeCandidates } from "@/lib/data/jobs";
import { PipelineControls } from "./PipelineControls";
import { ManualImportForm } from "./ManualImportForm";
import { MergeCandidatesReview } from "./MergeCandidatesReview";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700",
  running: "bg-blue-50 text-blue-700",
  pending: "bg-slate-100 text-slate-500",
  partial: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
};

function JobsTable({ jobs, kind }: { jobs: any[]; kind: "scrape" | "enrichment" }) {
  return (
    <table className="table-shell">
      <thead>
        <tr>
          <th>Étape</th>
          <th>{kind === "scrape" ? "Connecteur" : "Cible"}</th>
          <th>Statut</th>
          <th>Résultats</th>
          <th>Lancé</th>
        </tr>
      </thead>
      <tbody>
        {jobs.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
              Aucun job pour le moment.
            </td>
          </tr>
        ) : (
          jobs.map((j) => (
            <tr key={j.id}>
              <td className="font-medium text-slate-900">{j.job_type}</td>
              <td className="text-xs text-slate-500">{kind === "scrape" ? j.connector : j.target_type ?? "—"}</td>
              <td>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[j.status] ?? ""}`}>
                  {j.status}
                </span>
              </td>
              <td className="text-xs text-slate-500">
                {kind === "scrape"
                  ? `${j.items_new ?? 0} nouveaux / ${j.items_updated ?? 0} maj / ${j.duplicates_found ?? 0} doublons`
                  : `${j.items_processed ?? 0} traités / ${j.items_changed ?? 0} modifiés`}
                {j.error_message && <p className="mt-0.5 max-w-xs truncate text-red-500">{j.error_message}</p>}
              </td>
              <td className="text-xs text-slate-500">{new Date(j.created_at).toLocaleString("fr-FR")}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default async function ScrapingPage() {
  const [scrapeJobs, enrichmentJobs, mergeCandidates] = await Promise.all([
    listScrapeJobs(),
    listEnrichmentJobs(),
    listPendingMergeCandidates(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scraping"
        description="Pipeline DISCOVER → NORMALIZE → MATCH → ENRICH → RESOLVE ENTITIES → DETECT OWNERSHIP → SCORE."
      />

      <PipelineControls />
      <ManualImportForm />

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Suggestions de fusion ({mergeCandidates.length})
        </h2>
        <MergeCandidatesReview candidates={mergeCandidates as any} />
      </div>

      <div className="card overflow-x-auto p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Jobs de collecte (DISCOVER / NORMALIZE / MATCH)
        </h2>
        <JobsTable jobs={scrapeJobs} kind="scrape" />
      </div>

      <div className="card overflow-x-auto p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Jobs d'enrichissement (ENRICH / RESOLVE / DETECT OWNERSHIP / SCORE)
        </h2>
        <JobsTable jobs={enrichmentJobs} kind="enrichment" />
      </div>
    </div>
  );
}
