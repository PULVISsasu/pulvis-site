import { ArrowRight, CreditCard, Droplet, Sparkles, PackageCheck } from 'lucide-react'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import FragranceCard from '../components/FragranceCard'
import CTASection from '../components/CTASection'
import EligibilityCheck from '../components/EligibilityCheck'
import { fragrances } from '../data/fragrances'
import { benefits } from '../data/benefits'
import { partnerSteps } from '../data/steps'
import { pulvisTakesCare, establishmentProvides } from '../data/rolesSplit'
import { usePageMeta } from '../hooks/usePageMeta'

const userJourney = [
  {
    icon: Droplet,
    title: 'Choisir',
    description: 'L’adhérent sélectionne un parfum parmi la sélection proposée par la station.',
  },
  {
    icon: CreditCard,
    title: 'Payer',
    description: 'Le paiement s’effectue directement sur la station, sans application ni compte.',
  },
  {
    icon: Sparkles,
    title: 'Repartir',
    description: 'La station se prépare en quelques secondes. L’adhérent repart parfumé.',
  },
]

export default function Home() {
  usePageMeta(
    'PULVIS — Station de parfum premium pour salles de sport',
    'PULVIS installe des stations de parfum premium en libre-service dans les salles de sport et prend en charge leur exploitation.',
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
            PULVIS installe des stations de parfum premium en libre-service dans les salles de
            sport et prend en charge leur exploitation.
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

      {/* Le besoin */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Le constat</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Après l’effort, la journée continue.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Certains adhérents repartent travailler, se rendent à un rendez-vous ou poursuivent
              simplement leur journée après leur séance. Votre établissement propose déjà
              vestiaires, douches et espaces de préparation.
            </p>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              PULVIS ajoute la touche parfumée avant de repartir.
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

      {/* La solution */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-14">
          <SectionTitle
            eyebrow="La solution"
            title="Une station premium, en libre-service."
            description="Une sélection de parfums accessible directement depuis une station installée dans votre établissement."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {userJourney.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 0.1}>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <step.icon className="h-6 w-6" strokeWidth={1.4} />
                  </div>
                  <h3 className="font-serif text-2xl text-pulvis-cream">{step.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-pulvis-muted">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi installer PULVIS */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="Pourquoi installer PULVIS"
            title="Un service premium, sans gestion opérationnelle."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <ScrollReveal key={benefit.title} delay={i * 0.06}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <benefit.icon className="h-5 w-5" strokeWidth={1.4} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-xl text-pulvis-cream">{benefit.title}</h3>
                    <p className="text-sm leading-relaxed text-pulvis-muted">{benefit.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PULVIS s'occupe de tout */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-14">
          <SectionTitle
            eyebrow="Répartition des rôles"
            title="PULVIS s’occupe de tout."
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

      {/* Comment ça fonctionne (teaser) */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Le processus"
              title="Simple, rapide, rassurant."
              description="De l’échange initial à l’exploitation quotidienne, un parcours pensé pour votre établissement."
            />
            <Button
              to="/comment-ca-fonctionne"
              variant="ghost"
              icon={<ArrowRight className="h-4 w-4" />}
              className="shrink-0"
            >
              Voir le détail
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {partnerSteps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.08}>
                <div className="flex flex-col gap-4">
                  <span className="font-serif text-4xl text-pulvis-gold/60">{step.number}</span>
                  <h3 className="font-serif text-xl text-pulvis-cream">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-pulvis-muted">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parfums */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="La Sélection PULVIS"
            title="Des fragrances premium, pensées pour l’expérience."
            description="Un aperçu de la sélection proposée sur les stations PULVIS."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fragrances.slice(0, 3).map((fragrance, i) => (
              <ScrollReveal key={fragrance.slug} delay={(i % 3) * 0.08}>
                <FragranceCard fragrance={fragrance} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* La donnée */}
      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <PlaceholderImage
              label="Tendances d’utilisation d’une station PULVIS"
              icon={PackageCheck}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="flex flex-col gap-6">
            <span className="eyebrow">La donnée</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Une sélection qui peut évoluer avec les usages.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              PULVIS peut analyser les préférences d’utilisation de ses stations afin d’améliorer
              progressivement l’expérience proposée : parfums les plus appréciés, tendances
              d’utilisation, disponibilité de la station.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Éligibilité */}
      <section className="py-20 sm:py-28">
        <div className="container-pulvis flex flex-col gap-10">
          <SectionTitle
            eyebrow="Éligibilité"
            title="Votre établissement est-il adapté à PULVIS ?"
            align="center"
            className="mx-auto"
          />
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-pulvis-bgLight p-6 sm:p-10">
            <EligibilityCheck />
          </div>
        </div>
      </section>

      <CTASection
        title="Votre établissement mérite ce service."
        description="Devenez établissement partenaire PULVIS et offrez une nouvelle expérience à vos adhérents."
        buttonLabel="Devenir établissement partenaire"
        buttonTo="/devenir-partenaire"
      />
    </>
  )
}
