import {
  ArrowRight,
  CreditCard,
  Droplet,
  Footprints,
  MousePointerClick,
  Radar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Unlock,
  Wrench,
} from 'lucide-react'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import CTASection from '../components/CTASection'
import Badge from '../components/Badge'
import FragranceCard from '../components/FragranceCard'
import { pulvisTakesCare, establishmentProvides } from '../data/rolesSplit'
import { fragrances } from '../data/fragrances'
import { usePageMeta } from '../hooks/usePageMeta'

const journey = [
  {
    number: '01',
    icon: Droplet,
    title: 'Choisir',
    description: 'L’adhérent sélectionne la fragrance qu’il souhaite utiliser.',
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Régler',
    description: 'Le paiement sans contact s’effectue directement depuis la station.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Utiliser',
    description: 'L’adhérent accède à ses pulvérisations en quelques secondes.',
  },
  {
    number: '04',
    icon: Footprints,
    title: 'Repartir',
    description: 'Il poursuit sa journée avec la fragrance choisie.',
  },
]

const experience = [
  { icon: Droplet, label: '5 fragrances' },
  { icon: MousePointerClick, label: 'Interface tactile' },
  { icon: CreditCard, label: 'Paiement sans contact' },
  { icon: Unlock, label: 'Libre-service' },
  { icon: Radar, label: 'Supervision à distance' },
  { icon: Wrench, label: 'Installation et maintenance PULVIS' },
]

const exploitation = [
  {
    icon: Wrench,
    title: 'Installation',
    description: 'Chaque emplacement est étudié avant installation pour intégrer la station de manière cohérente.',
  },
  {
    icon: RefreshCw,
    title: 'Réapprovisionnement',
    description: 'PULVIS assure le suivi des stocks et le réapprovisionnement des fragrances.',
  },
  {
    icon: Radar,
    title: 'Suivi',
    description: 'PULVIS suit le fonctionnement de ses stations à distance pour assurer la continuité du service.',
  },
  {
    icon: ShieldCheck,
    title: 'Maintenance',
    description: 'Nos équipes entretiennent chaque station installée dans la durée.',
  },
]

export default function LaStation() {
  usePageMeta(
    'PULVIS — La station de parfum en libre-service',
    'Découvrez la Station PULVIS : une expérience parfumée en libre-service pensée pour les salles de sport et entièrement exploitée par PULVIS.',
  )

  return (
    <div>
      <section className="border-b border-white/10">
        <div className="container-pulvis grid grid-cols-1 gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">La station</span>
            <h1 className="max-w-xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              L’expérience PULVIS, en libre-service.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Une station pensée pour permettre aux adhérents d’accéder simplement à une
              sélection de fragrances avant de poursuivre leur journée.
            </p>
            <div className="pt-2">
              <Button to="/devenir-partenaire" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Devenir établissement partenaire
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Station PULVIS en libre-service"
              icon={Droplet}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* La Sélection PULVIS */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <SectionTitle
              eyebrow="La Sélection PULVIS"
              title="Cinq fragrances. Une sélection pensée pour l’instant d’après."
              description="Pour la première installation, la station PULVIS donne accès à une sélection de cinq fragrances. Chaque signature a été pensée pour proposer un choix simple, élégant et immédiatement identifiable."
            />
            <ScrollReveal>
              <Badge>2 pulvérisations — 1 €</Badge>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fragrances.map((fragrance, i) => (
              <ScrollReveal key={fragrance.slug} delay={(i % 3) * 0.08}>
                <FragranceCard fragrance={fragrance} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parcours utilisateur */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Parcours utilisateur" title="Compris en quelques secondes." />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.08}>
                <div className="flex flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <step.icon className="h-5 w-5" strokeWidth={1.4} />
                  </div>
                  <span className="text-xs uppercase tracking-widest2 text-pulvis-gold">
                    {step.number}
                  </span>
                  <h3 className="font-serif text-xl text-pulvis-cream">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-pulvis-muted">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Caractéristiques de l'expérience */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="En un coup d’œil" title="Caractéristiques de l’expérience" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {experience.map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 0.05}>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-pulvis-bg px-4 py-8 text-center">
                  <item.icon className="h-6 w-6 text-pulvis-gold" strokeWidth={1.4} />
                  <span className="text-sm text-pulvis-cream">{item.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Exploitation */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Exploitation" title="PULVIS s’occupe de l’exploitation." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {exploitation.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.06}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <item.icon className="h-5 w-5" strokeWidth={1.4} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-xl text-pulvis-cream">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-pulvis-muted">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pour l'établissement */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-14">
          <SectionTitle
            eyebrow="Répartition des rôles"
            title="Un nouveau service, sans nouvelle gestion quotidienne."
            align="center"
            className="mx-auto"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ScrollReveal className="flex flex-col gap-5 rounded-2xl border border-pulvis-gold/30 bg-pulvis-bg p-8">
              <span className="eyebrow">PULVIS prend en charge</span>
              <ul className="flex flex-col gap-3">
                {pulvisTakesCare.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-pulvis-cream sm:text-base">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pulvis-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.08} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-pulvis-bg p-8">
              <span className="eyebrow">Votre établissement</span>
              <ul className="flex flex-col gap-3">
                {establishmentProvides.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-pulvis-cream sm:text-base">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-pulvis-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pensée pour l'expérience adhérent */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">L’expérience adhérent</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Pensée pour le moment d’après.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Après une séance, certains adhérents repartent travailler, rejoignent un
              rendez-vous ou poursuivent simplement leur journée. PULVIS leur permet d’ajouter
              une touche parfumée avant de quitter le club.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Adhérent utilisant la Station PULVIS après sa séance"
              icon={Sparkles}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      <CTASection
        title="Et si PULVIS trouvait sa place dans votre établissement ?"
        description="Nous étudions chaque emplacement avant installation."
        buttonLabel="Devenir établissement partenaire"
        buttonTo="/devenir-partenaire"
        secondaryLabel="Découvrir le fonctionnement"
        secondaryTo="/comment-ca-fonctionne"
      />
    </div>
  )
}
