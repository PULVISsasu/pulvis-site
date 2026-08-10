import "server-only";
import { getFitnessIntelClient } from "@/lib/supabase/server";
import { oneOf } from "@/lib/utils";

export interface MapClub {
  id: string;
  name: string;
  brand_name: string | null;
  city: string | null;
  department: string | null;
  latitude: number;
  longitude: number;
  business_model: string | null;
  pulvis_score: number | null;
  status: string;
}

export async function listMapClubs(): Promise<MapClub[]> {
  const supabase = getFitnessIntelClient();
  const { data } = await supabase
    .from("clubs")
    .select("id, name, city, department, latitude, longitude, status, brands(name, business_model), opportunity_scores(pulvis_score)")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(2000);

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    brand_name: c.brands?.name ?? null,
    business_model: c.brands?.business_model ?? null,
    city: c.city,
    department: c.department,
    latitude: c.latitude,
    longitude: c.longitude,
    pulvis_score: oneOf<any>(c.opportunity_scores)?.pulvis_score ?? null,
    status: c.status,
  }));
}
