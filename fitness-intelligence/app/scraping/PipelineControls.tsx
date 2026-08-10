"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const STAGES: { stage: string; label: string; needsBrand?: boolean }[] = [
  { stage: "discover", label: "Lancer découverte", needsBrand: true },
  { stage: "normalize", label: "Normaliser les données" },
  { stage: "match", label: "Enrichir données juridiques (SIRET/dirigeants)" },
  { stage: "enrich", label: "Vérifier procédures collectives (BODACC)" },
  { stage: "resolve_entities", label: "Détecter les doublons" },
  { stage: "detect_ownership", label: "Recalculer franchises / multi-franchisés" },
  { stage: "score", label: "Recalculer les scores" },
];

export function PipelineControls() {
  const router = useRouter();
  const [brandName, setBrandName] = useState("Fitness Park");
  const [department, setDepartment] = useState("");
  const [pending, startTransition] = useTransition();
  const [runningStage, setRunningStage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  function run(stage: string, needsBrand?: boolean) {
    setRunningStage(stage);
    setLastResult(null);
    startTransition(async () => {
      const body = needsBrand ? { brandName, department: department || undefined } : {};
      const res = await fetch(`/api/pipeline/${stage}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setLastResult(res.ok ? `${stage}: ${JSON.stringify(json.counters)}` : `${stage}: erreur — ${json.error}`);
      setRunningStage(null);
      router.refresh();
    });
  }

  return (
    <div className="card p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Pipeline</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enseigne (ex. Fitness Park)"
          className="input max-w-xs"
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input max-w-[10rem]">
          <option value="">Toute l'IDF</option>
          {["75", "77", "78", "91", "92", "93", "94", "95"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {STAGES.map((s) => (
          <button
            key={s.stage}
            onClick={() => run(s.stage, s.needsBrand)}
            disabled={pending}
            className="btn-secondary"
          >
            {runningStage === s.stage && pending ? "En cours…" : s.label}
          </button>
        ))}
      </div>

      {lastResult && <p className="mt-3 text-xs text-slate-500">{lastResult}</p>}
    </div>
  );
}
