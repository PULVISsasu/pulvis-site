"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { MapClub } from "@/lib/data/map";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => <MapPlaceholder /> });

function MapPlaceholder() {
  return (
    <div className="flex h-[70vh] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-400">
      Chargement de la carte…
    </div>
  );
}

const DEPARTMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"];

export function MapView({ clubs }: { clubs: MapClub[] }) {
  const [department, setDepartment] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [minScore, setMinScore] = useState(0);

  const filtered = useMemo(() => {
    return clubs.filter((c) => {
      if (department && c.department !== department) return false;
      if (businessModel && c.business_model !== businessModel) return false;
      if (minScore && (c.pulvis_score ?? 0) < minScore) return false;
      return true;
    });
  }, [clubs, department, businessModel, minScore]);

  return (
    <div>
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input max-w-[10rem]">
          <option value="">Tous départements</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select value={businessModel} onChange={(e) => setBusinessModel(e.target.value)} className="input max-w-[12rem]">
          <option value="">Franchise/succursale : tous</option>
          <option value="franchise">Franchise</option>
          <option value="succursale">Succursale</option>
          <option value="mixte">Mixte</option>
          <option value="unknown">Inconnu</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Score PULVIS min.
          <input
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="input w-20"
          />
        </label>
        <span className="text-sm text-slate-400">{filtered.length} club(s) affiché(s)</span>
      </div>
      <LeafletMap clubs={filtered} />
    </div>
  );
}
