"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CRM_STAGES, type CrmStage } from "@/lib/types/database";

export function CrmStageForm({
  clubId,
  currentStage,
  nextAction,
}: {
  clubId: string;
  currentStage: CrmStage;
  nextAction: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<CrmStage>(currentStage);
  const [action, setAction] = useState(nextAction);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await fetch(`/api/crm/${clubId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, next_action: action }),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-slate-400">Étape</label>
        <select value={stage} onChange={(e) => setStage(e.target.value as CrmStage)} className="input">
          {CRM_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Prochaine action</label>
        <input value={action} onChange={(e) => setAction(e.target.value)} className="input" placeholder="Ex. relancer par email" />
      </div>
      <button onClick={save} disabled={pending} className="btn-primary w-full">
        {pending ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </div>
  );
}
