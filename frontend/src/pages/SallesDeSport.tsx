import { ArrowRight, Dumbbell } from 'lucide-react'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import Accordion from '../components/Accordion'
import CTASection from '../components/CTASection'
import { benefits } from '../data/benefits'
import { partnerSteps } from '../data/steps'
import { pulvisTakesCare, establishmentProvides } from '../data/rolesSplit'
import { usePageMeta } from '../hooks/usePageMeta'

const journeySteps = [
  'L’adhérent termine sa séance et passe par les vestiaires.',
  'Il repère la station PULVIS et choisit un parfum dans la sélection proposée.',
  'Il paye directement sur la station, sans application ni compte.',
  'Il repart parfumé, prêt à enchaîner sur le reste de sa journée.',
]

const clubFaq = [
  {
    question: 'Quel investissement financier pour mon club ?',
    answer:
      'Aucun. PULVIS prend en charge la station, son installation, les parfums, le réapprovisionnement, la maintenance et les paiements.',
  },
  {
    question: 'Est-ce que je dois gérer la station au quotidien ?',
    answer:
      'Non. Votre établissement accueille la station et met à disposition un emplacement adapté. PULVIS s’occupe du reste.',
  },
  {
    question: 'Mon club reçoit-il une commission sur les ventes ?',
    answer:
      'Le modèle PULVIS ne prévoit actuellement aucune commission reversée à l’établissement. La station et son exploitation restent entièrement gérées par PULVIS. Votre club bénéficie en retour d’un nouveau service pour ses adhérents et d’une image premium, sans gestion opérationnelle.',
  },
]

export default function SallesDeSport() {
  usePageMeta(
    'Pour les salles de sport',
    'PULVIS installe des stations de parfum premium dans les salles de sport, pour une nouvelle expérience adhérent sans gestion opérationnelle.',
  )

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <PlaceholderImage
          label="Salle de sport moderne avec station PULVIS"
          icon={Dumbbell}
          tone="deep"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pulvis-bg via-pulvis-bg/70 to-pulvis-bg/40" />

        <div className="container-pulvis relative z-10 flex flex-col gap-6 py-24 sm:py-32">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Pour les salles de sport</span>
            <h1 className="max-w-2xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              Une nouvelle attention pour vos adhérents.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Après l’effort, PULVIS ajoute la touche parfumée avant de repartir — un service
              premium, intégré à l’expérience de votre club, sans gestion opérationnelle de votre
              part.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button to="/devenir-partenaire" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Devenir établissement partenaire
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pourquoi dans une salle de sport */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Pourquoi PULVIS dans une salle de sport</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Le sport se termine, la journée continue.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Vos adhérents repartent travailler, à un rendez-vous, ou simplement poursuivre leur
              journée. Votre club propose déjà vestiaires, douches et espaces de préparation.
              PULVIS complète cette expérience avec un service directement accessible sur place.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Vestiaire premium avec station PULVIS"
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Fonctionnement de la station */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="Fonctionnement de la station"
            title="De la séance à la sortie du club."
          />
          <div className="flex flex-col gap-6">
            {journeySteps.map((step, i) => (
              <ScrollReveal key={step} delay={i * 0.06}>
                <div className="flex items-start gap-5 border-b border-white/10 pb-6 last:border-none">
                  <span className="font-serif text-2xl text-pulvis-gold/60">{`0${i + 1}`}</span>
                  <p className="pt-1 text-sm leading-relaxed text-pulvis-cream sm:text-base">{step}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bénéfices pour le club */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="Bénéfices pour le club"
            title="Un positionnement premium, une différenciation claire."
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

      {/* Ce que PULVIS prend en charge */}
      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Répartition des rôles" title="Ce que PULVIS prend en charge." />
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
              <span className="eyebrow">Votre club</span>
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

      {/* Parcours d'installation */}
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="Parcours d’installation"
            title="Simple, rapide, rassurant."
            description="De l’échange initial à l’exploitation quotidienne de la station dans votre club."
          />
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

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-10">
          <SectionTitle eyebrow="Questions fréquentes" title="Ce que les clubs nous demandent" />
          <Accordion items={clubFaq} />
        </div>
      </section>

      <CTASection
        title="Offrez ce service à vos adhérents."
        description="Étudions ensemble la pertinence d’une installation PULVIS dans votre club."
        buttonLabel="Devenir établissement partenaire"
        buttonTo="/devenir-partenaire"
      />
    </div>
  )
}
