import { useParams, Link, Navigate } from 'react-router-dom'
import { Droplet, MapPin, Gauge, Clock3 } from 'lucide-react'
import { getPerfumeBySlug, perfumes } from '../data/perfumes'
import { stations } from '../data/stations'
import PlaceholderImage from '../components/PlaceholderImage'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ScrollReveal from '../components/ScrollReveal'
import SectionTitle from '../components/SectionTitle'
import PerfumeCard from '../components/PerfumeCard'

export default function PerfumeDetail() {
  const { slug } = useParams<{ slug: string }>()
  const perfume = getPerfumeBySlug(slug ?? '')

  if (!perfume) {
    return <Navigate to="/parfums" replace />
  }

  const availableStations = stations.filter((s) => s.perfumeSlugs.includes(perfume.slug))
  const otherPerfumes = perfumes.filter((p) => p.slug !== perfume.slug).slice(0, 3)

  return (
    <div>
      <section className="border-b border-white/10">
        <div className="container-pulvis grid grid-cols-1 gap-10 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <ScrollReveal>
            <PlaceholderImage
              label={perfume.name}
              icon={Droplet}
              className="aspect-[4/5] w-full rounded-2xl"
            />
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Badge tone="muted">{perfume.profile}</Badge>
              <Badge>{perfume.familyLabel}</Badge>
            </div>
            <h1 className="font-serif text-5xl font-medium text-pulvis-cream sm:text-6xl">
              {perfume.name}
            </h1>
            <p className="font-serif text-xl italic text-pulvis-gold sm:text-2xl">
              « {perfume.tagline} »
            </p>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              {perfume.description}
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button to="/trouver-pulvis" size="lg" icon={<MapPin className="h-4 w-4" />}>
                Trouver {perfume.name} près de moi
              </Button>
              <Button to="/parfums" variant="secondary" size="lg">
                Voir tous les parfums
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="container-pulvis grid grid-cols-1 gap-10 lg:grid-cols-3">
          <ScrollReveal className="flex flex-col gap-4">
            <span className="eyebrow">Pyramide olfactive</span>
            <div className="flex flex-col gap-4">
              <NoteRow label="Notes de tête" notes={perfume.notesTop} />
              <NoteRow label="Notes de cœur" notes={perfume.notesHeart} />
              <NoteRow label="Notes de fond" notes={perfume.notesBase} />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="flex flex-col gap-4">
            <span className="eyebrow">Profil</span>
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
              <div className="flex items-center gap-3 text-sm text-pulvis-cream">
                <Gauge className="h-4 w-4 text-pulvis-gold" />
                Intensité — {perfume.intensity}
              </div>
              <div className="flex items-center gap-3 text-sm text-pulvis-cream">
                <Droplet className="h-4 w-4 text-pulvis-gold" />
                Famille — {perfume.familyLabel}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.16} className="flex flex-col gap-4">
            <span className="eyebrow">Moments recommandés</span>
            <ul className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
              {perfume.moments.map((moment) => (
                <li key={moment} className="flex items-center gap-3 text-sm text-pulvis-muted">
                  <Clock3 className="h-4 w-4 shrink-0 text-pulvis-gold" />
                  {moment}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="container-pulvis flex flex-col gap-8">
          <SectionTitle
            eyebrow="Disponibilité"
            title={`Stations où ${perfume.name} est disponible`}
          />
          {availableStations.length === 0 ? (
            <p className="text-sm text-pulvis-muted">
              Ce parfum n'est pas encore disponible sur une station. Consultez le localisateur pour
              découvrir les fragrances proposées près de chez vous.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {availableStations.map((station) => (
                <Link
                  key={station.id}
                  to={`/station/${station.id}`}
                  className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 bg-pulvis-bgLight px-5 py-4 transition-colors hover:border-pulvis-gold/40 sm:flex-row sm:items-center"
                >
                  <span className="text-sm text-pulvis-cream">{station.name}</span>
                  <span className="text-xs uppercase tracking-widest2 text-pulvis-muted">
                    {station.address}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-pulvis flex flex-col gap-8">
          <SectionTitle eyebrow="Découvrir aussi" title="D'autres fragrances PULVIS" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {otherPerfumes.map((p, i) => (
              <ScrollReveal key={p.slug} delay={i * 0.08}>
                <PerfumeCard perfume={p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function NoteRow({ label, notes }: { label: string; notes: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
      <p className="mb-2 text-xs uppercase tracking-widest2 text-pulvis-gold">{label}</p>
      <p className="text-sm text-pulvis-cream">{notes.join(', ')}</p>
    </div>
  )
}
