import { Wrench, PackageCheck, CreditCard, Rocket, ArrowRight } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import Button from '../components/Button'
import PlaceholderImage from '../components/PlaceholderImage'

const benefits = [
  {
    icon: Wrench,
    title: 'Installation clé en main',
    description: 'Nous prenons en charge la pose et la mise en service de la station.',
  },
  {
    icon: PackageCheck,
    title: 'Réapprovisionnement inclus',
    description: 'Le remplissage des parfums est assuré par nos équipes, sans intervention de votre part.',
  },
  {
    icon: CreditCard,
    title: 'Gestion des paiements',
    description: 'Encaissement et suivi des transactions entièrement gérés par PULVIS.',
  },
  {
    icon: Rocket,
    title: 'Phase pilote possible',
    description: 'Testez PULVIS dans votre établissement avant tout engagement long terme.',
  },
]

export default function Professionals() {
  return (
    <div>
      <section className="border-b border-white/10">
        <div className="container-pulvis grid grid-cols-1 gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Professionnels</span>
            <h1 className="font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              Proposer PULVIS dans votre établissement
            </h1>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Une prestation clé en main, pensée pour ne demander aucune gestion quotidienne de
              votre part : installation, maintenance, réapprovisionnement et paiements sont
              entièrement pris en charge par PULVIS.
            </p>
            <Button to="/aide" size="lg" icon={<ArrowRight className="h-4 w-4" />} className="w-fit">
              Demander une présentation
            </Button>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Station PULVIS installée en établissement"
              icon={PackageCheck}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle
            eyebrow="Notre engagement"
            title="Aucune gestion quotidienne pour vous."
            description="PULVIS s'occupe de tout, du premier jour d'installation au suivi opérationnel de la station."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {benefits.map((benefit, i) => (
              <ScrollReveal key={benefit.title} delay={i * 0.06}>
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
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

          <ScrollReveal className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight px-6 py-14 text-center">
            <h2 className="font-serif text-2xl text-pulvis-cream sm:text-3xl">
              Envie d'échanger sur votre établissement ?
            </h2>
            <p className="max-w-md text-sm text-pulvis-muted">
              Décrivez-nous votre lieu, nous reviendrons vers vous pour évaluer la pertinence
              d'une installation PULVIS.
            </p>
            <Button to="/aide" icon={<ArrowRight className="h-4 w-4" />}>
              Demander une présentation
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
