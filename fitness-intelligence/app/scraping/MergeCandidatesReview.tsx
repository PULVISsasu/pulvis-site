"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Candidate {
  id: string;
  club_a_name: string;
  club_b_name: string;
  similarity_score: number;
  confidence_tier: string;
}

export function MergeCandidatesReview({ candidates }: { candidates: Candidate[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function review(id: string, action: "confirm" | "reject") {
    startTransition(async () => {
      await fetch(`/api/merge-candidates/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    });
  }

  if (candidates.length === 0) {
    return <p className="text-sm text-slate-400">Aucune suggestion de fusion en attente.</p>;
  }

  return (
    <ul className="space-y-2">
      {candidates.map((c) => (
        <li key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
          <div className="text-sm">
            <span className="font-medium text-slate-900">{c.club_a_name}</span>
            <span className="mx-2 text-slate-400">≟</span>
            <span className="font-medium text-slate-900">{c.club_b_name}</span>
            <span className="ml-2 text-xs text-slate-400">
              {c.similarity_score}% similaire · confiance {c.confidence_tier}
            </span>
          </div>
          <div className="flex gap-2">
            <button disabled={pending} onClick={() => review(c.id, "confirm")} className="btn-secondary py-1 text-xs">
              Fusionner
            </button>
            <button disabled={pending} onClick={() => review(c.id, "reject")} className="btn-secondary py-1 text-xs">
              Ignorer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
