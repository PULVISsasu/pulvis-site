import { PageHeader } from "@/components/ui/PageHeader";
import { listMapClubs } from "@/lib/data/map";
import { MapView } from "./MapView";

export const dynamic = "force-dynamic";

export default async function CartePage() {
  const clubs = await listMapClubs();

  return (
    <div>
      <PageHeader
        title="Carte"
        description="Clubs géolocalisés en Île-de-France — couleur = Score PULVIS (vert ≥80, bleu ≥60, orange ≥40)."
      />
      {clubs.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-400">
          Aucun club géolocalisé pour le moment. La géolocalisation est renseignée à l'étape NORMALIZE du pipeline.
        </div>
      ) : (
        <MapView clubs={clubs} />
      )}
    </div>
  );
}
