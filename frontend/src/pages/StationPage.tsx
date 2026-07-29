import { useParams, Navigate } from 'react-router-dom'
import { MapPin, Clock, Navigation, LifeBuoy, Hash, Droplet, CreditCard, Sparkles } from 'lucide-react'
import { getStationById } from '../data/stations'
import { perfumes } from '../data/perfumes'
import PlaceholderImage from '../components/PlaceholderImage'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ScrollReveal from '../components/ScrollReveal'
import PerfumeCard from '../components/PerfumeCard'

const usage = [
  { icon: Droplet, text: 'Choisissez votre parfum sur l\'écran de la station.' },
  { icon: CreditCard, text: 'Payez 1 € par carte ou mobile sans contact.' },
  { icon: Sparkles, text: 'Placez-vous devant la buse pour vos deux pulvérisations.' },
]

export default function StationPage() {
  const { stationId } = useParams<{ stationId: string }>()
  const station = getStationById(stationId ?? '')

  if (!station) {
    return <Navigate to="/trouver-pulvis" replace />
  }

  const availablePerfumes = perfumes.filter((p) => station.perfumeSlugs.includes(p.slug))
  const isAvailable = station.status === 'Disponible'

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <PlaceholderImage
          label={`Station ${station.stationNumber}`}
          icon={MapPin}
          tone="deep"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pulvis-bg via-pulvis-bg/70 to-pulvis-bg/30" />

        <div className="container-pulvis relative z-10 flex flex-col gap-5 py-20 sm:py-28">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={isAvailable ? 'success' : 'warning'}>{station.status}</Badge>
            <Badge tone="muted">
              <Hash className="h-3 w-3" />
              {station.stationNumber}
            </Badge>
          </div>
          <span className="eyebrow">{station.type}</span>
          <h1 className="max-w-2xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
            {station.name}
          </h1>
          <div className="flex flex-col gap-2 text-sm text-pulvis-muted sm:flex-row sm:items-center sm:gap-6">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pulvis-gold" />
              {station.address}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-pulvis-gold" />
              {station.hours}
            </span>
          </div>
          <div className="flex flex-col gap-3 pt-3 sm:flex-row">
            <Button to="/aide" size="lg" icon={<LifeBuoy className="h-4 w-4" />}>
              Signaler un problème
            </Button>
            <Button variant="secondary" size="lg" icon={<Navigation className="h-4 w-4" />}>
              Itinéraire
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="container-pulvis flex flex-col gap-8">
          <span className="eyebrow">Parfums disponibles sur cette station</span>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availablePerfumes.map((perfume, i) => (
              <ScrollReveal key={perfume.slug} delay={i * 0.08}>
                <PerfumeCard perfume={perfume} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-pulvis flex flex-col gap-8">
          <span className="eyebrow">Mode d'emploi</span>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {usage.map((step, i) => (
              <ScrollReveal key={step.text} delay={i * 0.08}>
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <step.icon className="h-4.5 w-4.5" strokeWidth={1.4} />
                  </div>
                  <p className="text-sm leading-relaxed text-pulvis-cream">{step.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
