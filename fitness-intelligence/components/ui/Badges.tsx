import clsx from "clsx";
import type { ConfidenceLevel } from "@/lib/types/database";

const CONFIDENCE_STYLES: Record<ConfidenceLevel, string> = {
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  probable: "bg-blue-50 text-blue-700 ring-blue-600/20",
  estimated: "bg-amber-50 text-amber-700 ring-amber-600/20",
  unknown: "bg-slate-100 text-slate-500 ring-slate-500/20",
};

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  verified: "Vérifié",
  probable: "Probable",
  estimated: "Estimé",
  unknown: "Inconnu",
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        CONFIDENCE_STYLES[level]
      )}
    >
      {CONFIDENCE_LABELS[level]}
    </span>
  );
}

export function ScorePill({ value, label }: { value: number; label?: string }) {
  const tone =
    value >= 80
      ? "bg-emerald-600 text-white"
      : value >= 60
        ? "bg-brand-600 text-white"
        : value >= 40
          ? "bg-amber-500 text-white"
          : "bg-slate-300 text-slate-700";
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tone)}>
      {value}
      {label ? <span className="font-normal opacity-90">{label}</span> : null}
    </span>
  );
}

export function BusinessModelBadge({ model }: { model: string }) {
  const labels: Record<string, string> = {
    succursale: "Succursale",
    franchise: "Franchise",
    mixte: "Mixte",
    unknown: "Inconnu",
  };
  const styles: Record<string, string> = {
    succursale: "bg-violet-50 text-violet-700 ring-violet-600/20",
    franchise: "bg-orange-50 text-orange-700 ring-orange-600/20",
    mixte: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
    unknown: "bg-slate-100 text-slate-500 ring-slate-500/20",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[model] ?? styles.unknown
      )}
    >
      {labels[model] ?? model}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-2 py-0.5 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20">
      Démo
    </span>
  );
}
