import { ArrowRight, CreditCard, Droplet, Sparkles } from 'lucide-react'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import FragranceCard from '../components/FragranceCard'
import CTASection from '../components/CTASection'
import Badge from '../components/Badge'
import { fragrances } from '../data/fragrances'
import { pulvisTakesCare, establishmentProvides } from '../data/rolesSplit'
import { usePageMeta } from '../hooks/usePageMeta'

const usageSteps = [
  {
    number: '01',
    icon: Droplet,
    title: 'Choisir',
    description: 'L’adhérent sélectionne sa fragrance.',
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Régler',
    description: 'Le paiement s’effectue directement sur la station.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Profiter',
    description: 'Quelques secondes suffisent pour repartir avec la fragrance choisie.',
  },
]

const whyPulvis = [
  {
    title: 'Expérience adhérent',
    description: 'Une attention supplémentaire intégrée au parcours du club.',
  },
  {
    title: 'Service clé en main',
    description: 'PULVIS prend en charge l’installation et l’exploitation.',
  },
  {
    title: 'Sélection maîtrisée',
    description: 'Une sélection de fragrances pensée pour une utilisation simple et immédiate.',
  },
]

export default function Home() {
  usePageMeta(
    'PULVIS — Station de parfum premium pour salles de sport',
    'PULVIS installe et exploite des stations de parfum en libre-service dans les salles de sport pour enrichir l’expérience adhérent.',
  )

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden border-b border-white/10 sm:min-h-screen">
        <PlaceholderImage
          label="Station PULVIS dans une salle de sport"
          icon={Sparkles}
          tone="deep"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pulvis-bg via-pulvis-bg/60 to-transparent" />

        <div className="container-pulvis relative z-10 flex flex-col gap-6 pb-16 pt-32 sm:pb-24">
          <span className="eyebrow animate-fadeUp" style={{ animationDelay: '0.05s' }}>
            Stations de parfum en libre-service
          </span>
          <h1
            className="max-w-3xl animate-fadeUp font-serif text-5xl font-medium leading-[1.05] text-pulvis-cream opacity-0 sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '0.15s' }}
          >
            Le parfum devient un service.
          </h1>
          <p
            className="max-w-xl animate-fadeUp text-base leading-relaxed text-pulvis-muted opacity-0 sm:text-lg"
            style={{ animationDelay: '0.3s' }}
          >
            PULVIS installe et exploite des stations de parfum en libre-service dans les salles de
            sport pour offrir aux adhérents une nouvelle attention après leur séance.
          </p>
          <div
            className="flex animate-fadeUp flex-col gap-3 pt-2 opacity-0 sm:flex-row"
            style={{ animationDelay: '0.45s' }}
          >
            <Button to="/devenir-partenaire" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              Devenir établissement partenaire
            </Button>
            <Button to="/le-concept" variant="secondary" size="lg">
              Découvrir le concept
            </Button>
          </div>
        </div>
      </section>

      {/* Après la séance */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Après la séance</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Le dernier détail avant de repartir.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Après l’entraînement, les adhérents poursuivent leur journée : travail, rendez-vous,
              sorties ou déplacements. PULVIS leur donne accès à une expérience parfumée
              directement dans leur club.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Vestiaire de salle de sport"
              icon={Droplet}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-14">
          <SectionTitle
            eyebrow="Comment ça fonctionne"
            title="Un geste simple, immédiat."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {usageSteps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.1}>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <step.icon className="h-6 w-6" strokeWidth={1.4} />
                  </div>
                  <span className="text-xs uppercase tracking-widest2 text-pulvis-gold">
                    {step.number}
                  </span>
                  <h3 className="font-serif text-2xl text-pulvis-cream">{step.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-pulvis-muted">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="flex justify-center">
            <Button
              to="/comment-ca-fonctionne"
              variant="ghost"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Voir comment ça fonctionne
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Pour le club */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-14">
          <SectionTitle
            eyebrow="Pour le club"
            title="Un nouveau service, sans nouvelle gestion quotidienne."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ScrollReveal className="flex flex-col gap-5 rounded-2xl border border-pulvis-gold/30 bg-pulvis-bgLight p-8">
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

            <ScrollReveal delay={0.08} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-pulvis-bgLight p-8">
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

      {/* La Sélection PULVIS */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="La Sélection PULVIS"
            title="Des fragrances premium, pensées pour l’expérience."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {fragrances.slice(0, 3).map((fragrance, i) => (
              <ScrollReveal key={fragrance.slug} delay={i * 0.08}>
                <FragranceCard fragrance={fragrance} compact />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="flex justify-center">
            <Button to="/la-station" variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>
              Découvrir les 5 fragrances
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Pourquoi PULVIS */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Pourquoi PULVIS" title="Trois raisons de déployer PULVIS." />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {whyPulvis.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className="flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
                  <h3 className="font-serif text-xl text-pulvis-cream">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-pulvis-muted">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Zone de déploiement */}
      <section className="py-20 sm:py-28">
        <div className="container-pulvis flex flex-col items-center gap-6 text-center">
          <ScrollReveal className="flex flex-col items-center gap-5">
            <Badge>Déploiement actuel — Île-de-France</Badge>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              PULVIS déploie actuellement ses premières stations auprès d’établissements
              partenaires en Île-de-France.
            </p>
            <Button to="/devenir-partenaire" icon={<ArrowRight className="h-4 w-4" />}>
              Étudier mon établissement
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <CTASection
        title="Et si PULVIS trouvait sa place dans votre club ?"
        description="Nous étudions chaque établissement avant installation."
        buttonLabel="Devenir établissement partenaire"
        buttonTo="/devenir-partenaire"
        secondaryLabel="Découvrir le fonctionnement"
        secondaryTo="/comment-ca-fonctionne"
      />
    </>
  )
}
