"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ScoringWeight } from "@/lib/types/database";

export function WeightsEditor({ weights, scoreType }: { weights: ScoringWeight[]; scoreType: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(weights.map((w) => [w.id, w.weight]))
  );

  const total = Object.values(values).reduce((a, b) => a + b, 0);

  function save(id: string) {
    startTransition(async () => {
      await fetch("/api/scoring-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, weight: values[id] }),
      });
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          {scoreType === "pulvis_opportunity" ? "PULVIS Opportunity Score" : "Contactability Score"}
        </h3>
        <span className={`text-xs font-medium ${total === 100 ? "text-emerald-600" : "text-amber-600"}`}>
          Total : {total} / 100
        </span>
      </div>
      <ul className="space-y-2">
        {weights.map((w) => (
          <li key={w.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-800">{w.label}</p>
              {w.description && <p className="truncate text-xs text-slate-400">{w.description}</p>}
            </div>
            <input
              type="number"
              min={0}
              max={100}
              value={values[w.id]}
              onChange={(e) => setValues((v) => ({ ...v, [w.id]: Number(e.target.value) }))}
              onBlur={() => save(w.id)}
              className="input w-20 shrink-0 text-right"
              disabled={pending}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
