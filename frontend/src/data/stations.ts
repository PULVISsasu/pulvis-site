export type LocationType =
  | 'Salle de sport'
  | 'Hôtel'
  | 'Bar'
  | 'Club'
  | 'Centre commercial'
  | 'Événement'

export interface Station {
  id: string
  name: string
  type: LocationType
  address: string
  city: string
  distanceKm: number
  hours: string
  perfumeSlugs: string[]
  status: 'Disponible' | 'Temporairement indisponible'
  stationNumber: string
}

export const stations: Station[] = [
  {
    id: 'paris-republique',
    name: 'Fit Club République',
    type: 'Salle de sport',
    address: '12 rue du Grand Prieuré, 75011 Paris',
    city: 'Paris',
    distanceKm: 0.4,
    hours: '6h00 – 23h00',
    perfumeSlugs: ['vital', 'aero', 'forge'],
    status: 'Disponible',
    stationNumber: 'PLV-014',
  },
  {
    id: 'paris-opera',
    name: 'Hôtel Lumière Opéra',
    type: 'Hôtel',
    address: '8 boulevard des Capucines, 75009 Paris',
    city: 'Paris',
    distanceKm: 1.2,
    hours: '24h/24',
    perfumeSlugs: ['nova', 'elixir', 'forge'],
    status: 'Disponible',
    stationNumber: 'PLV-027',
  },
  {
    id: 'boulogne-mall',
    name: 'Centre Commercial Le Pont',
    type: 'Centre commercial',
    address: '2 avenue Édouard Vaillant, 92100 Boulogne-Billancourt',
    city: 'Boulogne-Billancourt',
    distanceKm: 3.6,
    hours: '10h00 – 20h00',
    perfumeSlugs: ['vital', 'nova', 'aero', 'forge', 'elixir'],
    status: 'Disponible',
    stationNumber: 'PLV-041',
  },
  {
    id: 'paris-pigalle',
    name: 'Le Nocturne Bar',
    type: 'Bar',
    address: '19 rue Frochot, 75009 Paris',
    city: 'Paris',
    distanceKm: 2.1,
    hours: '18h00 – 2h00',
    perfumeSlugs: ['forge', 'elixir'],
    status: 'Temporairement indisponible',
    stationNumber: 'PLV-033',
  },
  {
    id: 'paris-bastille',
    name: 'Studio Move Bastille',
    type: 'Salle de sport',
    address: '5 rue de la Roquette, 75011 Paris',
    city: 'Paris',
    distanceKm: 1.8,
    hours: '7h00 – 22h00',
    perfumeSlugs: ['vital', 'aero'],
    status: 'Disponible',
    stationNumber: 'PLV-052',
  },
  {
    id: 'paris-marais',
    name: 'Club Marais',
    type: 'Club',
    address: '24 rue Vieille du Temple, 75004 Paris',
    city: 'Paris',
    distanceKm: 2.9,
    hours: '23h00 – 5h00',
    perfumeSlugs: ['nova', 'elixir'],
    status: 'Disponible',
    stationNumber: 'PLV-018',
  },
]

export function getStationById(id: string): Station | undefined {
  return stations.find((s) => s.id === id)
}
