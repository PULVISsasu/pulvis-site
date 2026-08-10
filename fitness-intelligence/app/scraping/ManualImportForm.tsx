"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ManualImportForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ clubName: "", brandName: "", url: "", siret: "", city: "" });

  function submitManual() {
    startTransition(async () => {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setMessage(res.ok ? "Import réussi." : `Erreur : ${json.error}`);
      router.refresh();
    });
  }

  function submitCsv() {
    const file = fileInput.current?.files?.[0];
    if (!file) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const json = await res.json();
      setMessage(res.ok ? `Import CSV réussi : ${JSON.stringify(json.counters)}` : `Erreur : ${json.error}`);
      router.refresh();
    });
  }

  return (
    <div className="card p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Import manuel</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <input placeholder="Nom du club" value={form.clubName} onChange={(e) => setForm({ ...form, clubName: e.target.value })} className="input" />
        <input placeholder="Enseigne" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} className="input" />
        <input placeholder="URL page club" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input" />
        <input placeholder="SIRET" value={form.siret} onChange={(e) => setForm({ ...form, siret: e.target.value })} className="input" />
        <input placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
        <button onClick={submitManual} disabled={pending} className="btn-primary">
          Importer
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <input ref={fileInput} type="file" accept=".csv" className="text-sm" />
        <button onClick={submitCsv} disabled={pending} className="btn-secondary">
          Importer le CSV
        </button>
      </div>

      {message && <p className="mt-3 text-xs text-slate-500">{message}</p>}
    </div>
  );
}
