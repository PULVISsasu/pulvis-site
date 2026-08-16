import { CreditCard, ShieldCheck, Wifi, Wrench, Droplet, LifeBuoy } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import CTASection from '../components/CTASection'
import { usePageMeta } from '../hooks/usePageMeta'

const specs = [
  { label: 'Nombre de parfums', value: '5 fragrances par station' },
  { label: 'Terminal de paiement', value: 'Paiement sans contact — carte bancaire' },
  {
    label: 'Dimensions, alimentation, connectivité',
    value: 'Informations techniques communiquées lors de l’étude de votre emplacement.',
  },
]

const pillars = [
  {
    icon: Droplet,
    title: 'Une sélection premium',
    description: 'Cinq fragrances soigneusement sélectionnées, présentées directement sur la station.',
  },
  {
    icon: CreditCard,
    title: 'Paiement sans contact',
    description: 'Carte bancaire, sans application ni compte à créer.',
  },
  {
    icon: Wifi,
    title: 'Connectée',
    description: 'Chaque station transmet ses événements à PULVIS pour un suivi à distance.',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurisée',
    description: 'Les paiements et l’accès aux fragrances sont gérés de bout en bout par PULVIS.',
  },
  {
    icon: Wrench,
    title: 'Maintenue à distance et sur site',
    description: 'Suivi technique continu, complété par des interventions terrain si nécessaire.',
  },
  {
    icon: LifeBuoy,
    title: 'Assistance PULVIS',
    description: 'Une équipe dédiée au suivi de chaque station installée.',
  },
]

export default function LaStation() {
  usePageMeta(
    'La station',
    'Découvrez la station PULVIS : sélection de parfums, paiement sans contact, technologie connectée et maintenance assurée.',
  )

  return (
    <div>
      <section className="border-b border-white/10">
        <div className="container-pulvis grid grid-cols-1 gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">La station</span>
            <h1 className="max-w-xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              Une présence sobre, une technologie discrète.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              La station PULVIS est conçue pour s’intégrer visuellement dans des établissements
              modernes, tout en restant simple d’utilisation pour vos adhérents.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Station PULVIS — vue d’ensemble"
              icon={Droplet}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Caractéristiques" title="Ce qu’il faut savoir sur la station" />
          <div className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-pulvis-bg">
            {specs.map((spec) => (
              <div key={spec.label} className="flex flex-col gap-1.5 p-6">
                <span className="text-xs uppercase tracking-widest2 text-pulvis-gold">{spec.label}</span>
                <span className="text-sm text-pulvis-cream sm:text-base">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Technologie" title="Pensée pour l’usage et pour la fiabilité." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 0.06}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                    <pillar.icon className="h-5 w-5" strokeWidth={1.4} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-xl text-pulvis-cream">{pillar.title}</h3>
                    <p className="text-sm leading-relaxed text-pulvis-muted">{pillar.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Une station adaptée à votre établissement"
        description="Chaque installation fait l’objet d’une étude préalable de l’emplacement le plus pertinent."
        buttonLabel="Devenir établissement partenaire"
        buttonTo="/devenir-partenaire"
      />
    </div>
  )
}
