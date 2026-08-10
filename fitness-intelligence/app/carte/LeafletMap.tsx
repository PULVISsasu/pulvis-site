"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { MapClub } from "@/lib/data/map";

const IDF_CENTER: [number, number] = [48.8566, 2.3522];

function colorForScore(score: number | null): string {
  if (score === null) return "#94a3b8";
  if (score >= 80) return "#059669";
  if (score >= 60) return "#4a66f5";
  if (score >= 40) return "#f59e0b";
  return "#94a3b8";
}

export default function LeafletMap({ clubs }: { clubs: MapClub[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={IDF_CENTER} zoom={10} style={{ height: "70vh", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clubs.map((c) => (
          <CircleMarker
            key={c.id}
            center={[c.latitude, c.longitude]}
            radius={7}
            pathOptions={{ color: colorForScore(c.pulvis_score), fillColor: colorForScore(c.pulvis_score), fillOpacity: 0.8 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{c.name}</p>
                <p className="text-slate-500">{[c.brand_name, c.city].filter(Boolean).join(" · ")}</p>
                {c.pulvis_score !== null && <p className="mt-1">Score PULVIS : {c.pulvis_score}</p>}
                <Link href={`/clubs/${c.id}`} className="mt-1 inline-block text-brand-600">
                  Voir la fiche →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
