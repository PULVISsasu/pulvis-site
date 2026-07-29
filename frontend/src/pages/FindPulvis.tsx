import { useMemo, useState } from 'react'
import { Info, MapPin } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import SearchBar from '../components/SearchBar'
import FilterButtons from '../components/FilterButtons'
import LocationCard from '../components/LocationCard'
import EmptyState from '../components/EmptyState'
import PlaceholderImage from '../components/PlaceholderImage'
import ScrollReveal from '../components/ScrollReveal'
import { stations, type LocationType } from '../data/stations'

type TypeFilter = 'Tous' | LocationType

const types: TypeFilter[] = [
  'Tous',
  'Salle de sport',
  'Hôtel',
  'Bar',
  'Club',
  'Centre commercial',
  'Événement',
]

export default function FindPulvis() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('Tous')

  const filtered = useMemo(() => {
    return stations
      .filter((s) => typeFilter === 'Tous' || s.type === typeFilter)
      .filter((s) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return (
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [query, typeFilter])

  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Localisateur"
        title="Trouver PULVIS"
        description="Repérez la station la plus proche selon votre position, le type de lieu ou vos parfums préférés."
      />

      <div className="flex items-start gap-3 rounded-xl border border-pulvis-gold/30 bg-pulvis-gold/5 px-4 py-3.5 text-sm text-pulvis-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-pulvis-gold" />
        Les stations et distances affichées dans cette maquette sont fictives, à des fins de
        démonstration.
      </div>

      <div className="flex flex-col gap-6">
        <SearchBar value={query} onChange={setQuery} placeholder="Paris, Boulogne-Billancourt…" />
        <FilterButtons options={types} active={typeFilter} onChange={setTypeFilter} />
      </div>

      <ScrollReveal>
        <PlaceholderImage
          label="Carte des stations PULVIS (maquette)"
          icon={MapPin}
          className="aspect-[16/7] w-full rounded-2xl"
        />
      </ScrollReveal>

      {filtered.length === 0 ? (
        <EmptyState
          title="Aucune station ne correspond à votre recherche"
          description="Essayez un autre type de lieu ou une autre ville."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filtered.map((station, i) => (
            <ScrollReveal key={station.id} delay={(i % 2) * 0.08}>
              <LocationCard station={station} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
