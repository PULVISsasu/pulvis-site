import { NextRequest, NextResponse } from "next/server";
import { listClubs } from "@/lib/data/clubs";

function toCsvValue(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS: { key: string; label: string }[] = [
  { key: "name", label: "Club" },
  { key: "brand_name", label: "Enseigne" },
  { key: "city", label: "Ville" },
  { key: "department", label: "Département" },
  { key: "address", label: "Adresse" },
  { key: "legal_entity_name", label: "Société" },
  { key: "siret", label: "SIRET" },
  { key: "business_model", label: "Franchise/Succursale" },
  { key: "status", label: "Statut" },
  { key: "confidence_level", label: "Confiance" },
  { key: "pulvis_score", label: "Score PULVIS" },
  { key: "contactability_score", label: "Score contact" },
  { key: "crm_stage", label: "Pipeline" },
];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const clubs = await listClubs({
    search: params.get("search") ?? undefined,
    department: params.get("department") ?? undefined,
    status: params.get("status") ?? undefined,
  });

  const header = COLUMNS.map((c) => toCsvValue(c.label)).join(",");
  const rows = clubs.map((c) => COLUMNS.map((col) => toCsvValue((c as any)[col.key])).join(","));
  const csv = ["﻿" + header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pulvis-fitness-clubs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
