import { MapPin, Clock, Navigation } from 'lucide-react'
import { type Station } from '../data/stations'
import { perfumes } from '../data/perfumes'
import Badge from './Badge'
import Button from './Button'

interface LocationCardProps {
  station: Station
  compact?: boolean
}

export default function LocationCard({ station, compact = false }: LocationCardProps) {
  const availablePerfumes = perfumes.filter((p) => station.perfumeSlugs.includes(p.slug))
  const isAvailable = station.status === 'Disponible'

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6 transition-colors duration-300 hover:border-pulvis-gold/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest2 text-pulvis-muted">{station.type}</p>
          <h3 className="font-serif text-xl text-pulvis-cream sm:text-2xl">{station.name}</h3>
        </div>
        <Badge tone={isAvailable ? 'success' : 'warning'}>{station.status}</Badge>
      </div>

      <div className="flex flex-col gap-2 text-sm text-pulvis-muted">
        <span className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pulvis-gold" />
          {station.address} · {station.distanceKm} km
        </span>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-pulvis-gold" />
          {station.hours}
        </span>
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-2 pt-1">
          {availablePerfumes.map((p) => (
            <Badge key={p.slug} tone="muted">
              {p.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        <Button to={`/station/${station.id}`} variant="secondary" size="md">
          Voir la station
        </Button>
        <button
          type="button"
          className="link-underline flex items-center gap-1.5 text-sm text-pulvis-cream hover:text-pulvis-gold"
        >
          <Navigation className="h-4 w-4" />
          Itinéraire
        </button>
      </div>
    </div>
  )
}
